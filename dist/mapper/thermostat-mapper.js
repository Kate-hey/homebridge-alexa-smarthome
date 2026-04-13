"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHomekitModeToAlexa = exports.mapAlexaModeToHomeKit = void 0;
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const mapAlexaModeToHomeKit = (value, characteristic) => (0, ts_pattern_1.match)(value)
    .with('HEAT', (0, function_1.constant)(characteristic.TargetHeatingCoolingState.HEAT))
    .with('COOL', (0, function_1.constant)(characteristic.TargetHeatingCoolingState.COOL))
    .with('AUTO', (0, function_1.constant)(characteristic.TargetHeatingCoolingState.AUTO))
    .otherwise((0, function_1.constant)(characteristic.TargetHeatingCoolingState.OFF));
exports.mapAlexaModeToHomeKit = mapAlexaModeToHomeKit;
const mapHomekitModeToAlexa = (value, characteristic) => (0, ts_pattern_1.match)(value)
    .with(characteristic.TargetHeatingCoolingState.OFF, (0, function_1.constant)('OFF'))
    .with(characteristic.TargetHeatingCoolingState.HEAT, (0, function_1.constant)('HEAT'))
    .with(characteristic.TargetHeatingCoolingState.COOL, (0, function_1.constant)('COOL'))
    .otherwise((0, function_1.constant)('AUTO'));
exports.mapHomekitModeToAlexa = mapHomekitModeToAlexa;
//# sourceMappingURL=thermostat-mapper.js.map