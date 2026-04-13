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
const mapper = __importStar(require("../mapper/lock-mapper"));
const base_accessory_1 = __importDefault(require("./base-accessory"));
class LockAccessory extends base_accessory_1.default {
    constructor() {
        super(...arguments);
        this.isExternalAccessory = false;
    }
    configureServices() {
        this.service =
            this.platformAcc.getService(this.Service.LockMechanism) ||
                this.platformAcc.addService(this.Service.LockMechanism, this.device.displayName);
        this.service
            .getCharacteristic(this.Characteristic.LockCurrentState)
            .onGet(this.handleCurrentStateGet.bind(this));
        this.service
            .getCharacteristic(this.Characteristic.LockTargetState)
            .onGet(this.handleTargetStateGet.bind(this))
            .onSet(this.handleTargetStateSet.bind(this));
    }
    async handleCurrentStateGet() {
        const alexaValueName = 'lockState';
        const determineCurrentState = (0, function_1.flow)(A.findFirst(({ name, featureName }) => featureName === 'lock' && name === alexaValueName), O.tap(({ value }) => O.of(this.logWithContext('debug', `Get lock state result: ${value}`))), O.map(({ value }) => mapper.mapAlexaCurrentStateToHomeKit(value, this.Characteristic)));
        return (0, function_1.pipe)(this.getStateGraphQl(determineCurrentState), TE.match((e) => {
            this.logWithContext('errorT', 'Get lock state', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleTargetStateGet() {
        const alexaValueName = 'lockState';
        const determineTargetState = (0, function_1.flow)(A.findFirst(({ name, featureName }) => featureName === 'lock' && name === alexaValueName), O.map(({ value }) => mapper.mapAlexaTargetStateToHomeKit(value, this.Characteristic)), O.tap((s) => O.of(this.logWithContext('debug', `Get lock target state result: ${s}`))));
        return (0, function_1.pipe)(this.getStateGraphQl(determineTargetState), TE.match((e) => {
            this.logWithContext('errorT', 'Get lock target state', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleTargetStateSet(value) {
        this.logWithContext('debug', `Triggered set target lock state: ${value}`);
        if (value !== 0 && value !== 1) {
            throw this.invalidValueError;
        }
        const targetState = value === this.Characteristic.LockTargetState.UNSECURED
            ? 'unlock'
            : 'lock';
        return (0, function_1.pipe)(this.platform.alexaApi.setDeviceStateGraphQl(this.device.endpointId, 'lock', targetState), TE.match((e) => {
            this.logWithContext('errorT', 'Set target lock state', e);
            throw this.serviceCommunicationError;
        }, () => {
            this.updateCacheValue({
                value: targetState,
                featureName: 'lock',
            });
        }))();
    }
}
exports.default = LockAccessory;
LockAccessory.requiredOperations = ['lock', 'unlock'];
//# sourceMappingURL=lock-accessory.js.map