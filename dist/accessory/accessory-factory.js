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
const E = __importStar(require("fp-ts/Either"));
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const errors_1 = require("../domain/alexa/errors");
const air_quality_accessory_1 = __importDefault(require("./air-quality-accessory"));
const co_accessory_1 = __importDefault(require("./co-accessory"));
const fan_accessory_1 = __importDefault(require("./fan-accessory"));
const humidity_accessory_1 = __importDefault(require("./humidity-accessory"));
const light_accessory_1 = __importDefault(require("./light-accessory"));
const lock_accessory_1 = __importDefault(require("./lock-accessory"));
const outlet_accessory_1 = __importDefault(require("./outlet-accessory"));
const switch_accessory_1 = __importDefault(require("./switch-accessory"));
const temperature_accessory_1 = __importDefault(require("./temperature-accessory"));
const thermostat_accessory_1 = __importDefault(require("./thermostat-accessory"));
class AccessoryFactory {
    static createAccessory(platform, platAcc, device, homeKitDeviceType) {
        const toAccessory = () => (0, ts_pattern_1.match)(homeKitDeviceType)
            .with(platform.Service.Lightbulb.UUID, () => E.of(new light_accessory_1.default(platform, device, platAcc)))
            .with(platform.Service.Switch.UUID, () => E.of(new switch_accessory_1.default(platform, device, platAcc)))
            .with(platform.Service.Fanv2.UUID, () => E.of(new fan_accessory_1.default(platform, device, platAcc)))
            .with(platform.Service.LockMechanism.UUID, () => E.of(new lock_accessory_1.default(platform, device, platAcc)))
            .with(platform.Service.Outlet.UUID, () => E.of(new outlet_accessory_1.default(platform, device, platAcc)))
            .with(platform.Service.Thermostat.UUID, () => E.of(new thermostat_accessory_1.default(platform, device, platAcc)))
            .with(platform.Service.AirQualitySensor.UUID, () => E.of(new air_quality_accessory_1.default(platform, device, platAcc)))
            .with(platform.Service.CarbonMonoxideSensor.UUID, () => E.of(new co_accessory_1.default(platform, device, platAcc)))
            .with(platform.Service.HumiditySensor.UUID, () => E.of(new humidity_accessory_1.default(platform, device, platAcc)))
            .with(platform.Service.TemperatureSensor.UUID, () => E.of(new temperature_accessory_1.default(platform, device, platAcc)))
            .otherwise(() => E.left(new errors_1.UnsupportedDeviceError(device)));
        return (0, function_1.pipe)(E.bindTo('acc')(toAccessory()), E.tap(({ acc }) => {
            acc.configureServices();
            acc.configureStatusActive();
            acc.setInitialized(true);
            return E.of(acc);
        }), E.map(({ acc }) => acc));
    }
}
exports.default = AccessoryFactory;
//# sourceMappingURL=accessory-factory.js.map