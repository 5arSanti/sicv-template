import { CellularGeneration } from "expo-cellular";

export interface SensorsInterface {
    platform: string;
    barometer: BarometerInterface;
    battery: BatteryInterface;
}

export interface BarometerInterface {
    available: boolean;
    pressure: number;
    relativeAltitude: number | undefined;
    timestamp: number | null;
}

export interface BatteryInterface {
    available: boolean;
    batteryLevel: number;
    state: number;
    stateEnum: string;
    lowPowerMode: boolean;
    batteryOptimization: boolean;
}

export interface CellularInterface {
    permission: boolean;
    carrier: string | null; 
    countryCode: string | null;
    generation: CellularGeneration | null;
    cellularGeneration: string | null;
}