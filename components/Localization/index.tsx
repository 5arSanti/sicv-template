import { globalStyles } from "@/constants/Styles";
import { LocalizationInterface } from "@/interfaces/sensors.interface";
import { getCalendars, getLocales } from 'expo-localization';
import { JsonViewer } from "../JsonViewer";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export const LocalizationCard = () => {
    const locales = getLocales();
    const calendars = getCalendars();

    const localizationInterface: LocalizationInterface = {
        locales,
        calendars
    }

    return (
        <ThemedView style={globalStyles.stepContainer}>
            <ThemedText type="subtitle">Localization</ThemedText>
            <JsonViewer data={localizationInterface} title="localization" />
        </ThemedView>
    );
}