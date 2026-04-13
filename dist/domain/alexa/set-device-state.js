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
exports.validateSetStateSuccessful = void 0;
const E = __importStar(require("fp-ts/Either"));
const function_1 = require("fp-ts/lib/function");
const ts_pattern_1 = require("ts-pattern");
const errors_1 = require("./errors");
exports.validateSetStateSuccessful = E.fromPredicate((response) => (0, ts_pattern_1.match)(response)
    .with({
    controlResponses: ts_pattern_1.Pattern.intersection(ts_pattern_1.Pattern.not([]), ts_pattern_1.Pattern.array({ code: 'SUCCESS' })),
}, function_1.constTrue)
    .otherwise(function_1.constFalse), (r) => {
    var _a, _b;
    return new errors_1.RequestUnsuccessful(`Error setting smart home device state. Response: ${JSON.stringify(r, undefined, 2)}`, (_b = (_a = r.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.code);
});
//# sourceMappingURL=set-device-state.js.map