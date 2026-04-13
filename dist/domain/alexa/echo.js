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
exports.toSupportedHomeKitAccessories = exports.EchoNamespaces = exports.isMediaPlaybackValue = void 0;
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const util_1 = require("../../util");
const mediaPlayerPattern = {
    state: ts_pattern_1.Pattern.string,
    shuffle: ts_pattern_1.Pattern.string,
    repeat: ts_pattern_1.Pattern.string,
    supportedOperations: ts_pattern_1.Pattern.union([], ts_pattern_1.Pattern.array(ts_pattern_1.Pattern.string)),
};
const isMediaPlaybackValue = (state) => (0, ts_pattern_1.match)(state)
    .with({
    ...mediaPlayerPattern,
    players: ts_pattern_1.Pattern.union([], ts_pattern_1.Pattern.array(mediaPlayerPattern)),
}, function_1.constTrue)
    .otherwise(function_1.constFalse);
exports.isMediaPlaybackValue = isMediaPlaybackValue;
exports.EchoNamespaces = {
    'Alexa.PlaybackStateReporter': 'Alexa.PlaybackStateReporter',
};
const toSupportedHomeKitAccessories = (platform, entityId, deviceName, capStates) => (0, function_1.pipe)(capStates, A.filterMap((cap) => (0, ts_pattern_1.match)(cap)
    .with({ featureName: 'temperatureSensor' }, () => O.of({
    altDeviceName: O.of(`${deviceName} temperature`),
    deviceType: platform.Service.TemperatureSensor.UUID,
    uuid: (0, util_1.generateUuid)(platform, entityId, platform.Service.TemperatureSensor.UUID),
}))
    .otherwise((0, function_1.constant)(O.none))));
exports.toSupportedHomeKitAccessories = toSupportedHomeKitAccessories;
//# sourceMappingURL=echo.js.map