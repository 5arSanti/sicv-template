import { globalStyles } from "@/constants/Styles";
import { CellularInterface } from "@/interfaces/sensors.interface";
import * as Cellular from 'expo-cellular';
import React, { useEffect, useState } from 'react';

import { JsonViewer } from "../JsonViewer";
import { PermissionCard } from "../PermissionCard";
import { ThemedView } from "../ThemedView";

export const CellularCard = () => {
    const [permission, requestPermission] = Cellular.usePermissions();
    const [hasPermission, setHasPermission] = useState(false);
    const [cellularInfo, setCellularInfo] = useState<CellularInterface>({
        permission: false,
        carrier: null,
        countryCode: null,
        generation: null,
        cellularGeneration: null
    });

    useEffect(() => {
        permission?.granted && setHasPermission(true)
    }, [permission])

    useEffect(() => {
        const getCellularInfo = async () => {
            if (hasPermission) {
                const [carrier, countryCode, generation] = await Promise.all([
                    Cellular.getCarrierNameAsync(),
                    Cellular.getIsoCountryCodeAsync(),
                    Cellular.getCellularGenerationAsync()
                ]);

                setCellularInfo({
                    permission: hasPermission,
                    carrier,
                    countryCode,
                    generation,
                    cellularGeneration: Cellular.CellularGeneration[generation]
                });
            }
        };

        getCellularInfo();
    }, [hasPermission]);

    return (
        <ThemedView style={globalStyles.stepContainer}>
            <PermissionCard
                permission={permission}
                requestPermission={requestPermission}
                title="Cellular Permission"
                description="We need permission to access cellular information"
                onGranted={() => setHasPermission(true)}
            />

            {hasPermission && (
                <JsonViewer data={cellularInfo} title="cellularInterface" />
            )}
        </ThemedView>
    );
}
