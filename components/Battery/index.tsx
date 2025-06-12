import { globalStyles } from '@/constants/Styles';
import { useBatteryLevel, useLowPowerMode } from 'expo-battery';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

export const BatteryCard = () => {
    const batteryLevel = useBatteryLevel();
    const lowPowerMode = useLowPowerMode();

    return (
        <ThemedView style={globalStyles.stepContainer}>
            <ThemedText type="subtitle">Batería</ThemedText>
            <ThemedText>Nivel de batería: {batteryLevel}</ThemedText>
            <ThemedText>Modo de bajo consumo: {lowPowerMode ? 'Activado' : 'Desactivado'}</ThemedText>
        </ThemedView>
    )
}