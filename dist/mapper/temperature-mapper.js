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
exports.mapAlexaTempUnitsToHomeKit = exports.mapHomeKitTempToAlexa = exports.mapAlexaTempToHomeKit = void 0;
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const temperature_1 = require("../domain/alexa/temperature");
const util = __importStar(require("../util"));
const mapAlexaTempToHomeKit = (state) => {
    if ((0, temperature_1.isTemperatureValue)(state)) {
        const value = typeof state.value === 'number' ? state.value : parseFloat(state.value);
        return O.of((0, ts_pattern_1.match)(state.scale.toLowerCase())
            .with('fahrenheit', () => util.round((value - 32) / 1.8, 1))
            .otherwise((0, function_1.constant)(value)));
    }
    else {
        return O.none;
    }
};
exports.mapAlexaTempToHomeKit = mapAlexaTempToHomeKit;
const mapHomeKitTempToAlexa = (temp, units) => units.toLowerCase() === 'celsius' ? temp : Math.round(temp * 1.8 + 32);
exports.mapHomeKitTempToAlexa = mapHomeKitTempToAlexa;
const mapAlexaTempUnitsToHomeKit = (state, characteristic) => {
    if ((0, temperature_1.isTemperatureValue)(state)) {
        return O.of((0, ts_pattern_1.match)(state.scale.toLowerCase())
            .with('fahrenheit', (0, function_1.constant)(characteristic.TemperatureDisplayUnits.FAHRENHEIT))
            .otherwise((0, function_1.constant)(characteristic.TemperatureDisplayUnits.CELSIUS)));
    }
    else {
        return O.none;
    }
};
exports.mapAlexaTempUnitsToHomeKit = mapAlexaTempUnitsToHomeKit;
//# sourceMappingURL=temperature-mapper.js.map