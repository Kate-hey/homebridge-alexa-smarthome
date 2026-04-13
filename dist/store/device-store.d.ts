import { Option } from 'fp-ts/Option';
import { CapabilityState } from '../domain/alexa';
import { CapabilityStatesByDevice, ValidStatesByDevice } from '../domain/alexa/get-device-states';
import { RangeFeatures, RangeFeaturesByDevice } from '../domain/alexa/save-device-capabilities';
import { AlexaPlatformConfig } from '../domain/homebridge';
export interface DeviceStatesCache {
    lastUpdated: Date;
    states: ValidStatesByDevice;
}
export default class DeviceStore {
    readonly cacheTTL: number;
    readonly cache: DeviceStatesCache;
    private _deviceCapabilities;
    constructor(performanceSettings?: AlexaPlatformConfig['performance']);
    get deviceCapabilities(): RangeFeaturesByDevice;
    set deviceCapabilities(deviceCapabilities: RangeFeaturesByDevice);
    getRangeFeaturesForDevice(deviceId: string): RangeFeatures;
    getCacheStatesForDevice(deviceId: string): CapabilityState[];
    getCacheValue(deviceId: string, { featureName, name, instance, }: Omit<CapabilityState, 'value' | 'namespace'>): Option<CapabilityState>;
    updateCache(deviceIds: string[], statesByDevice: CapabilityStatesByDevice): ValidStatesByDevice;
    updateCacheValue(deviceId: string, newState: CapabilityState): ValidStatesByDevice;
    isCacheFresh: () => boolean;
}
//# sourceMappingURL=device-store.d.ts.map