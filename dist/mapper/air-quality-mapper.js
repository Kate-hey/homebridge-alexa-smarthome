"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapAlexaCoLevelToHomeKitDetected = exports.mapAlexaAirQualityToHomeKit = void 0;
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const mapAlexaAirQualityToHomeKit = (value, aq) => (0, ts_pattern_1.match)(value)
    .when((v) => typeof v === 'number' && v >= 65, (0, function_1.constant)(aq.EXCELLENT))
    .when((v) => typeof v === 'number' && v >= 35, (0, function_1.constant)(aq.FAIR))
    .when((v) => typeof v === 'number' && v >= 0, (0, function_1.constant)(aq.POOR))
    .otherwise((0, function_1.constant)(aq.UNKNOWN));
exports.mapAlexaAirQualityToHomeKit = mapAlexaAirQualityToHomeKit;
const mapAlexaCoLevelToHomeKitDetected = (value, co) => (0, ts_pattern_1.match)(value)
    .when((v) => typeof v === 'number' && v <= 10, (0, function_1.constant)(co.CO_LEVELS_NORMAL))
    .otherwise((0, function_1.constant)(co.CO_LEVELS_ABNORMAL));
exports.mapAlexaCoLevelToHomeKitDetected = mapAlexaCoLevelToHomeKitDetected;
//# sourceMappingURL=air-quality-mapper.js.map