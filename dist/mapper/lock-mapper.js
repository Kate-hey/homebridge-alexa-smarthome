"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapAlexaTargetStateToHomeKit = exports.mapAlexaCurrentStateToHomeKit = void 0;
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const mapAlexaCurrentStateToHomeKit = (value, characteristic) => (0, ts_pattern_1.match)(value)
    .with('LOCKED', (0, function_1.constant)(characteristic.LockCurrentState.SECURED))
    .with('UNLOCKED', (0, function_1.constant)(characteristic.LockCurrentState.UNSECURED))
    .with('JAMMED', (0, function_1.constant)(characteristic.LockCurrentState.JAMMED))
    .otherwise((0, function_1.constant)(characteristic.LockCurrentState.UNKNOWN));
exports.mapAlexaCurrentStateToHomeKit = mapAlexaCurrentStateToHomeKit;
const mapAlexaTargetStateToHomeKit = (value, characteristic) => (0, ts_pattern_1.match)(value)
    .with('LOCKED', (0, function_1.constant)(characteristic.LockTargetState.SECURED))
    .with('UNLOCKED', (0, function_1.constant)(characteristic.LockTargetState.UNSECURED))
    .otherwise((0, function_1.constant)(characteristic.LockCurrentState.UNKNOWN));
exports.mapAlexaTargetStateToHomeKit = mapAlexaTargetStateToHomeKit;
//# sourceMappingURL=lock-mapper.js.map