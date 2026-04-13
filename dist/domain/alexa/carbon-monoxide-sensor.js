"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCarbonMonoxideSensor = exports.CarbonMonoxideRangeFeatures = void 0;
exports.CarbonMonoxideRangeFeatures = ['Carbon monoxide'];
const isCarbonMonoxideSensor = (rangeFeatures, capability) => capability.featureName === 'range' &&
    Object.entries(rangeFeatures).some(([rangeName, { instance }]) => instance === capability.instance &&
        exports.CarbonMonoxideRangeFeatures.includes(rangeName));
exports.isCarbonMonoxideSensor = isCarbonMonoxideSensor;
//# sourceMappingURL=carbon-monoxide-sensor.js.map