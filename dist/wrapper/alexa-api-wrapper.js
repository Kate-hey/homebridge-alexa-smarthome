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
exports.AlexaApiWrapper = void 0;
const async_mutex_1 = require("async-mutex");
const A = __importStar(require("fp-ts/Array"));
const E = __importStar(require("fp-ts/Either"));
const O = __importStar(require("fp-ts/Option"));
const TE = __importStar(require("fp-ts/TaskEither"));
const boolean_1 = require("fp-ts/boolean");
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const errors_1 = require("../domain/alexa/errors");
const get_device_state_js_1 = require("../domain/alexa/get-device-state.js");
const get_devices_1 = require("../domain/alexa/get-devices");
const save_device_capabilities_1 = require("../domain/alexa/save-device-capabilities");
const set_device_state_js_1 = require("../domain/alexa/set-device-state.js");
const graphql_1 = require("./graphql");
class AlexaApiWrapper {
    constructor(service, alexaRemote, log, deviceStore) {
        this.service = service;
        this.alexaRemote = alexaRemote;
        this.log = log;
        this.deviceStore = deviceStore;
        this.doesCacheContainAllIds = (cachedIds, queryIds) => queryIds.every((id) => {
            return cachedIds.includes(id);
        });
        this.semaphore = (0, async_mutex_1.withTimeout)(new async_mutex_1.Semaphore(2, new errors_1.TimeoutError('Alexa API Timeout')), 65000);
    }
    getDevices() {
        const excludeHomebridgeAlexaPluginDevices = (e) => !(Array.isArray(e.endpointReports) ? e.endpointReports : []).some(({ reporter }) => {
            var _a, _b;
            return (((_a = reporter === null || reporter === void 0 ? void 0 : reporter.skillStage) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'development' &&
                reporter.id ===
                    'amzn1.ask.skill.a28c43e1-cba6-4aac-93ca-509e8c7ce39b') ||
                (((_b = reporter === null || reporter === void 0 ? void 0 : reporter.skillStage) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'live' &&
                    reporter.id ===
                        'amzn1.ask.skill.2af008bb-2bb0-4bef-b131-e191f944a87e');
        });
        return (0, function_1.pipe)(TE.tryCatch(() => this.executeGraphQlQuery(graphql_1.EndpointsQuery), (reason) => new errors_1.HttpError(`Error getting smart home devices. Reason: ${reason.message}`)), TE.flatMapEither(get_devices_1.validateGetDevicesSuccessful), TE.map(A.filter(([e]) => excludeHomebridgeAlexaPluginDevices(e))), TE.tapIO((devices) => {
            this.deviceStore.deviceCapabilities = (0, save_device_capabilities_1.extractRangeFeatures)(devices);
            devices.forEach(([e, d]) => {
                this.log.debug(`${d.displayName} ::: Raw device features: ${JSON.stringify(e.features, undefined, 2)}`)();
                const states = (0, get_device_state_js_1.extractStates)(e.features);
                this.log.debug(`${d.displayName} ::: Device states: ${JSON.stringify(states, undefined, 2)}`);
                this.deviceStore.updateCache([d.id], {
                    [d.id]: O.of(states.map(E.right)),
                });
            });
            return this.log.debug('Successfully obtained devices and their capabilities');
        }), TE.map(A.map(([, d]) => d)));
    }
    getDeviceStateGraphQl(device, service, useCache) {
        const { AirQualitySensor, CarbonMonoxideSensor, Fanv2, HumiditySensor, Lightbulb, LockMechanism, TemperatureSensor, Thermostat, } = this.service;
        return (0, function_1.pipe)(TE.tryCatch(() => this.semaphore.acquire(), (e) => e), TE.map((_) => useCache), TE.flatMap((0, boolean_1.match)(() => (0, function_1.pipe)(TE.of((0, ts_pattern_1.match)(service.UUID)
            .with(AirQualitySensor.UUID, (0, function_1.constant)(graphql_1.AirQualityQuery))
            .with(Fanv2.UUID, (0, function_1.constant)(graphql_1.FanQuery))
            .with(Lightbulb.UUID, (0, function_1.constant)(graphql_1.LightQuery))
            .with(LockMechanism.UUID, (0, function_1.constant)(graphql_1.LockQuery))
            .with(TemperatureSensor.UUID, (0, function_1.constant)(graphql_1.TempSensorQuery))
            .with(Thermostat.UUID, (0, function_1.constant)(graphql_1.ThermostatQuery))
            .with(ts_pattern_1.Pattern.union(CarbonMonoxideSensor.UUID, HumiditySensor.UUID), (0, function_1.constant)(graphql_1.RangeQuery))
            .otherwise((0, function_1.constant)(graphql_1.PowerQuery))), TE.tapIO((query) => this.log.debug(`Querying for changes to ${device.displayName} using ${query.substring(0, query.indexOf('('))}`)), TE.flatMap((query) => TE.tryCatch(() => this.executeGraphQlQuery(query, {
            endpointId: device.endpointId,
        }), (reason) => new errors_1.HttpError(`Error getting smart home device state for ${device.displayName}. Reason: ${reason.message}`))), TE.map((_) => (0, get_device_state_js_1.extractStates)(_.data.endpoint.features)), TE.map((states) => {
            this.deviceStore.updateCache([device.id], {
                [device.id]: O.of(states.map(E.right)),
            });
            return [false, states];
        })), () => (0, function_1.pipe)(TE.of([
            true,
            this.deviceStore.getCacheStatesForDevice(device.id),
        ]), TE.tapIO(() => this.log.debug('Obtained device state from cache'))))), TE.mapBoth((e) => {
            this.semaphore.release();
            return e;
        }, (res) => {
            this.semaphore.release();
            return res;
        }));
    }
    setDeviceStateGraphQl(endpointId, featureName, featureOperationName, payload = {}, instance) {
        const request = {
            endpointId,
            featureOperationName,
            featureName,
            ...(instance ? { instance } : {}),
            ...(Object.keys(payload).length > 0 ? { payload } : {}),
        };
        return (0, function_1.pipe)(TE.tryCatch(() => this.executeGraphQlQuery(graphql_1.SetEndpointFeatures, {
            featureControlRequests: [request],
        }), (reason) => new errors_1.HttpError(`Error setting smart home device state. Reason: ${reason.message}`)), TE.map(function_1.constVoid));
    }
    setDeviceState(deviceId, action, parameters = {}, entityType = 'APPLIANCE') {
        return (0, function_1.pipe)(TE.tryCatch(() => this.changeDeviceState(deviceId, { action, ...parameters }, entityType), (reason) => new errors_1.HttpError(`Error setting smart home device state. Reason: ${reason.message}`)), TE.flatMapEither(set_device_state_js_1.validateSetStateSuccessful), TE.map(function_1.constVoid));
    }
    async executeGraphQlQuery(query, variables = {}) {
        const flags = {
            method: 'POST',
            data: JSON.stringify({
                query,
                variables,
            }),
        };
        return AlexaApiWrapper.toPromise((cb) => this.alexaRemote.httpsGet(false, '/nexus/v1/graphql', cb, flags));
    }
    changeDeviceState(entityId, parameters, entityType = 'APPLIANCE') {
        return AlexaApiWrapper.toPromise(this.alexaRemote.executeSmarthomeDeviceAction.bind(this.alexaRemote, [entityId], 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parameters, entityType));
    }
    static async toPromise(fn) {
        return new Promise((resolve, reject) => fn((error, body) => (0, function_1.pipe)(!!error, (0, boolean_1.match)(() => resolve(body), () => reject(error)))));
    }
    queryDeviceStates(entityIds, entityType) {
        return TE.tryCatch(() => AlexaApiWrapper.toPromise(this.alexaRemote.querySmarthomeDevices.bind(this.alexaRemote, entityIds, entityType)), (reason) => new errors_1.HttpError(`Error getting smart home device state. Reason: ${reason.message}`));
    }
}
exports.AlexaApiWrapper = AlexaApiWrapper;
//# sourceMappingURL=alexa-api-wrapper.js.map