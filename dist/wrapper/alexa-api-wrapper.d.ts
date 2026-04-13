import { TaskEither } from 'fp-ts/TaskEither';
import { Service } from 'homebridge';
import AlexaRemote, { type EntityType } from 'alexa-remote2';
import { CapabilityState, SupportedActionsType, SupportedFeatures } from '../domain/alexa';
import { AlexaApiError } from '../domain/alexa/errors';
import { ValidStatesByDevice } from '../domain/alexa/get-device-states';
import { SmartHomeDevice } from '../domain/alexa/get-devices';
import DeviceStore from '../store/device-store';
import { PluginLogger } from '../util/plugin-logger';
export interface DeviceStatesCache {
    lastUpdated: Date;
    cachedStates: ValidStatesByDevice;
}
export declare class AlexaApiWrapper {
    private readonly service;
    private readonly alexaRemote;
    private readonly log;
    private readonly deviceStore;
    private readonly semaphore;
    constructor(service: typeof Service, alexaRemote: AlexaRemote, log: PluginLogger, deviceStore: DeviceStore);
    getDevices(): TaskEither<AlexaApiError, SmartHomeDevice[]>;
    getDeviceStateGraphQl(device: SmartHomeDevice, service: Service, useCache: boolean): TaskEither<AlexaApiError, [boolean, CapabilityState[]]>;
    setDeviceStateGraphQl(endpointId: string, featureName: SupportedFeatures, featureOperationName: SupportedActionsType, payload?: Record<string, unknown>): TaskEither<AlexaApiError, void>;
    setDeviceState(deviceId: string, action: SupportedActionsType, parameters?: Record<string, string>, entityType?: EntityType): TaskEither<AlexaApiError, void>;
    private executeGraphQlQuery;
    private changeDeviceState;
    private static toPromise;
    private queryDeviceStates;
    private doesCacheContainAllIds;
}
//# sourceMappingURL=alexa-api-wrapper.d.ts.map