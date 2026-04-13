import { Either } from 'fp-ts/Either';
import { Option } from 'fp-ts/Option';
import { Nullable } from '../index';
import { AlexaApiError } from './errors';
import { CapabilityState, DeviceResponse } from './index';
export type OptionalCapabilityStates = Option<Either<AlexaApiError, CapabilityState>[]>;
export type CapabilityStatesByDevice = Record<string, OptionalCapabilityStates>;
export interface CapabilityStates {
    statesByDevice: CapabilityStatesByDevice;
    fromCache: boolean;
}
export type ValidStatesByDevice = Record<string, Option<CapabilityState>[]>;
export interface ValidCapabilityStates {
    statesByDevice: ValidStatesByDevice;
    fromCache: boolean;
}
export interface DeviceStateResponse extends DeviceResponse {
    entity: {
        entityId: string;
        entityType: string;
    };
    capabilityStates: Nullable<string[]>;
}
export default interface GetDeviceStatesResponse {
    deviceStates: Nullable<DeviceStateResponse[]>;
    errors: Nullable<DeviceResponse[]>;
}
//# sourceMappingURL=get-device-states.d.ts.map