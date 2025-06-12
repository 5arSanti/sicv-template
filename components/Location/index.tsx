import { globalStyles } from '@/constants/Styles';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { JsonViewer } from '../JsonViewer';
import { PermissionCard } from '../PermissionCard';
import { ThemedView } from '../ThemedView';

export interface LocationInterface {
    // Provider Status
    provider: Location.LocationProviderStatus;
    
    // Current Location Data
    currentPosition: Location.LocationObject | null;
    lastKnownPosition: Location.LocationObject | null;
    
    // Heading Information
    heading: {
        magHeading: number;
        trueHeading: number;
        accuracy: number;
    } | null;
    
    // Geocoding Information
    address?: Location.LocationGeocodedAddress[];
    currentAddress?: Location.LocationGeocodedAddress[];
    
    // Activity Information
    activity?: {
        type: 'Automotive' | 'Other';
        confidence: number;
    } | null;
    
    // Motion Information
    motion?: {
        isMoving: boolean;
        speed: number;
        speedAccuracy: number;
    } | null;
    
    // Altitude Information
    altitude?: {
        altitude: number;
        altitudeAccuracy: number;
    } | null;
    
    // Status Information
    isTracking: boolean;
    isHighAccuracy: boolean;
    timestamp: number | null;
}

export const LocationCard = () => {
    const [locationData, setLocationData] = useState<LocationInterface>({
        provider: { 
            locationServicesEnabled: false, 
            gpsAvailable: false, 
            networkAvailable: false,
            backgroundModeEnabled: false
        },
        currentPosition: null,
        lastKnownPosition: null,
        heading: null,
        address: undefined,
        currentAddress: undefined,
        activity: null,
        motion: null,
        altitude: null,
        isTracking: false,
        isHighAccuracy: false,
        timestamp: null
    });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);

    const [foregroundPermission, requestForegroundPermission] = Location.useForegroundPermissions();
    const [backgroundPermission, requestBackgroundPermission] = Location.useBackgroundPermissions();

    const watcherRef = useRef<Location.LocationSubscription | null>(null);
    const headingWatcherRef = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        foregroundPermission?.granted && backgroundPermission?.granted && setHasPermission(true);
    }, [foregroundPermission, backgroundPermission]);

    useEffect(() => {
        async function checkPermissions() {
            const fg = await requestForegroundPermission();
            if (!fg.granted) {
                setErrorMsg('Permiso de ubicación en primer plano denegado');
                return;
            }
            const bg = await requestBackgroundPermission();
            if (!bg.granted) console.warn('Permiso de ubicación en segundo plano denegado');
        }
        checkPermissions();
    }, []);

    useEffect(() => {
        const startLocationTracking = async () => {
            try {
                const provider = await Location.getProviderStatusAsync();
                setLocationData(prev => ({ ...prev, provider }));

                // Start position tracking with high accuracy
                watcherRef.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.BestForNavigation,
                        timeInterval: 1000,
                        distanceInterval: 1,
                        mayShowUserSettingsDialog: true,
                    },
                    async (loc) => {
                        // Get current address
                        const currentAddress = await Location.reverseGeocodeAsync(loc.coords);
                        
                        // Get activity if available
                        const activity = await Location.getCurrentPositionAsync({
                            accuracy: Location.Accuracy.BestForNavigation,
                        }).then(pos => ({
                            type: pos.coords.heading ? 'Automotive' as const : 'Other' as const,
                            confidence: 1
                        })).catch(() => null);

                        setLocationData(prev => ({
                            ...prev,
                            currentPosition: loc,
                            currentAddress,
                            activity,
                            motion: {
                                isMoving: loc.coords.speed ? loc.coords.speed > 0 : false,
                                speed: loc.coords.speed || 0,
                                speedAccuracy: 0
                            },
                            altitude: {
                                altitude: loc.coords.altitude || 0,
                                altitudeAccuracy: loc.coords.altitudeAccuracy || 0
                            },
                            isTracking: true,
                            isHighAccuracy: true,
                            timestamp: loc.timestamp
                        }));
                    }
                );

                // Start heading tracking
                headingWatcherRef.current = await Location.watchHeadingAsync((head) => {
                    setLocationData(prev => ({
                        ...prev,
                        heading: head
                    }));
                });

                // Get last known position and reverse geocode
                const last = await Location.getLastKnownPositionAsync();
                if (last) {
                    const addr = await Location.reverseGeocodeAsync(last.coords);
                    setLocationData(prev => ({
                        ...prev,
                        lastKnownPosition: last,
                        address: addr
                    }));
                }
            } catch (error) {
                setErrorMsg(`Error al iniciar el seguimiento: ${error}`);
            }
        };

        if (hasPermission) {
            startLocationTracking();
        }

        return () => {
            watcherRef.current?.remove();
            headingWatcherRef.current?.remove();
            setLocationData(prev => ({ ...prev, isTracking: false }));
        };
    }, [hasPermission]);

    return (
        <ThemedView style={globalStyles.stepContainer}>
            <PermissionCard
                permission={foregroundPermission}
                requestPermission={requestForegroundPermission}
                title="Permiso de Ubicación"
                description="Necesitamos permiso para acceder a tu ubicación"
                onGranted={async () => {
                    setHasPermission(true);
                    await Location.enableNetworkProviderAsync();
                }}
            />

            {errorMsg && <JsonViewer data={{ error: errorMsg }} title="Error" />}

            {locationData && (
                <JsonViewer data={locationData} title="Datos de Ubicación en Tiempo Real" />
            )}
        </ThemedView>
    );
};
