import { Nullable } from '../index';
import { SmartHomeDevice } from './get-devices';
export declare abstract class AlexaError extends Error {
    readonly name: string;
    constructor(message: string, name: string);
}
export declare abstract class AlexaApiError extends AlexaError {
}
export declare class InvalidRequest extends AlexaApiError {
    constructor(message: string);
}
export declare class InvalidResponse extends AlexaApiError {
    constructor(message: string);
}
export declare class HttpError extends AlexaApiError {
    constructor(message: string);
}
export declare class RequestUnsuccessful extends AlexaApiError {
    readonly errorCode: Nullable<string>;
    constructor(message: string, errorCode: Nullable<string>);
}
export declare class TimeoutError extends AlexaApiError {
    constructor(message: string);
}
export declare class DeviceOffline extends AlexaApiError {
    static readonly code = "ENDPOINT_UNREACHABLE";
    constructor();
}
export declare abstract class AlexaDeviceError extends AlexaError {
}
export declare class UnsupportedDeviceError extends AlexaDeviceError {
    constructor(device: SmartHomeDevice);
}
export declare class InvalidDeviceError extends AlexaDeviceError {
    constructor(device: SmartHomeDevice);
}
//# sourceMappingURL=errors.d.ts.map