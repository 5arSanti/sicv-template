import { globalStyles } from '@/constants/Styles';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { JsonViewer } from '../JsonViewer';
import { PermissionCard } from '../PermissionCard';
import { ThemedText } from '../ThemedText';
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
    const [isMonitoring, setIsMonitoring] = useState(false);

    const [foregroundPermission, requestForegroundPermission] = Location.useForegroundPermissions();
    const [backgroundPermission, requestBackgroundPermission] = Location.useBackgroundPermissions();

    const watcherRef = useRef<Location.LocationSubscription | null>(null);
    const headingWatcherRef = useRef<Location.LocationSubscription | null>(null);

    const stopTracking = () => {
        watcherRef.current?.remove();
        headingWatcherRef.current?.remove();
        watcherRef.current = null;
        headingWatcherRef.current = null;
        setIsMonitoring(false);
        setLocationData(prev => ({ ...prev, isTracking: false }));
    };

    const startTracking = async () => {
        try {
            const provider = await Location.getProviderStatusAsync();
            setLocationData(prev => ({ ...prev, provider }));

            const locationOptions = {
                accuracy: Location.Accuracy.High,
                timeInterval: 500,
                distanceInterval: 0,
                mayShowUserSettingsDialog: true,
            };

            watcherRef.current = await Location.watchPositionAsync(
                locationOptions,
                async (loc) => {
                    try {
                        const currentAddress = await Location.reverseGeocodeAsync(loc.coords);

                        setLocationData(prev => ({
                            ...prev,
                            currentPosition: loc,
                            currentAddress,
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
                    } catch (error) {
                        setErrorMsg(`Error al procesar la ubicación: ${error}`);
                    }
                }
            );

            headingWatcherRef.current = await Location.watchHeadingAsync((head) => {
                setLocationData(prev => ({
                    ...prev,
                    heading: head
                }));
            });

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
            setIsMonitoring(false);
        }
    };

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
        if (hasPermission) {
            startTracking();
        }
        return () => {
            stopTracking();
        };
    }, [hasPermission]);

    const handleToggleMonitoring = async () => {
        if (isMonitoring) {
            stopTracking();
        } else {
            setIsMonitoring(true);
            await startTracking();
        }
    };

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

            {hasPermission && (
                <TouchableOpacity 
                    style={[styles.toggleButton, isMonitoring && styles.toggleButtonActive]} 
                    onPress={handleToggleMonitoring}
                >
                    <ThemedText style={styles.toggleButtonText}>
                        {isMonitoring ? 'Detener Monitoreo' : 'Iniciar Monitoreo'}
                    </ThemedText>
                </TouchableOpacity>
            )}

            {errorMsg && <JsonViewer data={{ error: errorMsg }} title="Error" />}

            {locationData && (
                <JsonViewer data={locationData} title="Datos de Ubicación en Tiempo Real" />
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    toggleButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginVertical: 10,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: '#4CAF50',
    },
    toggleButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
