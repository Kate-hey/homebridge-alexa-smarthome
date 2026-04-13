import { CapabilityState, SupportedFeatures } from './index';
export interface LightbulbState {
    featureName: keyof typeof LightbulbFeatures & keyof typeof SupportedFeatures;
    value: CapabilityState['value'];
}
export declare const LightbulbFeatures: {
    readonly power: "power";
    readonly brightness: "brightness";
    readonly color: "color";
    readonly colorTemperature: "colorTemperature";
};
//# sourceMappingURL=lightbulb.d.ts.map