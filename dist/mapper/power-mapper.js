"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHomeKitPowerToAlexaValue = exports.mapHomeKitPowerToAlexaAction = void 0;
const mapHomeKitPowerToAlexaAction = (powerState) => powerState ? 'turnOn' : 'turnOff';
exports.mapHomeKitPowerToAlexaAction = mapHomeKitPowerToAlexaAction;
const mapHomeKitPowerToAlexaValue = (powerState) => powerState ? 'ON' : 'OFF';
exports.mapHomeKitPowerToAlexaValue = mapHomeKitPowerToAlexaValue;
//# sourceMappingURL=power-mapper.js.map