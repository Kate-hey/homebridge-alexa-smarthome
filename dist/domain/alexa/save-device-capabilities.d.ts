import { Endpoint, SmartHomeDevice } from './get-devices';
export interface RangeFeaturesByDevice {
    [entityId: string]: {
        [rangeName: string]: RangeFeature;
    };
}
export interface RangeFeatures {
    [rangeName: string]: RangeFeature;
}
export declare const extractRangeFeatures: (devices: [Endpoint, SmartHomeDevice][]) => RangeFeaturesByDevice;
export interface RangeFeature {
    featureName: string;
    instance: string;
    rangeName: string;
}
//# sourceMappingURL=save-device-capabilities.d.ts.map