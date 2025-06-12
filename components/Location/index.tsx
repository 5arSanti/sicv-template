import { globalStyles } from '@/constants/Styles';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { JsonViewer } from '../JsonViewer';
import { PermissionCard } from '../PermissionCard';
import { ThemedView } from '../ThemedView';

// Interfaz actualizada: servicesEnabled en lugar de networkProvider
export interface LocationInterface {
    enabled: boolean;
    lastKnownPosition: Location.LocationObject | null;
    currentPosition: Location.LocationObject | null;
    address?: Location.LocationGeocodedAddress[];
}

export const LocationCard = () => {
    const [locationData, setLocationData] = useState<LocationInterface | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [foregroundPermission, requestForegroundPermission] = Location.useForegroundPermissions();
    const [backgroundPermission, requestBackgroundPermission] = Location.useBackgroundPermissions();

    const watcherRef = useRef<Location.LocationSubscription | null>(null);
    const headingWatcherRef = useRef<Location.LocationSubscription | null>(null);

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
        if (foregroundPermission?.granted) {
            (async () => {
                await Location.enableNetworkProviderAsync();
                const status = await Location.getProviderStatusAsync();
                const enabled = status.locationServicesEnabled;

                setLocationData((prev) => ({ ...prev, enabled }) as LocationInterface);

                watcherRef.current = await Location.watchPositionAsync(
                    { timeInterval: 1000, distanceInterval: 1 },
                    (loc) => {
                        setLocationData((prev) => ({ ...prev, currentPosition: loc }) as LocationInterface);
                    }
                );

                headingWatcherRef.current = await Location.watchHeadingAsync((head) => {
                    setLocationData((prev) => prev ? { ...prev, heading: head } : null);
                });

                const last = await Location.getLastKnownPositionAsync();
                if (last) {
                    const addr = await Location.reverseGeocodeAsync(last.coords);
                    setLocationData((prev) => ({
                        ...prev,
                        lastKnownPosition: last,
                        address: addr,
                    }) as LocationInterface);
                }
            })();
        }

        return () => {
            watcherRef.current?.remove();
            headingWatcherRef.current?.remove();
        };
    }, [foregroundPermission]);

    return (
        <ThemedView style={globalStyles.stepContainer}>
            <PermissionCard
                permission={foregroundPermission}
                requestPermission={requestForegroundPermission}
                title="Permiso de Ubicación"
                description="Necesitamos permiso para acceder a tu ubicación"
            />

            {errorMsg && <JsonViewer data={{ error: errorMsg }} title="Error" />}

            {locationData && (
                <JsonViewer data={locationData} title="Datos de Ubicación Detallados" />
            )}
        </ThemedView>
    );
};
