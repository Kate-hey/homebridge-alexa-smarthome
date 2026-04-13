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
exports.extractRangeFeatures = void 0;
const O = __importStar(require("fp-ts/Option"));
const RA = __importStar(require("fp-ts/ReadonlyArray"));
const RR = __importStar(require("fp-ts/ReadonlyRecord"));
const function_1 = require("fp-ts/lib/function");
const S = __importStar(require("fp-ts/string"));
const ts_pattern_1 = require("ts-pattern");
const extractRangeFeatures = (devices) => {
    const whereValidInfo = ([endpoint, device]) => {
        const rangeFeatures = (0, function_1.pipe)(endpoint.features, RA.filterMap((f) => (0, ts_pattern_1.match)(f)
            .with({
            name: 'range',
            instance: ts_pattern_1.Pattern.string,
            properties: ts_pattern_1.Pattern.array({
                rangeValue: {
                    value: ts_pattern_1.Pattern.number,
                },
            }),
            configuration: {
                friendlyName: {
                    value: {
                        text: ts_pattern_1.Pattern.string,
                    },
                },
            },
        }, (_) => O.of({
            featureName: _.name,
            instance: _.instance,
            rangeName: _.configuration.friendlyName.value.text,
        }))
            .otherwise((0, function_1.constant)(O.none))));
        if (rangeFeatures.length === 0) {
            return O.none;
        }
        else {
            return O.of([device.id, rangeFeatures]);
        }
    };
    const whereDeviceHasRangeControllers = (rcfd) => (Object.keys(rcfd.rangeFeatures).length > 0 ? O.of(rcfd) : O.none);
    return (0, function_1.pipe)(O.of(devices), O.map(RA.reduce({}, (acc, [e, d]) => ({
        ...acc,
        [d.id]: [e, d],
    }))), O.map((endpoints) => (0, function_1.pipe)(endpoints, RR.filterMap(whereValidInfo), RR.map(([id, rangeFeatures]) => ({
        id,
        rangeFeatures: rangeFeatures.reduce((acc, cur) => {
            acc[cur.rangeName] = cur;
            return acc;
        }, {}),
    })), RR.filterMap(whereDeviceHasRangeControllers), RR.reduce(S.Ord)({}, (acc, { id, rangeFeatures }) => {
        acc[id] = rangeFeatures;
        return acc;
    }))), O.match((0, function_1.constant)({}), function_1.identity));
};
exports.extractRangeFeatures = extractRangeFeatures;
//# sourceMappingURL=save-device-capabilities.js.map