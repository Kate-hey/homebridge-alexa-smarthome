"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTemperatureValue = void 0;
const isTemperatureValue = (state) => typeof state === 'object' && 'value' in state && 'scale' in state;
exports.isTemperatureValue = isTemperatureValue;
//# sourceMappingURL=temperature.js.map