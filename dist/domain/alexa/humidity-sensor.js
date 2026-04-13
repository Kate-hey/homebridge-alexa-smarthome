"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHumiditySensor = exports.HumiditySensorRangeFeatures = void 0;
exports.HumiditySensorRangeFeatures = ['Indoor humidity'];
const isHumiditySensor = (rangeFeatures, capability) => capability.featureName === 'range' &&
    Object.entries(rangeFeatures).some(([rangeName, { instance }]) => instance === capability.instance &&
        exports.HumiditySensorRangeFeatures.includes(rangeName));
exports.isHumiditySensor = isHumiditySensor;
//# sourceMappingURL=humidity-sensor.js.map