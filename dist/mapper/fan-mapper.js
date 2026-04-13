"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHomeKitPowerToAlexaValue = exports.mapHomeKitPowerToAlexaAction = void 0;
const ts_pattern_1 = require("ts-pattern");
const function_1 = require("fp-ts/lib/function");
const mapHomeKitPowerToAlexaAction = (value, characteristic) => (0, ts_pattern_1.match)(value)
    .with(characteristic.Active.ACTIVE, (0, function_1.constant)('turnOn'))
    .otherwise((0, function_1.constant)('turnOff'));
exports.mapHomeKitPowerToAlexaAction = mapHomeKitPowerToAlexaAction;
const mapHomeKitPowerToAlexaValue = (value, characteristic) => (0, ts_pattern_1.match)(value)
    .with(characteristic.Active.ACTIVE, (0, function_1.constant)('ON'))
    .otherwise((0, function_1.constant)('OFF'));
exports.mapHomeKitPowerToAlexaValue = mapHomeKitPowerToAlexaValue;
//# sourceMappingURL=fan-mapper.js.map