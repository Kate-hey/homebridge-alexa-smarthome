import { CapabilityState, SupportedFeatures } from './index';
export interface TempSensorState {
    featureName: keyof typeof TempSensorFeatures & keyof typeof SupportedFeatures;
    value: CapabilityState['value'];
    name?: CapabilityState['name'];
}
export declare const TempSensorFeatures: {
    readonly temperatureSensor: "temperatureSensor";
};
export type TempSensorFeaturesType = keyof typeof TempSensorFeatures;
//# sourceMappingURL=temperature-sensor.d.ts.map