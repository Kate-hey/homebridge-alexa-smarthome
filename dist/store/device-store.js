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
const RA = __importStar(require("fp-ts/ReadonlyArray"));
const RR = __importStar(require("fp-ts/ReadonlyRecord"));
const function_1 = require("fp-ts/lib/function");
const fp_util_1 = require("../util/fp-util");
class DeviceStore {
    constructor(performanceSettings) {
        this.cache = {
            lastUpdated: new Date(0),
            states: {},
        };
        this._deviceCapabilities = {};
        this.isCacheFresh = () => this.cache.lastUpdated.getTime() > Date.now() - this.cacheTTL;
        const cacheTTL = (0, fp_util_1.getOrElseNullable)(performanceSettings === null || performanceSettings === void 0 ? void 0 : performanceSettings.cacheTTL, (0, function_1.constant)(60));
        this.cacheTTL = 1000 * cacheTTL;
    }
    get deviceCapabilities() {
        return RR.toRecord(this._deviceCapabilities);
    }
    set deviceCapabilities(deviceCapabilities) {
        this._deviceCapabilities = deviceCapabilities;
    }
    getRangeFeaturesForDevice(deviceId) {
        return (0, function_1.pipe)(this.deviceCapabilities, RR.lookup(deviceId), O.match((0, function_1.constant)({}), function_1.identity));
    }
    getCacheStatesForDevice(deviceId) {
        return (0, function_1.pipe)(this.cache.states, RR.lookup(deviceId), O.match((0, function_1.constant)([]), A.filterMap(function_1.identity)));
    }
    getCacheValue(deviceId, { featureName, name, instance, }) {
        return (0, function_1.pipe)(this.getCacheStatesForDevice(deviceId), A.findFirstMap((cache) => cache.featureName === featureName &&
            (!name || cache.name === name) &&
            (!instance || cache.instance === instance)
            ? O.of(cache)
            : O.none));
    }
    updateCache(deviceIds, statesByDevice) {
        (0, function_1.pipe)(deviceIds, A.map((id) => {
            this.cache.states[id] =
                id in statesByDevice
                    ? (0, function_1.pipe)(statesByDevice, RR.lookup(id), O.flatten, O.map(A.map(O.getRight)), O.getOrElse((0, function_1.constant)(new Array())))
                    : [];
        }), RA.match(function_1.constVoid, () => {
            this.cache.lastUpdated = new Date();
        }));
        return this.cache.states;
    }
    updateCacheValue(deviceId, newState) {
        (0, function_1.pipe)(this.getCacheValue(deviceId, newState), O.tap((cs) => {
            cs.value = newState.value;
            return O.of(cs);
        }));
        return this.cache.states;
    }
}
exports.default = DeviceStore;
//# sourceMappingURL=device-store.js.map