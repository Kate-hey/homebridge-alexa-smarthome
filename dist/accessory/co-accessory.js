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
const carbon_monoxide_sensor_1 = require("../domain/alexa/carbon-monoxide-sensor");
const mapper = __importStar(require("../mapper/air-quality-mapper"));
const base_accessory_1 = __importDefault(require("./base-accessory"));
class CarbonMonoxideAccessory extends base_accessory_1.default {
    constructor() {
        super(...arguments);
        this.isExternalAccessory = false;
    }
    configureServices() {
        this.service =
            this.platformAcc.getService(this.Service.CarbonMonoxideSensor) ||
                this.platformAcc.addService(this.Service.CarbonMonoxideSensor, this.device.displayName);
        (0, function_1.pipe)(carbon_monoxide_sensor_1.CarbonMonoxideRangeFeatures, RA.findFirstMap((a) => RR.lookup(a)(this.rangeFeatures)), O.match(() => this.logWithContext('error', `Carbon monoxide sensor was not created for ${this.device.displayName}`), (asset) => {
            this.service
                .getCharacteristic(this.Characteristic.CarbonMonoxideDetected)
                .onGet(this.handleCarbonMonoxideDetectedGet.bind(this, asset));
            this.service
                .getCharacteristic(this.Characteristic.CarbonMonoxideLevel)
                .onGet(this.handleCarbonMonoxideLevelGet.bind(this, asset));
        }));
    }
    async handleCarbonMonoxideDetectedGet(asset) {
        const determineCoDetected = (0, function_1.flow)(A.findFirst(({ featureName, instance }) => featureName === 'range' && asset.instance === instance), O.map(({ value }) => mapper.mapAlexaCoLevelToHomeKitDetected(value, this.Characteristic.CarbonMonoxideDetected)), O.tap((s) => O.of(this.logWithContext('debug', `Get carbon monoxide detected result: ${s}`))));
        return (0, function_1.pipe)(this.getStateGraphQl(determineCoDetected), TE.match((e) => {
            this.logWithContext('errorT', 'Get carbon monoxide detected', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    async handleCarbonMonoxideLevelGet(asset) {
        return (0, function_1.pipe)(this.getStateGraphQl(this.determineLevel(asset)), TE.match((e) => {
            this.logWithContext('errorT', 'Get carbon monoxide level', e);
            throw this.serviceCommunicationError;
        }, function_1.identity))();
    }
    determineLevel(asset) {
        return (0, function_1.flow)(A.findFirst(({ featureName, instance }) => featureName === 'range' && asset.instance === instance), O.tap(({ value }) => O.of(this.logWithContext('debug', `Get ${asset.rangeName}: ${value}`))), O.flatMap(({ value }) => typeof value === 'number' ? O.of(value) : O.none));
    }
}
exports.default = CarbonMonoxideAccessory;
CarbonMonoxideAccessory.requiredOperations = [];
//# sourceMappingURL=co-accessory.js.map