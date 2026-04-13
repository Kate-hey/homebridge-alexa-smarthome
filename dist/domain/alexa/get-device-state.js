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
exports.extractStates = void 0;
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const extractStates = (deviceFeatures) => {
    const withCommonProps = (f) => ({
        featureName: f.name,
        name: f.properties[0].name,
    });
    return deviceFeatures
        .flatMap((f) => !Array.isArray(f.properties) || f.properties.length <= 1
        ? [f]
        : f.properties.map((p) => ({ ...f, properties: [p] })))
        .map((f) => (0, ts_pattern_1.match)(f)
        .with({
        name: 'brightness',
        properties: ts_pattern_1.Pattern.array({
            brightnessStateValue: ts_pattern_1.Pattern.number,
        }),
    }, (_) => O.of({
        ...withCommonProps(_),
        value: _.properties[0].brightnessStateValue,
    }))
        .with({
        name: 'color',
        properties: ts_pattern_1.Pattern.array({
            colorStateValue: {
                brightness: ts_pattern_1.Pattern.number,
                hue: ts_pattern_1.Pattern.number,
                saturation: ts_pattern_1.Pattern.number,
            },
        }),
    }, (_) => O.of({
        ...withCommonProps(_),
        value: _.properties[0].colorStateValue,
    }))
        .with({
        name: 'colorTemperature',
        properties: ts_pattern_1.Pattern.array({
            colorTemperatureInKelvinStateValue: ts_pattern_1.Pattern.number,
        }),
    }, (_) => O.of({
        ...withCommonProps(_),
        value: _.properties[0].colorTemperatureInKelvinStateValue,
    }))
        .with({
        name: 'lock',
        properties: ts_pattern_1.Pattern.array({
            lockState: ts_pattern_1.Pattern.string,
        }),
    }, (_) => O.of({
        ...withCommonProps(_),
        value: _.properties[0].lockState,
    }))
        .with({
        name: 'power',
        properties: ts_pattern_1.Pattern.array({
            powerStateValue: ts_pattern_1.Pattern.string,
        }),
    }, (_) => O.of({
        ...withCommonProps(_),
        value: _.properties[0].powerStateValue,
    }))
        .with({
        name: 'toggle',
        properties: ts_pattern_1.Pattern.array({
            toggleStateValue: ts_pattern_1.Pattern.string,
        }),
    }, (_) => O.of({
        ...withCommonProps(_),
        value: _.properties[0].toggleStateValue,
    }))
        .with({
        name: 'temperatureSensor',
        properties: ts_pattern_1.Pattern.array({
            value: {
                value: ts_pattern_1.Pattern.number,
                scale: ts_pattern_1.Pattern.string,
            },
        }),
    }, (_) => O.of({
        ...withCommonProps(_),
        value: _.properties[0].value,
    }))
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
        ...withCommonProps(_),
        value: _.properties[0].rangeValue.value,
        instance: _.instance,
        rangeName: _.configuration.friendlyName.value.text,
    }))
        .with({
        name: 'thermostat',
        properties: ts_pattern_1.Pattern.array(ts_pattern_1.Pattern.any),
    }, (_) => (0, ts_pattern_1.match)(_.properties[0].name)
        .with('thermostatMode', () => O.of({
        ...withCommonProps(_),
        value: _.properties[0].thermostatModeValue,
    }))
        .with(ts_pattern_1.Pattern.union('targetSetpoint', 'upperSetpoint', 'lowerSetpoint'), () => O.of({
        ...withCommonProps(_),
        value: _.properties[0].value,
    }))
        .otherwise((0, function_1.constant)(O.none)))
        .otherwise((0, function_1.constant)(O.none)))
        .filter(O.isSome)
        .map((_) => _.value);
};
exports.extractStates = extractStates;
//# sourceMappingURL=get-device-state.js.map