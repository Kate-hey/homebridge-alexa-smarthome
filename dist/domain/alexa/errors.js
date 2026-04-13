"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDeviceError = exports.UnsupportedDeviceError = exports.AlexaDeviceError = exports.DeviceOffline = exports.TimeoutError = exports.RequestUnsuccessful = exports.HttpError = exports.InvalidResponse = exports.InvalidRequest = exports.AlexaApiError = exports.AlexaError = void 0;
const index_1 = require("./index");
class AlexaError extends Error {
    constructor(message, name) {
        super(message);
        this.name = name;
        this.message = `${name}(${message})`;
    }
}
exports.AlexaError = AlexaError;
class AlexaApiError extends AlexaError {
}
exports.AlexaApiError = AlexaApiError;
class InvalidRequest extends AlexaApiError {
    constructor(message) {
        super(message, InvalidRequest.name);
    }
}
exports.InvalidRequest = InvalidRequest;
class InvalidResponse extends AlexaApiError {
    constructor(message) {
        super(message, InvalidResponse.name);
    }
}
exports.InvalidResponse = InvalidResponse;
class HttpError extends AlexaApiError {
    constructor(message) {
        super(message, HttpError.name);
    }
}
exports.HttpError = HttpError;
class RequestUnsuccessful extends AlexaApiError {
    constructor(message, errorCode) {
        super(`${message}${errorCode ? `. Error code: ${errorCode}` : ''}`, RequestUnsuccessful.name);
        this.errorCode = errorCode;
    }
}
exports.RequestUnsuccessful = RequestUnsuccessful;
class TimeoutError extends AlexaApiError {
    constructor(message) {
        super(message, TimeoutError.name);
    }
}
exports.TimeoutError = TimeoutError;
class DeviceOffline extends AlexaApiError {
    constructor() {
        super(DeviceOffline.code, DeviceOffline.name);
    }
}
exports.DeviceOffline = DeviceOffline;
DeviceOffline.code = 'ENDPOINT_UNREACHABLE';
class AlexaDeviceError extends AlexaError {
}
exports.AlexaDeviceError = AlexaDeviceError;
class UnsupportedDeviceError extends AlexaDeviceError {
    constructor(device) {
        super(`Unsupported device: ${device.displayName} with type: ${device.deviceType}. Device type is either unsupported or device does not support all the required operations. Device supported operations: ${device.supportedOperations}. Currently supported device types are: ${index_1.SupportedDeviceTypes}.`, UnsupportedDeviceError.name);
    }
}
exports.UnsupportedDeviceError = UnsupportedDeviceError;
class InvalidDeviceError extends AlexaDeviceError {
    constructor(device) {
        super(`Unable to determine device type for: ${device.displayName}`, InvalidDeviceError.name);
    }
}
exports.InvalidDeviceError = InvalidDeviceError;
//# sourceMappingURL=errors.js.map