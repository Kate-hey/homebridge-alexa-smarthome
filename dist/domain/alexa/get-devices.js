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
exports.validateGetDevicesSuccessful = void 0;
const A = __importStar(require("fp-ts/Array"));
const E = __importStar(require("fp-ts/Either"));
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/lib/function");
const settings = __importStar(require("../../settings"));
const util = __importStar(require("../../util/index"));
const errors_1 = require("./errors");
exports.validateGetDevicesSuccessful = (0, function_1.flow)(O.fromNullable, O.flatMap(({ data }) => (util.isRecord(data) ? O.of(data) : O.none)), O.flatMap(({ endpoints }) => util.isRecord(endpoints) ? O.of(endpoints) : O.none), O.flatMap(({ items }) => (Array.isArray(items) ? O.of(items) : O.none)), O.match((0, function_1.constant)(E.left(new errors_1.InvalidResponse('No Alexa devices were found for the current Alexa account'))), (endpoints) => Array.isArray(endpoints)
    ? E.of((0, function_1.pipe)(endpoints, A.filter((e) => { var _a, _b; return !!((_b = (_a = e.displayCategories) === null || _a === void 0 ? void 0 : _a.primary) === null || _b === void 0 ? void 0 : _b.value); }), A.map((e) => {
        var _a, _b, _c, _d;
        return [
            e,
            {
                endpointId: e.id,
                id: e.id.replace('amzn1.alexa.endpoint.', ''),
                displayName: e.friendlyName,
                supportedOperations: e.features.flatMap((f) => { var _a, _b; return (_b = (_a = f.operations) === null || _a === void 0 ? void 0 : _a.map((o) => o.name)) !== null && _b !== void 0 ? _b : []; }),
                enabled: e.enablement === 'ENABLED',
                deviceType: e.displayCategories.primary.value,
                serialNumber: (_b = (_a = e.serialNumber) === null || _a === void 0 ? void 0 : _a.value.text) !== null && _b !== void 0 ? _b : 'Unknown',
                model: (_d = (_c = e.model) === null || _c === void 0 ? void 0 : _c.value.text) !== null && _d !== void 0 ? _d : 'Unknown',
                manufacturer: settings.PLUGIN_NAME,
            },
        ];
    })))
    : E.left(new errors_1.InvalidResponse('Invalid list of Alexa devices found for the current Alexa account: ' +
        JSON.stringify(endpoints, undefined, 2)))));
//# sourceMappingURL=get-devices.js.map