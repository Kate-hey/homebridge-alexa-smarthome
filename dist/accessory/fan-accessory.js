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
const RR = __importStar(require("fp-ts/ReadonlyRecord"));
const TE = __importStar(require("fp-ts/TaskEither"));
const function_1 = require("fp-ts/lib/function");
const fan_1 = require("../domain/alexa/fan");
const mapper = __importStar(require("../mapper/fan-mapper"));
const tempMapper = __importStar(require("../mapper/temperature-mapper"));
const base_accessory_1 = __importDefault(require("./base-accessory"));
class FanAccessory extends base_accessory_1.default {
    constructor() {
        super(...arguments);
        this.isExternalAccessory = false;
    }
    configureServices() {
        this.service =
            this.platformAcc.getService(this.Service.Fanv2) ||
                this.platformAcc.addService(this.Service.Fanv2, this.device.displayName);
        this.service
            .getCharacteristic(this.Characteristic.Active)
            .onGet(this.handleActiveGet.bind(this))
            .onSet(this.handleActiveSet.bind(this));
        // Remove stale RotationSpeed characteristic if present from previous version
        if (this.service.testCharacteristic(this.Characteristic.RotationSpeed)) {
            this.service.removeCharacteristic(this.service.getCharacteristic(this.Characteristic.RotationSpeed));
        }
        // Remove stale Switch service (old Auto Mode) if present
        const staleSwitch = this.platformAcc.getService(this.Service.Switch);
        if (staleSwitch) {
            this.platformAcc.removeService(staleSwitch);
        }
        // Remove stale TemperatureSensor service if present (now part of HeaterCooler)
        const staleTempSensor = this.platformAcc.getService(this.Service.TemperatureSensor);
        if (staleTempSensor) {
            this.platformAcc.removeService(staleTempSensor);
        }
        // Look up range features for temperature
        const maybeAirTemp = (0, function_1.pipe)(this.rangeFeatures, RR.lookup(fan_1.FanRangeFeatures.airTemperature));
        const maybeSetTemp = (0, function_1.pipe)(this.rangeFeatures, RR.lookup(fan_1.FanRangeFeatures.setTemperature));
        if (O.isSome(maybeAirTemp) || O.isSome(maybeSetTemp)) {
            this.airTempAsset = O.isSome(maybeAirTemp)
                ? maybeAirTemp.value
                : undefined;
            this.setTempAsset = O.isSome(maybeSetTemp)
                ? maybeSetTemp.value
                : undefined;
            this.heaterCoolerService =
                this.platformAcc.getService(this.Service.HeaterCooler) ||
                    this.platformAcc.addService(this.Service.HeaterCooler, 'Temperature Control');
            // Active — maps to Auto Mode toggle (instance 4)
            this.heaterCoolerService
                .getCharacteristic(this.Characteristic.Active)
                .onGet(this.handleAutoModeGet.bind(this))
                .onSet(this.handleAutoModeSet.bind(this));
            // CurrentHeaterCoolerState — read-only, COOLING when auto on, INACTIVE when off
            this.heaterCoolerService
                .getCharacteristic(this.Characteristic.CurrentHeaterCoolerState)
                .onGet(this.handleCurrentHeaterCoolerStateGet.bind(this));
            // TargetHeaterCoolerState — locked to COOL
            this.heaterCoolerService
                .getCharacteristic(this.Characteristic.TargetHeaterCoolerState)
                .setProps({
                validValues: [
                    this.Characteristic.TargetHeaterCoolerState.COOL,
                ],
            })
                .onGet(() => this.Characteristic.TargetHeaterCoolerState.COOL)
                .onSet(() => { });
            // CurrentTemperature — ambient air temperature (instance 5)
            if (this.airTempAsset) {
                this.heaterCoolerService
                    .getCharacteristic(this.Characteristic.CurrentTemperature)
                    .onGet(this.handleCurrentTempGet.bind(this, this.airTempAsset));
            }
            // CoolingThresholdTemperature — set temperature (instance 3)
            if (this.setTempAsset) {
                this.heaterCoolerService
                    .getCharacteristic(this.Characteristic.CoolingThresholdTemperature)
                    .setProps({ minValue: 15, maxValue: 33, minStep: 0.5 })
                    .onGet(this.handleSetTempGet.bind(this, this.setTempAsset))
                    .onSet(this.handleSetTempSet.bind(this, this.setTempAsset));
            }
            // TemperatureDisplayUnits — Fahrenheit (read-only)
            this.heaterCoolerService
                .getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
                .onGet(() => this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT)
                .onSet(() => {
                throw this.readOnlyError;
            });
        }
    }
    async handleActiveGet() {
        const determinePowerState = (0, function_1.flow)(A.findFirst(({ featureName }) => featureName === 'power'), O.tap(({ value }) => O.of(this.logWithContext('debug', `Get power result: ${value}`))), O.map(({ value }) => value === 'ON'));
        return (0, function_1.pipe)(this.getStateGraphQl(determinePowerState), TE.match((e) => {
            this.logWithContext('errorT', 'Get power', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleActiveSet(value) {
        this.logWithContext('debug', `Triggered set power: ${value}`);
        if (typeof value !== 'number') {
            throw this.invalidValueError;
        }
        const action = mapper.mapHomeKitPowerToAlexaAction(value, this.Characteristic);
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'power', action), TE.match((e) => {
            this.logWithContext('errorT', 'Set power', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: mapper.mapHomeKitPowerToAlexaValue(value, this.Characteristic),
                featureName: 'power',
            });
        }))();
    }
    async handleCurrentTempGet(asset) {
        const determineCurrentTemp = (0, function_1.flow)(A.findFirst(({ featureName, instance }) => featureName === 'range' && asset.instance === instance), O.flatMap(({ value }) => typeof value === 'number'
            ? tempMapper.mapAlexaTempToHomeKit({ value, scale: 'FAHRENHEIT' })
            : O.none), O.tap((s) => O.of(this.logWithContext('debug', `Get current temperature result: ${s}`))));
        return (0, function_1.pipe)(this.getStateGraphQl(determineCurrentTemp), TE.match((e) => {
            this.logWithContext('errorT', 'Get current temperature', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleSetTempGet(asset) {
        const determineSetTemp = (0, function_1.flow)(A.findFirst(({ featureName, instance }) => featureName === 'range' && asset.instance === instance), O.flatMap(({ value }) => typeof value === 'number'
            ? tempMapper.mapAlexaTempToHomeKit({ value, scale: 'FAHRENHEIT' })
            : O.none), O.tap((s) => O.of(this.logWithContext('debug', `Get set temperature result: ${s} Celsius`))));
        return (0, function_1.pipe)(this.getStateGraphQl(determineSetTemp), TE.match((e) => {
            this.logWithContext('errorT', 'Get set temperature', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleSetTempSet(asset, value) {
        this.logWithContext('debug', `Triggered set temperature: ${value}`);
        if (typeof value !== 'number') {
            throw this.invalidValueError;
        }
        const fahrenheit = tempMapper.mapHomeKitTempToAlexa(value, 'FAHRENHEIT');
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'range', 'setRangeValue', { rangeValue: fahrenheit }, asset.instance), TE.match((e) => {
            this.logWithContext('errorT', 'Set temperature', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: fahrenheit,
                featureName: 'range',
                instance: asset.instance,
            });
        }))();
    }
    async handleAutoModeGet() {
        const determineToggleState = (0, function_1.flow)(A.findFirst(({ featureName }) => featureName === 'toggle'), O.tap(({ value }) => O.of(this.logWithContext('debug', `Get auto mode result: ${value}`))), O.map(({ value }) => value === 'ON'
            ? this.Characteristic.Active.ACTIVE
            : this.Characteristic.Active.INACTIVE));
        return (0, function_1.pipe)(this.getStateGraphQl(determineToggleState), TE.match((e) => {
            this.logWithContext('errorT', 'Get auto mode', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleAutoModeSet(value) {
        this.logWithContext('debug', `Triggered set auto mode: ${value}`);
        if (typeof value !== 'number') {
            throw this.invalidValueError;
        }
        const action = value === this.Characteristic.Active.ACTIVE ? 'turnOn' : 'turnOff';
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'toggle', action, {}, '4'), TE.match((e) => {
            this.logWithContext('errorT', 'Set auto mode', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: value === this.Characteristic.Active.ACTIVE ? 'ON' : 'OFF',
                featureName: 'toggle',
            });
        }))();
    }
    async handleCurrentHeaterCoolerStateGet() {
        const determineState = (0, function_1.flow)(A.findFirst(({ featureName }) => featureName === 'toggle'), O.map(({ value }) => value === 'ON'
            ? this.Characteristic.CurrentHeaterCoolerState.COOLING
            : this.Characteristic.CurrentHeaterCoolerState.INACTIVE));
        return (0, function_1.pipe)(this.getStateGraphQl(determineState), TE.match((e) => {
            this.logWithContext('errorT', 'Get heater cooler state', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
}
exports.default = FanAccessory;
FanAccessory.requiredOperations = ['turnOn', 'turnOff'];
//# sourceMappingURL=fan-accessory.js.map