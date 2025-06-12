export interface BarometerData {
    available: boolean;
    pressure: number;
    relativeAltitude: number | undefined;
    timestamp: number | null;
}
