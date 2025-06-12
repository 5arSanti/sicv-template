export interface SensorsInterface {
    platform: string;
    barometer: BarometerInterface;
    battery: BatteryInterface;
}

export interface BarometerInterface {
    available: boolean;
    pressure: number;
    relativeAltitude: number | undefined;
    timestamp: number | undefined;
}

export interface BatteryInterface {
    available: boolean;
    batteryLevel: number;
    state: number;
    stateEnum: string;
    lowPowerMode: boolean;
    batteryOptimization: boolean;
}