import { CapabilityState, SupportedFeatures } from './index';
export interface SwitchState {
    featureName: keyof typeof SwitchFeatures & keyof typeof SupportedFeatures;
    value: CapabilityState['value'];
}
export declare const SwitchFeatures: {
    readonly power: "power";
    readonly brightness: "brightness";
};
//# sourceMappingURL=switch.d.ts.map