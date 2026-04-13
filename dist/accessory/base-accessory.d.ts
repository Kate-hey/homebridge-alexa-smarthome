import { Option } from 'fp-ts/Option';
import { TaskEither } from 'fp-ts/TaskEither';
import { Characteristic, PlatformAccessory, Service } from 'homebridge';
import { CapabilityState } from '../domain/alexa';
import { AlexaApiError } from '../domain/alexa/errors';
import { SmartHomeDevice } from '../domain/alexa/get-devices';
import { RangeFeatures } from '../domain/alexa/save-device-capabilities';
import { AlexaSmartHomePlatform } from '../platform';
import { PluginLogLevel, PluginLogger } from '../util/plugin-logger';
export default abstract class BaseAccessory {
    readonly platform: AlexaSmartHomePlatform;
    readonly device: SmartHomeDevice;
    readonly platformAcc: PlatformAccessory;
    readonly Service: typeof Service;
    readonly Characteristic: typeof Characteristic;
    readonly log: PluginLogger;
    _initialized: boolean;
    readonly rangeFeatures: RangeFeatures;
    private lastUpdated;
    constructor(platform: AlexaSmartHomePlatform, device: SmartHomeDevice, platformAcc: PlatformAccessory);
    logWithContext(logLevel: PluginLogLevel | 'errorT', message: string, e?: unknown): void;
    private _logWithContext;
    getInitialized(): boolean;
    setInitialized(initialized: boolean): void;
    addAccessoryInfoService(): void;
    configureStatusActive(): void[];
    getStateGraphQl<S, C>(toCharacteristicStateFn: (fa: S[]) => Option<C>): TaskEither<AlexaApiError, C>;
    getCacheValue(featureName: CapabilityState['featureName'], name?: CapabilityState['name'], instance?: CapabilityState['instance']): Option<CapabilityState['value']>;
    updateCacheValue(newState: CapabilityState): import("../domain/alexa/get-device-states").ValidStatesByDevice;
    getHapValue(characteristic: Parameters<Service['getCharacteristic']>[0]): string | number | boolean | import("homebridge").PrimitiveTypes[] | {
        [key: string]: import("homebridge").PrimitiveTypes;
    } | null;
    removeCharacteristic(char: Parameters<Service['testCharacteristic']>[0] & Parameters<Service['getCharacteristic']>[0]): void;
    get serviceCommunicationError(): import("homebridge").HapStatusError;
    get readOnlyError(): import("homebridge").HapStatusError;
    get notAllowedError(): import("homebridge").HapStatusError;
    get invalidValueError(): import("homebridge").HapStatusError;
    private extractStates;
    abstract configureServices(): void;
    abstract service: Service;
    abstract isExternalAccessory: boolean;
}
//# sourceMappingURL=base-accessory.d.ts.map