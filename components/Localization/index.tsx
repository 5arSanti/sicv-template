import { globalStyles } from "@/constants/Styles";
import { LocalizationInterface } from "@/interfaces/sensors.interface";
import { getCalendars, getLocales } from 'expo-localization';
import { JsonViewer } from "../JsonViewer";
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
            <JsonViewer data={localizationInterface} title="localizationInterface" />
        </ThemedView>
    );
}