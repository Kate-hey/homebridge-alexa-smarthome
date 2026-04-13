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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUuid = exports.isRecord = exports.round = exports.extractEntityId = exports.getAuthentication = exports.stringifyJson = exports.parseJson = exports.readFile = exports.isValidAuthentication = exports.validateConfig = void 0;
const E = __importStar(require("fp-ts/Either"));
const IOE = __importStar(require("fp-ts/IOEither"));
const J = __importStar(require("fp-ts/Json"));
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/lib/function");
const fs_1 = __importDefault(require("fs"));
const ts_pattern_1 = require("ts-pattern");
const errors_1 = require("../domain/homebridge/errors");
const isBetweenIncl = (value, min, max) => value >= min && value <= max;
const validateConfig = (config) => (0, ts_pattern_1.match)(config)
    .when((c) => {
    var _a, _b;
    return (0, ts_pattern_1.isMatching)({
        platform: 'HomebridgeAlexaSmartHome',
        devices: ts_pattern_1.Pattern.optional(ts_pattern_1.Pattern.array(ts_pattern_1.Pattern.string)),
        excludeDevices: ts_pattern_1.Pattern.optional(ts_pattern_1.Pattern.array(ts_pattern_1.Pattern.string)),
        amazonDomain: ts_pattern_1.Pattern.optional(ts_pattern_1.Pattern.string),
        language: ts_pattern_1.Pattern.optional(ts_pattern_1.Pattern.string),
        auth: {
            refreshInterval: ts_pattern_1.Pattern.optional(ts_pattern_1.Pattern.number),
            proxy: { clientHost: ts_pattern_1.Pattern.string, port: ts_pattern_1.Pattern.number },
        },
        performance: ts_pattern_1.Pattern.optional({
            cacheTTL: ts_pattern_1.Pattern.optional(ts_pattern_1.Pattern.number),
            backgroundRefresh: ts_pattern_1.Pattern.optional(ts_pattern_1.Pattern.boolean),
        }),
        debug: ts_pattern_1.Pattern.optional(ts_pattern_1.Pattern.boolean),
    }, c) &&
        isBetweenIncl(c.auth.proxy.port, 1024, 9999) &&
        isBetweenIncl((_b = (_a = c.performance) === null || _a === void 0 ? void 0 : _a.cacheTTL) !== null && _b !== void 0 ? _b : 60, 30, 3600);
}, function_1.constTrue)
    .otherwise(function_1.constFalse);
exports.validateConfig = validateConfig;
const isValidAuthentication = (maybeCookieData) => (0, ts_pattern_1.match)(maybeCookieData)
    .with({
    localCookie: ts_pattern_1.Pattern.string,
    refreshToken: ts_pattern_1.Pattern.string,
    macDms: {
        device_private_key: ts_pattern_1.Pattern.string,
        adp_token: ts_pattern_1.Pattern.string,
    },
}, function_1.constTrue)
    .otherwise(function_1.constFalse);
exports.isValidAuthentication = isValidAuthentication;
const readFile = (path) => IOE.tryCatch(() => fs_1.default.readFileSync(path, { encoding: 'utf-8' }), (e) => new errors_1.IoError('Error reading file. ' + e));
exports.readFile = readFile;
exports.parseJson = (0, function_1.flow)(J.parse, E.mapLeft((e) => new errors_1.JsonFormatError('Error converting string to JSON', e)));
const stringifyJson = (json) => (0, function_1.pipe)(E.tryCatch(() => {
    const s = JSON.stringify(json, undefined, 2);
    if (typeof s !== 'string') {
        throw new Error('Converting unsupported structure to JSON');
    }
    return s;
}, function_1.identity), E.mapLeft((e) => new errors_1.JsonFormatError('Error converting JSON to string', e)));
exports.stringifyJson = stringifyJson;
const getAuthentication = (persistPath) => {
    const doesPreviousAuthExist = (0, function_1.pipe)(IOE.tryCatch(() => (fs_1.default.existsSync(persistPath) ? O.of(true) : O.none), (e) => O.of(new errors_1.IoError('Error checking for existing authentication file. ' + e))), IOE.flatMap(IOE.fromOption((0, function_1.constant)(O.none))));
    const toCookieData = (0, function_1.flow)(O.fromNullable, O.map((j) => (0, ts_pattern_1.match)(j)
        .with({ cookieData: ts_pattern_1.Pattern.not(ts_pattern_1.Pattern.nullish) }, (j) => j.cookieData)
        .otherwise(function_1.identity)), O.getOrElse((0, function_1.constant)({})));
    return (0, function_1.pipe)(doesPreviousAuthExist, IOE.flatMap(() => IOE.Bifunctor.mapLeft((0, exports.readFile)(persistPath), O.of)), IOE.flatMapEither((s) => E.Bifunctor.mapLeft((0, exports.parseJson)(s), O.of)), IOE.map(toCookieData), IOE.filterOrElse(exports.isValidAuthentication, (0, function_1.constant)(O.of(new errors_1.ValidationError('Invalid configuration')))));
};
exports.getAuthentication = getAuthentication;
const ENTITY_ID_REGEX = new RegExp(/[\da-fA-F]{8}-(?:[\da-fA-F]{4}-){3}[\da-fA-F]{12}/);
const extractEntityId = (id) => (0, function_1.pipe)(E.bindTo('matches')(E.of(id.match(ENTITY_ID_REGEX))), E.filterOrElse(({ matches }) => !!matches, (0, function_1.constant)(new errors_1.ValidationError(`id: '${id}' is not a valid Smart Home device id`))), E.map(({ matches }) => matches[0]));
exports.extractEntityId = extractEntityId;
const round = (value, decimals) => {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};
exports.round = round;
const isRecord = (obj) => !!obj && typeof obj === 'object' && !Array.isArray(obj);
exports.isRecord = isRecord;
const generateUuid = (platform, entityId, deviceType) => platform.HAP.uuid.generate(`${entityId}:${deviceType}`);
exports.generateUuid = generateUuid;
//# sourceMappingURL=index.js.map