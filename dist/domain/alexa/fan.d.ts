import { CapabilityState, SupportedFeatures } from './index';
export interface FanState {
    featureName: keyof typeof FanFeatures & keyof typeof SupportedFeatures;
    value: CapabilityState['value'];
    instance?: CapabilityState['instance'];
}
export declare const FanFeatures: {
    readonly power: "power";
    readonly range: "range";
};
export declare const FanRangeFeatures: {
    readonly airTemperature: "Air Temperature";
};
//# sourceMappingURL=fan.d.ts.map