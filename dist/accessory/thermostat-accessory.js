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
const temperature_1 = require("../domain/alexa/temperature");
const mapper = __importStar(require("../mapper/power-mapper"));
const tempMapper = __importStar(require("../mapper/temperature-mapper"));
const tstatMapper = __importStar(require("../mapper/thermostat-mapper"));
const util = __importStar(require("../util"));
const base_accessory_1 = __importDefault(require("./base-accessory"));
class ThermostatAccessory extends base_accessory_1.default {
    constructor() {
        super(...arguments);
        this.isExternalAccessory = false;
        this.isPowerSupported = true;
    }
    configureServices() {
        this.service =
            this.platformAcc.getService(this.Service.Thermostat) ||
                this.platformAcc.addService(this.Service.Thermostat, this.device.displayName);
        // this.service
        //   .getCharacteristic(
        //     this.platform.Characteristic.CurrentHeatingCoolingState,
        //   )
        //   .onGet(this.handleCurrentStateGet.bind(this));
        this.service
            .getCharacteristic(this.Characteristic.CurrentTemperature)
            .onGet(this.handleCurrentTempGet.bind(this));
        this.service
            .getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
            .onGet(this.handleTempUnitsGet.bind(this))
            .onSet(() => {
            throw this.readOnlyError;
        });
        this.service
            .getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
            .onGet(this.handleTargetStateGet.bind(this))
            .onSet(this.handleTargetStateSet.bind(this));
        this.service
            .getCharacteristic(this.Characteristic.TargetTemperature)
            .onGet(this.handleTargetTempGet.bind(this))
            .onSet(this.handleTargetTempSet.bind(this));
        this.service
            .getCharacteristic(this.Characteristic.CoolingThresholdTemperature)
            .onGet(this.handleCoolTempGet.bind(this))
            .onSet(this.handleCoolTempSet.bind(this));
        this.service
            .getCharacteristic(this.Characteristic.HeatingThresholdTemperature)
            .onGet(this.handleHeatTempGet.bind(this))
            .onSet(this.handleHeatTempSet.bind(this));
        (0, function_1.pipe)(this.rangeFeatures, RR.lookup('Indoor humidity'), O.map((asset) => {
            this.service
                .getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
                .onGet(this.handleCurrentRelativeHumidityGet.bind(this, asset));
        }));
    }
    async handleCurrentTempGet() {
        const determineCurrentTemp = (0, function_1.flow)(A.findFirst(({ featureName }) => featureName === 'temperatureSensor'), O.flatMap(({ value }) => tempMapper.mapAlexaTempToHomeKit(value)), O.tap((s) => O.of(this.logWithContext('debug', `Get current temperature result: ${s}`))));
        return (0, function_1.pipe)(this.getStateGraphQl(determineCurrentTemp), TE.match((e) => {
            this.logWithContext('errorT', 'Get current temperature', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleCurrentRelativeHumidityGet(asset) {
        const determineCurrentRelativeHumidity = (0, function_1.flow)(A.findFirst(({ featureName, instance }) => featureName === 'range' && asset.instance === instance), O.flatMap(({ value }) => typeof value === 'number' ? O.of(value) : O.none), O.tap((s) => O.of(this.logWithContext('debug', `Get current humidity result: ${s}`))));
        return (0, function_1.pipe)(this.getStateGraphQl(determineCurrentRelativeHumidity), TE.match((e) => {
            this.logWithContext('errorT', 'Get current humidity', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleTempUnitsGet() {
        const determineTempUnits = (0, function_1.flow)(A.findFirst(({ featureName }) => featureName === 'temperatureSensor'), O.tap(({ value }) => {
            return O.of(this.logWithContext('debug', `Get temperature units result: ${util.isRecord(value) ? value.scale : 'Unknown'}`));
        }), O.flatMap(({ value }) => tempMapper.mapAlexaTempUnitsToHomeKit(value, this.Characteristic)));
        return (0, function_1.pipe)(this.getStateGraphQl(determineTempUnits), TE.match((e) => {
            this.logWithContext('errorT', 'Get temperature units', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleTargetStateGet() {
        let isDeviceOn = true;
        try {
            isDeviceOn = this.isPowerSupported ? await this.handlePowerGet() : true;
        }
        catch (e) {
            this.logWithContext('debug', 'Skipping power-related logic for unsupported devices', e);
            this.isPowerSupported = false;
            isDeviceOn = true;
        }
        const alexaValueName = 'thermostatMode';
        const determineTargetState = (0, function_1.flow)(A.findFirst(({ name, featureName }) => featureName === 'thermostat' && name === alexaValueName), O.tap(({ value }) => O.of(this.logWithContext('debug', `Get target state result: ${value}. Is device on: ${isDeviceOn}`))), O.map(({ value }) => isDeviceOn
            ? tstatMapper.mapAlexaModeToHomeKit(value, this.Characteristic)
            : tstatMapper.mapAlexaModeToHomeKit(0, this.Characteristic)));
        return (0, function_1.pipe)(this.getStateGraphQl(determineTargetState), TE.match((e) => {
            this.logWithContext('errorT', 'Get target state', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleTargetStateSet(value) {
        this.logWithContext('debug', `Triggered set target state: ${value}`);
        if (typeof value !== 'number') {
            throw this.invalidValueError;
        }
        let isDeviceOn;
        try {
            isDeviceOn = this.isPowerSupported ? await this.handlePowerGet() : true;
        }
        catch (e) {
            this.logWithContext('debug', 'Skipping power-related logic for unsupported devices', e);
            this.isPowerSupported = false;
            isDeviceOn = true;
        }
        if (value === 0 && this.isPowerSupported) {
            await this.handlePowerSet(false);
            this.updateCacheValue({
                value: tstatMapper.mapHomekitModeToAlexa(value, this.Characteristic),
                featureName: 'thermostat',
                name: 'thermostatMode',
            });
        }
        else {
            if (!isDeviceOn) {
                await this.handlePowerSet(true);
            }
            else {
                return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'thermostat', 'setThermostatMode', {
                    thermostatMode: tstatMapper.mapHomekitModeToAlexa(value, this.Characteristic),
                }), TE.match((e) => {
                    this.logWithContext('errorT', 'Set target state error', e);
                    throw this.serviceCommunicationError;
                }, () => {
                    this.updateCacheValue({
                        value: tstatMapper.mapHomekitModeToAlexa(value, this.Characteristic),
                        featureName: 'thermostat',
                        name: 'thermostatMode',
                    });
                }))();
            }
        }
    }
    // async handleCurrentStateGet(): Promise<number> {
    //   const alexaNamespace: ThermostatNamespacesType =
    //     'Alexa.ThermostatController.HVAC.Components';
    //   const alexaValueNameHeat = 'primaryHeaterOperation';
    //   const alexaValueNameCool = 'coolerOperation';
    //   const alexaValueValueOFF = 'OFF';
    //   const determineCurrentState = flow(
    //     O.map<ThermostatState[], number>((thermostatStateArr) =>
    //       pipe(
    //         thermostatStateArr,
    //         A.findFirstMap(({ namespace, name, value }) => {
    //           if (value !== alexaValueValueOFF) {
    //             if (namespace === alexaNamespace && name === alexaValueNameHeat) {
    //               return O.of(
    //                 this.Characteristic.CurrentHeatingCoolingState.HEAT,
    //               );
    //             } else if (
    //               namespace === alexaNamespace &&
    //               name === alexaValueNameCool
    //             ) {
    //               return O.of(
    //                 this.Characteristic.CurrentHeatingCoolingState.COOL,
    //               );
    //             }
    //           }
    //           return O.none;
    //         }),
    //         O.getOrElse(() => this.Characteristic.CurrentHeatingCoolingState.OFF),
    //       ),
    //     ),
    //     O.tap((s) =>
    //       O.of(
    //         this.logWithContext(
    //           'debug',
    //           `Get thermostat current state result: ${s}`,
    //         ),
    //       ),
    //     ),
    //   );
    //   return pipe(
    //     this.getState(determineCurrentState),
    //     TE.match((e) => {
    //       this.logWithContext('errorT', 'Get thermostat current state', e);
    //       throw this.serviceCommunicationError;
    //     }, identity),
    //   )();
    // }
    async handleTargetTempGet() {
        const alexaValueName = 'targetSetpoint';
        const determineTargetTemp = (0, function_1.flow)(A.findFirst(({ name, featureName }) => featureName === 'thermostat' && name === alexaValueName), O.flatMap(({ value }) => tempMapper.mapAlexaTempToHomeKit(value)), O.tap((s) => O.of(this.logWithContext('debug', `Get target temperature result: ${s} Celsius`))));
        const targetTempOnAuto = this.calculateTargetTemp();
        if (this.onInvalidOrAutoMode() && O.isSome(targetTempOnAuto)) {
            return targetTempOnAuto.value;
        }
        else {
            return (0, function_1.pipe)(this.getStateGraphQl(determineTargetTemp), TE.match((e) => {
                this.logWithContext('errorT', 'Get target temperature', e);
                throw this.serviceCommunicationError;
            }, function_1.identity))();
        }
    }
    async handleTargetTempSet(value) {
        this.logWithContext('debug', `Triggered set target temperature: ${value}`);
        const maybeTemp = this.getCacheValue('temperatureSensor');
        //If received bad data stop
        //If in Auto mode stop
        if (this.onInvalidOrAutoMode() || !this.isTempWithScale(maybeTemp)) {
            return;
        }
        if (typeof value !== 'number') {
            throw this.invalidValueError;
        }
        const units = maybeTemp.value.scale.toUpperCase();
        const newTemp = tempMapper.mapHomeKitTempToAlexa(value, units);
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'thermostat', 'setTargetSetpoint', {
            targetSetpoint: {
                value: newTemp.toString(10),
                scale: units,
            },
        }), TE.match((e) => {
            this.logWithContext('errorT', 'Set target temperature', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: {
                    value: newTemp,
                    scale: units,
                },
                featureName: 'thermostat',
                name: 'targetSetpoint',
            });
        }))();
    }
    async handleCoolTempGet() {
        const alexaValueName = 'upperSetpoint';
        const determineCoolTemp = (0, function_1.flow)(A.findFirst(({ name, featureName }) => featureName === 'thermostat' && name === alexaValueName), O.flatMap(({ value }) => tempMapper.mapAlexaTempToHomeKit(value)), O.tap((s) => O.of(this.logWithContext('debug', `Get cooling temperature result: ${s} Celsius`))));
        const autoTemp = this.getAutoTempFromTargetTemp();
        if (this.onAutoMode() || O.isNone(autoTemp)) {
            return (0, function_1.pipe)(this.getStateGraphQl(determineCoolTemp), TE.match((e) => {
                this.logWithContext('errorT', 'Get cooling temperature', e);
                throw this.serviceCommunicationError;
            }, function_1.identity))();
        }
        else {
            return autoTemp.value;
        }
    }
    async handleCoolTempSet(value) {
        this.logWithContext('debug', `Triggered set cooling temperature: ${value}`);
        if (typeof value !== 'number') {
            throw this.invalidValueError;
        }
        const { units, coolTemp, heatTemp } = this.getCachedTemps();
        const newCoolTemp = tempMapper.mapHomeKitTempToAlexa(value, units);
        if (newCoolTemp === coolTemp.value) {
            this.logWithContext('debug', `Skipping set cool temp since temp is already ${newCoolTemp}`);
            return;
        }
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'thermostat', 'setTargetSetpoint', {
            lowerSetpoint: {
                value: heatTemp.value.toString(10),
                scale: units,
            },
            upperSetpoint: {
                value: newCoolTemp.toString(10),
                scale: units,
            },
        }), TE.match((e) => {
            this.logWithContext('errorT', 'Set cooling temperature', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: {
                    value: newCoolTemp,
                    scale: units,
                },
                featureName: 'thermostat',
                name: 'upperSetpoint',
            });
        }))();
    }
    async handleHeatTempGet() {
        const alexaValueName = 'lowerSetpoint';
        const determineHeatTemp = (0, function_1.flow)(A.findFirst(({ name, featureName }) => featureName === 'thermostat' && name === alexaValueName), O.flatMap(({ value }) => tempMapper.mapAlexaTempToHomeKit(value)), O.tap((s) => O.of(this.logWithContext('debug', `Get heating temperature result: ${s} Celsius`))));
        const autoTemp = this.getAutoTempFromTargetTemp();
        if (this.onAutoMode() || O.isNone(autoTemp)) {
            return (0, function_1.pipe)(this.getStateGraphQl(determineHeatTemp), TE.match((e) => {
                this.logWithContext('errorT', 'Get heating temperature', e);
                throw this.serviceCommunicationError;
            }, function_1.identity))();
        }
        else {
            return autoTemp.value;
        }
    }
    async handleHeatTempSet(value) {
        this.logWithContext('debug', `Triggered set heating temperature: ${value}`);
        if (typeof value !== 'number') {
            throw this.invalidValueError;
        }
        const { units, coolTemp, heatTemp } = this.getCachedTemps();
        const newHeatTemp = tempMapper.mapHomeKitTempToAlexa(value, units);
        if (newHeatTemp === heatTemp.value) {
            this.logWithContext('debug', `Skipping set heat temp since temp is already ${newHeatTemp}`);
            return;
        }
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'thermostat', 'setTargetSetpoint', {
            lowerSetpoint: {
                value: newHeatTemp.toString(10),
                scale: units,
            },
            upperSetpoint: {
                value: coolTemp.value.toString(10),
                scale: units,
            },
        }), TE.match((e) => {
            this.logWithContext('errorT', 'Set heating temperature', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: {
                    value: newHeatTemp,
                    scale: units,
                },
                featureName: 'thermostat',
                name: 'lowerSetpoint',
            });
        }))();
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
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'thermostat', action), TE.match((e) => {
            this.logWithContext('errorT', 'Set power', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: mapper.mapHomeKitPowerToAlexaValue(value),
                featureName: 'power',
            });
        }))();
    }
    getAutoTempFromTargetTemp() {
        const featureName = 'thermostat';
        const alexaValueName = 'targetSetpoint';
        const maybeTargetTemp = this.getCacheValue(featureName, alexaValueName);
        if (this.isTempWithScale(maybeTargetTemp)) {
            return tempMapper.mapAlexaTempToHomeKit({
                value: maybeTargetTemp.value.value,
                scale: maybeTargetTemp.value.scale.toUpperCase(),
            });
        }
        else {
            return O.none;
        }
    }
    calculateTargetTemp() {
        const featureName = 'thermostat';
        const maybeHeatTemp = this.getCacheValue(featureName, 'lowerSetpoint');
        const maybeCoolTemp = this.getCacheValue(featureName, 'upperSetpoint');
        if (this.isTempWithScale(maybeHeatTemp) &&
            this.isTempWithScale(maybeCoolTemp)) {
            const heatTemp = maybeHeatTemp.value.value;
            const coolTemp = maybeCoolTemp.value.value;
            return tempMapper.mapAlexaTempToHomeKit({
                value: (coolTemp + heatTemp) / 2,
                scale: maybeCoolTemp.value.scale.toUpperCase(),
            });
        }
        else {
            return O.none;
        }
    }
    isTempWithScale(value) {
        return O.isSome(value) && (0, temperature_1.isTemperatureValue)(value.value);
    }
    onInvalidOrAutoMode() {
        return (0, function_1.pipe)(this.getCacheValue('thermostat', 'thermostatMode'), O.match(function_1.constTrue, (m) => m === 'AUTO'));
    }
    onAutoMode() {
        return (0, function_1.pipe)(this.getCacheValue('thermostat', 'thermostatMode'), O.match(function_1.constFalse, (m) => m === 'AUTO'));
    }
    getCachedTemps() {
        const maybeCoolTemp = this.getCacheValue('thermostat', 'upperSetpoint');
        const maybeHeatTemp = this.getCacheValue('thermostat', 'lowerSetpoint');
        if (!this.isTempWithScale(maybeCoolTemp) ||
            !this.isTempWithScale(maybeHeatTemp)) {
            throw this.notAllowedError;
        }
        const coolTemp = maybeCoolTemp.value;
        const heatTemp = maybeHeatTemp.value;
        if (typeof coolTemp.value !== 'number' ||
            typeof heatTemp.value !== 'number') {
            throw this.invalidValueError;
        }
        const units = coolTemp.scale.toUpperCase();
        return {
            units,
            coolTemp,
            heatTemp,
        };
    }
}
exports.default = ThermostatAccessory;
ThermostatAccessory.requiredOperations = ['setTargetSetpoint'];
//# sourceMappingURL=thermostat-accessory.js.map