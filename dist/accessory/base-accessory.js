"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const TE = __importStar(require("fp-ts/TaskEither"));
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const errors_1 = require("../domain/alexa/errors");
class BaseAccessory {
    constructor(platform, device, platformAcc) {
        this.platform = platform;
        this.device = device;
        this.platformAcc = platformAcc;
        this.Service = this.platform.Service;
        this.Characteristic = this.platform.Characteristic;
        this._initialized = false;
        this.log = platform.log;
        this.addAccessoryInfoService();
        this.rangeFeatures = this.platform.deviceStore.getRangeFeaturesForDevice(this.device.id);
        this.lastUpdated = new Date(0);
    }
    logWithContext(logLevel, message, e) {
        return this._logWithContext(logLevel, message, e)();
    }
    _logWithContext(logLevel, message, e) {
        const msgAndContext = `${this.device.displayName} - ${message}`;
        return (0, ts_pattern_1.match)(logLevel)
            .with('errorT', () => this.log.errorT(msgAndContext, e))
            .otherwise((logLevel) => this.log[logLevel](msgAndContext));
    }
    getInitialized() {
        return this._initialized;
    }
    setInitialized(initialized) {
        this._initialized = initialized;
    }
    addAccessoryInfoService() {
        const service = this.platformAcc.getService(this.Service.AccessoryInformation) ||
            this.platformAcc.addService(this.Service.AccessoryInformation);
        service
            .setCharacteristic(this.Characteristic.Manufacturer, this.device.manufacturer)
            .setCharacteristic(this.Characteristic.SerialNumber, this.device.serialNumber)
            .setCharacteristic(this.Characteristic.Name, this.device.displayName)
            .setCharacteristic(this.Characteristic.ConfiguredName, this.device.displayName)
            .setCharacteristic(this.Characteristic.Model, this.device.model.length > 1 ? this.device.model : 'Unknown');
    }
    configureStatusActive() {
        return (0, function_1.pipe)(this.platformAcc.services, A.map((s) => {
            !s.testCharacteristic(this.Characteristic.StatusActive) &&
                s.addOptionalCharacteristic(this.Characteristic.StatusActive);
            s.getCharacteristic(this.Characteristic.StatusActive).onGet(() => this.device.enabled);
        }));
    }
    getStateGraphQl(toCharacteristicStateFn) {
        const useCache = new Date().getTime() - this.lastUpdated.getTime() <
            this.platform.deviceStore.cacheTTL;
        return (0, function_1.pipe)((this.platform.alexaApi.getDeviceStateGraphQl(this.device, this.service, useCache)), TE.map(([fromCache, states]) => {
            if (!fromCache) {
                this.lastUpdated = new Date();
            }
            return states;
        }), TE.flatMapOption(toCharacteristicStateFn, () => new errors_1.InvalidResponse('State not available')));
    }
    getCacheValue(featureName, name, instance) {
        return (0, function_1.pipe)(this.platform.deviceStore.getCacheValue(this.device.id, {
            featureName,
            name,
            instance,
        }), O.flatMap(({ value }) => O.fromNullable(value)));
    }
    updateCacheValue(newState) {
        return this.platform.deviceStore.updateCacheValue(this.device.id, newState);
    }
    getHapValue(characteristic) {
        var _a, _b;
        return (_b = (_a = this.service.getCharacteristic(characteristic)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : null;
    }
    removeCharacteristic(char) {
        if (this.service.testCharacteristic(char)) {
            this.service.removeCharacteristic(this.service.getCharacteristic(char));
        }
    }
    get serviceCommunicationError() {
        this.logWithContext('debug', 'Service communication error');
        return new this.platform.HAP.HapStatusError(-70402 /* this.platform.HAP.HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
    }
    get readOnlyError() {
        this.logWithContext('debug', 'Read only error');
        return new this.platform.HAP.HapStatusError(-70404 /* this.platform.HAP.HAPStatus.READ_ONLY_CHARACTERISTIC */);
    }
    get notAllowedError() {
        this.logWithContext('debug', 'Not allowed error');
        return new this.platform.HAP.HapStatusError(-70412 /* this.platform.HAP.HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE */);
    }
    get invalidValueError() {
        this.logWithContext('debug', 'Invalid value error');
        return new this.platform.HAP.HapStatusError(-70410 /* this.platform.HAP.HAPStatus.INVALID_VALUE_IN_REQUEST */);
    }
    extractStates(maybeStates) {
        return (0, function_1.pipe)(maybeStates, A.filterMap(function_1.identity));
    }
}
exports.default = BaseAccessory;
//# sourceMappingURL=base-accessory.js.map