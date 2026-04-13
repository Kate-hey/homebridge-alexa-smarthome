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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapAlexaDeviceToHomeKitAccessoryInfos = void 0;
const E = __importStar(require("fp-ts/Either"));
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const fan_accessory_1 = __importDefault(require("../accessory/fan-accessory"));
const light_accessory_1 = __importDefault(require("../accessory/light-accessory"));
const lock_accessory_1 = __importDefault(require("../accessory/lock-accessory"));
const outlet_accessory_1 = __importDefault(require("../accessory/outlet-accessory"));
const switch_accessory_1 = __importDefault(require("../accessory/switch-accessory"));
const thermostat_accessory_1 = __importDefault(require("../accessory/thermostat-accessory"));
const alexa_1 = require("../domain/alexa");
const airQuality = __importStar(require("../domain/alexa/air-quality-monitor"));
const echo = __importStar(require("../domain/alexa/echo"));
const errors_1 = require("../domain/alexa/errors");
const util_1 = require("../util");
const mapAlexaDeviceToHomeKitAccessoryInfos = (platform, entityId, device) => {
    return (0, function_1.pipe)(validateDevice(device), E.bind('rangeFeatures', () => E.of(platform.deviceStore.getRangeFeaturesForDevice(entityId))), E.flatMap(({ rangeFeatures }) => determineSupportedHomeKitAccessories(platform, entityId, device, rangeFeatures)));
};
exports.mapAlexaDeviceToHomeKitAccessoryInfos = mapAlexaDeviceToHomeKitAccessoryInfos;
const validateDevice = (device) => (0, ts_pattern_1.match)(device)
    .with({
    id: ts_pattern_1.Pattern.string,
    enabled: ts_pattern_1.Pattern.boolean,
    deviceType: ts_pattern_1.Pattern.string,
    displayName: ts_pattern_1.Pattern.string,
    supportedOperations: ts_pattern_1.Pattern.array(ts_pattern_1.Pattern.string),
}, () => E.of(device))
    .otherwise((d) => E.left(new errors_1.InvalidDeviceError(d)));
const supportsRequiredActions = (required, supported) => required.every((req) => supported.includes(req));
const determineSupportedHomeKitAccessories = (platform, entityId, device, rangeFeatures) => (0, ts_pattern_1.match)([device.deviceType, device.supportedOperations])
    .when(([type, ops]) => type === 'LIGHT' &&
    supportsRequiredActions(light_accessory_1.default.requiredOperations, ops), () => E.of([
    {
        altDeviceName: O.none,
        deviceType: platform.Service.Lightbulb.UUID,
        uuid: (0, util_1.generateUuid)(platform, entityId, device.deviceType),
    },
]))
    .when(([type, ops]) => type === 'SWITCH' &&
    ops.includes(alexa_1.SupportedActions.setBrightness) &&
    supportsRequiredActions(light_accessory_1.default.requiredOperations, ops), () => E.of([
    {
        altDeviceName: O.none,
        deviceType: platform.Service.Lightbulb.UUID,
        uuid: (0, util_1.generateUuid)(platform, entityId, device.deviceType),
    },
]))
    .when(([type, ops]) => type === 'SMARTLOCK' &&
    supportsRequiredActions(lock_accessory_1.default.requiredOperations, ops), () => E.of([
    {
        altDeviceName: O.none,
        deviceType: platform.Service.LockMechanism.UUID,
        uuid: (0, util_1.generateUuid)(platform, entityId, device.deviceType),
    },
]))
    .when(([type, ops]) => type === 'FAN' &&
    supportsRequiredActions(fan_accessory_1.default.requiredOperations, ops), () => E.of([
    {
        altDeviceName: O.none,
        deviceType: platform.Service.Fanv2.UUID,
        uuid: (0, util_1.generateUuid)(platform, entityId, device.deviceType),
    },
]))
    .when(([type, ops]) => type === 'SMARTPLUG' &&
    supportsRequiredActions(outlet_accessory_1.default.requiredOperations, ops), () => E.of([
    {
        altDeviceName: O.none,
        deviceType: platform.Service.Outlet.UUID,
        uuid: (0, util_1.generateUuid)(platform, entityId, device.deviceType),
    },
]))
    .when(([type, ops]) => type === 'THERMOSTAT' &&
    supportsRequiredActions(thermostat_accessory_1.default.requiredOperations, ops), () => E.of([
    {
        altDeviceName: O.none,
        deviceType: platform.Service.Thermostat.UUID,
        uuid: (0, util_1.generateUuid)(platform, entityId, device.deviceType),
    },
]))
    .with(['ALEXA_VOICE_ENABLED', ts_pattern_1.Pattern._], () => E.of([
    ...echo.toSupportedHomeKitAccessories(platform, entityId, device.displayName, platform.deviceStore.getCacheStatesForDevice(entityId)),
]))
    .with(['AIR_QUALITY_MONITOR', ts_pattern_1.Pattern._], () => E.of(airQuality.toSupportedHomeKitAccessories(platform, entityId, device.displayName, platform.deviceStore.getCacheStatesForDevice(entityId), rangeFeatures)))
    .when(([_, ops]) => supportsRequiredActions(switch_accessory_1.default.requiredOperations, ops), () => E.of([
    {
        altDeviceName: O.none,
        deviceType: platform.Service.Switch.UUID,
        uuid: (0, util_1.generateUuid)(platform, entityId, device.deviceType),
    },
]))
    .otherwise(() => E.left(new errors_1.UnsupportedDeviceError(device)));
//# sourceMappingURL=index.js.map