import { CapabilityState, SupportedFeatures } from './index';
export interface OutletState {
    featureName: keyof typeof OutletFeatures & keyof typeof SupportedFeatures;
    value: CapabilityState['value'];
}
export declare const OutletFeatures: {
    readonly power: "power";
};
//# sourceMappingURL=outlet.d.ts.map