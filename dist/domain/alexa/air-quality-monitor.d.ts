import type { AlexaSmartHomePlatform } from '../../platform';
import { HomebridgeAccessoryInfo } from '../homebridge';
import { CapabilityState, SupportedFeatures } from './index';
import { RangeFeatures } from './save-device-capabilities';
export declare const AirQualityRangeFeatures: string[];
export interface AirQualityMonitorState {
    featureName: keyof typeof AirQualityMonitorFeatures & keyof typeof SupportedFeatures;
    value: CapabilityState['value'];
    instance: CapabilityState['instance'];
}
export declare const AirQualityMonitorFeatures: {
    readonly range: "range";
};
export declare const isAirQualityMonitor: (rangeFeatures: RangeFeatures, capability: CapabilityState) => boolean;
export declare const toSupportedHomeKitAccessories: (platform: AlexaSmartHomePlatform, entityId: string, deviceName: string, capStates: CapabilityState[], rangeFeatures: RangeFeatures) => HomebridgeAccessoryInfo[];
//# sourceMappingURL=air-quality-monitor.d.ts.map