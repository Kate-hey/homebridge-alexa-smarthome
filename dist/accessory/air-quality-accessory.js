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
const RA = __importStar(require("fp-ts/ReadonlyArray"));
const RR = __importStar(require("fp-ts/ReadonlyRecord"));
const TE = __importStar(require("fp-ts/TaskEither"));
const function_1 = require("fp-ts/lib/function");
const air_quality_monitor_1 = require("../domain/alexa/air-quality-monitor");
const mapper = __importStar(require("../mapper/air-quality-mapper"));
const base_accessory_1 = __importDefault(require("./base-accessory"));
class AirQualityAccessory extends base_accessory_1.default {
    constructor() {
        super(...arguments);
        this.isExternalAccessory = false;
    }
    configureServices() {
        this.service =
            this.platformAcc.getService(this.Service.AirQualitySensor) ||
                this.platformAcc.addService(this.Service.AirQualitySensor, this.device.displayName);
        (0, function_1.pipe)(air_quality_monitor_1.AirQualityRangeFeatures, RA.findFirstMap((a) => RR.lookup(a)(this.rangeFeatures)), O.match(() => this.logWithContext('error', `Air quality sensor was not created for ${this.device.displayName}`), (asset) => {
            this.service
                .getCharacteristic(this.Characteristic.AirQuality)
                .onGet(this.handleAirQualityGet.bind(this, asset));
        }));
        (0, function_1.pipe)(this.rangeFeatures, RR.lookup('Particulate matter'), O.map((asset) => {
            this.service
                .getCharacteristic(this.Characteristic.PM2_5Density)
                .onGet(this.handlePM25DensityGet.bind(this, asset));
        }));
        (0, function_1.pipe)(this.rangeFeatures, RR.lookup('Volatile organic compounds'), O.map((asset) => {
            this.service
                .getCharacteristic(this.Characteristic.VOCDensity)
                .onGet(this.handleVocDensityGet.bind(this, asset));
        }));
    }
    async handleAirQualityGet(asset) {
        const determineAirQuality = (0, function_1.flow)(A.findFirst(({ featureName, instance }) => featureName === 'range' && asset.instance === instance), O.tap(({ value }) => O.of(this.logWithContext('debug', `Get air quality result: ${value}`))), O.map(({ value }) => mapper.mapAlexaAirQualityToHomeKit(value, this.Characteristic.AirQuality)));
        return (0, function_1.pipe)(this.getStateGraphQl(determineAirQuality), TE.match((e) => {
            this.logWithContext('errorT', 'Get air quality', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handlePM25DensityGet(asset) {
        return (0, function_1.pipe)(this.getStateGraphQl(this.determineDensity(asset)), TE.match((e) => {
            this.logWithContext('errorT', 'Get PM2.5 density', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleVocDensityGet(asset) {
        return (0, function_1.pipe)(this.getStateGraphQl(this.determineDensity(asset)), TE.match((e) => {
            this.logWithContext('errorT', 'Get VOC density', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    determineDensity(asset) {
        return (0, function_1.flow)(A.findFirst(({ featureName, instance }) => featureName === 'range' && asset.instance === instance), O.flatMap(({ value }) => typeof value === 'number' ? O.of(value) : O.none), O.tap((s) => O.of(this.logWithContext('debug', `Get ${asset.rangeName}: ${s}`))));
    }
}
exports.default = AirQualityAccessory;
AirQualityAccessory.requiredOperations = [];
//# sourceMappingURL=air-quality-accessory.js.map