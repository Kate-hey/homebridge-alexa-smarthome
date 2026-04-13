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
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const TE = __importStar(require("fp-ts/TaskEither"));
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const lightMapper = __importStar(require("../mapper/light-mapper"));
const mapper = __importStar(require("../mapper/power-mapper"));
const base_accessory_1 = __importDefault(require("./base-accessory"));
class LightAccessory extends base_accessory_1.default {
    constructor() {
        super(...arguments);
        this.isExternalAccessory = false;
    }
    configureServices() {
        this.service =
            this.platformAcc.getService(this.Service.Lightbulb) ||
                this.platformAcc.addService(this.Service.Lightbulb, this.device.displayName);
        this.service
            .getCharacteristic(this.Characteristic.On)
            .onGet(this.handlePowerGet.bind(this))
            .onSet(this.handlePowerSet.bind(this));
        if (this.device.supportedOperations.includes('setBrightness')) {
            this.service
                .getCharacteristic(this.Characteristic.Brightness)
                .onGet(this.handleBrightnessGet.bind(this))
                .onSet(this.handleBrightnessSet.bind(this));
        }
        else {
            this.removeCharacteristic(this.Characteristic.Brightness);
        }
        if (this.device.supportedOperations.includes('setColor')) {
            this.service
                .getCharacteristic(this.Characteristic.Hue)
                .onGet(this.handleHueGet.bind(this))
                .onSet(this.handleHueSet.bind(this));
            this.service
                .getCharacteristic(this.Characteristic.Saturation)
                .onGet(this.handleSaturationGet.bind(this))
                .onSet(function_1.constVoid);
        }
        else {
            this.removeCharacteristic(this.Characteristic.Hue);
            this.removeCharacteristic(this.Characteristic.Saturation);
        }
        if (this.device.supportedOperations.includes('setColorTemperature')) {
            this.service
                .getCharacteristic(this.Characteristic.ColorTemperature)
                .onGet(this.handleColorTemperatureGet.bind(this))
                .onSet(this.handleColorTemperatureSet.bind(this));
        }
        else {
            this.removeCharacteristic(this.Characteristic.ColorTemperature);
        }
    }
    async handlePowerGet() {
        const determinePowerState = (0, function_1.flow)(A.findFirst(({ featureName }) => featureName === 'power'), O.tap(({ value }) => O.of(this.logWithContext('debug', `Get power result: ${value}`))), O.map(({ value }) => value === 'ON'));
        return (0, function_1.pipe)(this.getStateGraphQl(determinePowerState), TE.match((e) => {
            this.logWithContext('errorT', 'Get power', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handlePowerSet(value) {
        this.logWithContext('debug', `Triggered set power: ${value}`);
        if (typeof value !== 'boolean') {
            throw this.invalidValueError;
        }
        const action = mapper.mapHomeKitPowerToAlexaAction(value);
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'power', action), TE.match((e) => {
            this.logWithContext('errorT', 'Set power', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: mapper.mapHomeKitPowerToAlexaValue(value),
                featureName: 'power',
            });
        }))();
    }
    async handleBrightnessGet() {
        const determineBrightnessState = (0, function_1.flow)(A.findFirst(({ featureName }) => featureName === 'brightness'), O.flatMap(({ value }) => typeof value === 'number' ? O.of(value) : O.none), O.tap((s) => O.of(this.logWithContext('debug', `Get brightness result: ${s}`))));
        return (0, function_1.pipe)(this.getStateGraphQl(determineBrightnessState), TE.match((e) => {
            this.logWithContext('errorT', 'Get brightness', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleBrightnessSet(value) {
        this.logWithContext('debug', `Triggered set brightness: ${value}`);
        if (typeof value !== 'number') {
            throw this.invalidValueError;
        }
        const newBrightness = value.toString(10);
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'brightness', 'setBrightness', {
            brightness: newBrightness,
        }), TE.match((e) => {
            this.logWithContext('errorT', 'Set brightness', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: newBrightness,
                featureName: 'brightness',
            });
        }))();
    }
    async handleHueGet() {
        const determineHueState = (0, function_1.flow)(A.findFirst(({ featureName }) => featureName === 'color'), O.flatMap(({ value }) => {
            if (typeof value !== 'object' || typeof value.hue !== 'number') {
                return O.none;
            }
            return O.of(Math.trunc(value.hue));
        }), O.tap((s) => O.of(this.logWithContext('debug', `Get hue result: ${s}`))));
        return (0, function_1.pipe)(this.getStateGraphQl(determineHueState), TE.match((e) => {
            this.logWithContext('errorT', 'Get hue', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleHueSet(value) {
        this.logWithContext('debug', `Triggered set hue: ${value}`);
        if (typeof value !== 'number') {
            throw this.invalidValueError;
        }
        const newColorName = lightMapper.mapHomeKitHueToAlexaValue(value);
        return (0, function_1.pipe)(newColorName, TE.fromOption(() => this.invalidValueError), TE.flatMap((colorName) => this.platform.alexaApi.setDeviceState(this.device.id, 'setColor', {
            colorName,
        })), TE.match((e) => {
            this.logWithContext('errorT', 'Set hue', e);
            throw this.serviceCommunicationError;
        }, async () => {
            this.updateCacheValue({
                value: {
                    hue: value,
                    saturation: await this.handleSaturationGet(),
                    brightness: await this.handleBrightnessGet(),
                },
                featureName: 'color',
            });
        }))();
    }
    async handleSaturationGet() {
        const determineSaturationState = (0, function_1.flow)(A.findFirst(({ featureName }) => featureName === 'color'), O.flatMap(({ value }) => {
            if (typeof value !== 'object' || typeof value.saturation !== 'number') {
                return O.none;
            }
            return O.of(Math.trunc(value.saturation * 100));
        }), O.tap((s) => O.of(this.logWithContext('debug', `Get saturation result: ${s}%`))));
        return (0, function_1.pipe)(this.getStateGraphQl(determineSaturationState), TE.match((e) => {
            this.logWithContext('errorT', 'Get saturation', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleColorTemperatureGet() {
        const determineColorTemperatureState = (0, function_1.flow)(A.findFirst(({ featureName }) => featureName === 'colorTemperature'), O.tap(({ value }) => O.of(this.logWithContext('debug', `Get color temperature result: ${value} K`))), O.flatMap(({ value }) => {
            if (typeof value !== 'number') {
                return O.none;
            }
            // Clamp the color temperature to a valid range (140 - 500)
            return O.of((0, ts_pattern_1.match)(1000000 / value)
                .when((_) => _ < 140, (0, function_1.constant)(140))
                .when((_) => _ > 500, (0, function_1.constant)(500))
                .otherwise(function_1.identity));
        }));
        return (0, function_1.pipe)(this.getStateGraphQl(determineColorTemperatureState), TE.match((e) => {
            this.logWithContext('errorT', 'Get color temperature', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleColorTemperatureSet(value) {
        this.logWithContext('debug', `Triggered set color temperature: ${value}`);
        if (typeof value !== 'number') {
            throw this.invalidValueError;
        }
        const colorTemperatureInKelvin = 1000000 / value;
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'colorTemperature', 'setColorTemperature', {
            colorTemperatureInKelvin,
        }), TE.match((e) => {
            this.logWithContext('errorT', 'Set color temperature', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: colorTemperatureInKelvin,
                featureName: 'colorTemperature',
            });
        }))();
    }
}
exports.default = LightAccessory;
LightAccessory.requiredOperations = ['turnOn', 'turnOff'];
//# sourceMappingURL=light-accessory.js.map