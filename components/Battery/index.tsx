import { globalStyles } from '@/constants/Styles';
import { BatteryInterface } from '@/interfaces/sensors.interface';
import { BatteryState, isAvailableAsync, isBatteryOptimizationEnabledAsync, usePowerState } from 'expo-battery';
import { useEffect, useState } from 'react';
import { JsonViewer } from '../JsonViewer';
import { ThemedView } from '../ThemedView';

export const BatteryCard = () => {
    const { batteryLevel, batteryState, lowPowerMode } = usePowerState();
    const [available, setAvailable] = useState(false);
    const [batteryOptimization, setBatteryOptimization] = useState(false);

    useEffect(() => {
        const checkBattery = async () => {
            const isAvailable = await isAvailableAsync();
            const isOptimized = await isBatteryOptimizationEnabledAsync();
            setAvailable(isAvailable);
            setBatteryOptimization(isOptimized);
        };
        checkBattery();
    }, []);

    const batteryInterface: BatteryInterface = {
        available,
        batteryLevel,
        state: batteryState,
        stateEnum: BatteryState[batteryState],
        lowPowerMode,
        batteryOptimization
    }

    return (
        <ThemedView style={globalStyles.stepContainer}>
            <JsonViewer data={batteryInterface} title="batteryInterface" />
        </ThemedView>
    )
}