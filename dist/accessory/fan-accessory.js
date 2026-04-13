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
        (0, function_1.pipe)(this.rangeFeatures, RR.lookup(fan_1.FanRangeFeatures.airTemperature), O.map((asset) => {
            this.tempSensorService =
                this.platformAcc.getService(this.Service.TemperatureSensor) ||
                    this.platformAcc.addService(this.Service.TemperatureSensor, fan_1.FanRangeFeatures.airTemperature);
            this.tempSensorService
                .getCharacteristic(this.Characteristic.CurrentTemperature)
                .onGet(this.handleCurrentTempGet.bind(this, asset));
        }));
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
}
exports.default = FanAccessory;
FanAccessory.requiredOperations = ['turnOn', 'turnOff'];
//# sourceMappingURL=fan-accessory.js.map