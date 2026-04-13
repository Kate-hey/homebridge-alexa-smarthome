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
exports.AlexaSmartHomePlatform = void 0;
const alexa_remote2_1 = __importDefault(require("alexa-remote2"));
const A = __importStar(require("fp-ts/Array"));
const E = __importStar(require("fp-ts/Either"));
const IO = __importStar(require("fp-ts/IO"));
const IOE = __importStar(require("fp-ts/IOEither"));
const O = __importStar(require("fp-ts/Option"));
const TE = __importStar(require("fp-ts/TaskEither"));
const function_1 = require("fp-ts/lib/function");
const fs_1 = __importDefault(require("fs"));
const ts_pattern_1 = require("ts-pattern");
const accessory_factory_1 = __importDefault(require("./accessory/accessory-factory"));
const mapper_1 = require("./mapper");
const settings = __importStar(require("./settings"));
const device_store_1 = __importDefault(require("./store/device-store"));
const util = __importStar(require("./util"));
const fp_util_1 = require("./util/fp-util");
const plugin_logger_1 = require("./util/plugin-logger");
const alexa_api_wrapper_1 = require("./wrapper/alexa-api-wrapper");
class AlexaSmartHomePlatform {
    constructor(logger, config, api) {
        this.logger = logger;
        this.api = api;
        this.HAP = this.api.hap;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.cachedAccessories = [];
        this.accessoryHandlers = [];
        this.activeDeviceIds = [];
        this.log = new plugin_logger_1.PluginLogger(logger, config);
        if (util.validateConfig(config)) {
            const formattedClientHost = config.auth.proxy.clientHost
                .replace(/^https?:\/\//, '')
                .toLowerCase();
            config.auth.proxy.clientHost = formattedClientHost;
            if (formattedClientHost.includes('/') ||
                formattedClientHost.includes(':')) {
                (0, function_1.pipe)(this.log.error(`Invalid proxy client host provided: ${formattedClientHost}. The host should not include a port number or a slash (/).`), IO.flatMap(() => this.log.error('Examples of correct hosts: 192.168.1.100, homebridge-vm.local')))();
                return;
            }
            this.config = config;
        }
        else {
            this.log.error('Missing configuration for this plugin to work, see the documentation for initial setup.')();
            return;
        }
        this.cookiePersistPath = `${api.user.persistPath()}/.${settings.PLUGIN_NAME}`;
        this.alexaRemote = new alexa_remote2_1.default();
        this.deviceStore = new device_store_1.default(this.config.performance);
        this.alexaApi = new alexa_api_wrapper_1.AlexaApiWrapper(this.Service, this.alexaRemote, this.log, this.deviceStore);
        const handleAuthResult = (0, function_1.flow)(O.match(() => {
            this.alexaRemote.cookie;
            return this.log.debug('Successfully authenticated Alexa account.');
        }, (e) => this.log.errorT('Failed to initialize connection to Alexa.', e)));
        api.on('didFinishLaunching', () => {
            this.initAlexaRemote((maybeError) => {
                (0, function_1.pipe)(TE.rightIO(handleAuthResult(maybeError)), TE.flatMap(this.findDevices.bind(this)), TE.flatMap(this.initDevices.bind(this)), TE.flatMapIO(this.findStaleAccessories.bind(this)))().then(E.match((e) => this.log.errorT('After initialization', e)(), this.unregisterStaleAccessories.bind(this)));
            });
        });
    }
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName)();
        this.cachedAccessories.push(accessory);
    }
    initAlexaRemote(callback, firstAttempt = true) {
        var _a;
        this.alexaRemote.on('cookie', () => {
            const cookieData = this.alexaRemote.cookieData;
            if (util.isValidAuthentication(cookieData)) {
                this.log.info('Alexa login cookie updated. Storing cookie in file:', this.cookiePersistPath)();
                fs_1.default.writeFileSync(this.cookiePersistPath, JSON.stringify({ cookieData }));
            }
        });
        const logStoredAuthErrors = O.match(() => {
            this.log.debug('Login required because existing authentication not found')();
            return undefined;
        }, (e) => {
            this.log.errorT('Error trying to retrieve stored authentication', e)();
            return undefined;
        });
        const amazonDomain = (_a = this.config.amazonDomain) !== null && _a !== void 0 ? _a : settings.DEFAULT_AMAZON_DOMAIN;
        (0, function_1.pipe)(util.getAuthentication(this.cookiePersistPath), IOE.match(logStoredAuthErrors, function_1.identity), IO.map((auth) => {
            var _a, _b, _c, _d;
            return this.alexaRemote.init({
                acceptLanguage: (_a = this.config.language) !== null && _a !== void 0 ? _a : settings.DEFAULT_ACCEPT_LANG,
                alexaServiceHost: `alexa.${amazonDomain}`,
                amazonPage: amazonDomain,
                amazonPageProxyLanguage: (_c = (_b = this.config.language) === null || _b === void 0 ? void 0 : _b.replace('-', '_')) !== null && _c !== void 0 ? _c : settings.DEFAULT_PROXY_PAGE_LANG,
                formerRegistrationData: auth,
                cookieRefreshInterval: ((_d = this.config.auth.refreshInterval) !== null && _d !== void 0 ? _d : settings.DEFAULT_REFRESH_INTERVAL_DAYS) *
                    settings.ONE_DAY_MILLIS,
                cookie: auth === null || auth === void 0 ? void 0 : auth.localCookie,
                deviceAppName: 'Homebridge',
                macDms: auth === null || auth === void 0 ? void 0 : auth.macDms,
                proxyOwnIp: this.config.auth.proxy.clientHost,
                proxyPort: this.config.auth.proxy.port,
                logger: this.alexaRemoteLogger.bind(this),
                proxyLogLevel: 'error',
                usePushConnectType: 3,
                useWsMqtt: false,
            }, (error) => {
                (0, function_1.pipe)(O.fromNullable(error), O.match(() => callback(O.none), (e) => {
                    if (firstAttempt && e.message.includes('401 Unauthorized')) {
                        fs_1.default.rmSync(this.cookiePersistPath);
                        this.initAlexaRemote(callback, false);
                    }
                    else {
                        callback(O.of(e));
                    }
                }));
            });
        }))();
    }
    findDevices() {
        const deviceFilter = (0, function_1.pipe)(O.fromNullable(this.config.devices), O.map(A.map((d) => d.trim())), O.getOrElse((0, function_1.constant)(new Array())));
        const excludeDevices = (0, function_1.pipe)(O.fromNullable(this.config.excludeDevices), O.map(A.map((d) => d.trim())), O.getOrElse((0, function_1.constant)(new Array())));
        return (0, function_1.pipe)(this.alexaApi.getDevices(), TE.tapIO((devices) => this.log.debug(`Found ${devices.length} devices connected to the current Alexa account.`)), TE.tap((devices) => (0, function_1.pipe)(devices, util.stringifyJson, TE.fromEither, TE.tapIO((json) => this.log.debug(`BEGIN devices connected to Alexa account\n\n ${json}\n\nEND devices connected to Alexa account`)))), TE.map(A.filter((d) => A.isEmpty(deviceFilter)
            ? !excludeDevices.includes(d.displayName.trim())
            : deviceFilter.includes(d.displayName.trim()))), TE.tapIO((devices) => devices.length === deviceFilter.length || A.isEmpty(deviceFilter)
            ? this.log.debug(`Discovered ${deviceFilter.length} devices.`)
            : this.log.warn(`${deviceFilter.length} devices provided in settings but ${devices.length} matching ` +
                'Alexa smart home devices were discovered.')));
    }
    initDevices(devices) {
        const initUserConfiguredDevices = (0, function_1.flow)(A.map((0, function_1.flow)(this.initAccessories.bind(this), IO.FromIO.fromIO)), A.map(IO.flatMap(E.match((e) => IO.as(this.log.errorT('Initialize Devices', e), O.none), (acc) => IO.of(O.of(acc))))), A.traverse(IO.Applicative)(function_1.identity));
        return (0, function_1.pipe)(TE.of(devices), TE.flatMapIO(initUserConfiguredDevices), TE.map((0, function_1.flow)(A.filterMap(function_1.identity), A.flatten)));
    }
    initAccessories(device) {
        const disabledOperationsMap = (0, function_1.pipe)(O.fromNullable(this.config.disabledOperations), O.getOrElse((0, function_1.constant)([])), A.map(({ deviceName, operations }) => [deviceName.trim(), operations]), A.reduce(new Map(), (map, [name, ops]) => {
            var _a;
            map.set(name, (_a = ops === null || ops === void 0 ? void 0 : ops.split(',').map((o) => o.trim()).filter((o) => o.length > 0)) !== null && _a !== void 0 ? _a : []);
            return map;
        }));
        return (0, function_1.pipe)(E.bindTo('entityId')(util.extractEntityId(device.id)), E.bind('hbAccessories', ({ entityId }) => (0, mapper_1.mapAlexaDeviceToHomeKitAccessoryInfos)(this, entityId, device)), E.map(({ entityId, hbAccessories }) => (0, function_1.pipe)(hbAccessories, A.map((hbAcc) => ({
            ...hbAcc,
            entityId,
            maybeCachedAcc: (0, function_1.pipe)(this.cachedAccessories, A.findFirst(({ UUID: cachedUuid, context }) => {
                var _a;
                return cachedUuid === hbAcc.uuid &&
                    context.deviceType === device.deviceType &&
                    ((_a = context.homebridgeDeviceType) !== null && _a !== void 0 ? _a : hbAcc.deviceType) ===
                        hbAcc.deviceType;
            })),
        })))), IOE.fromEither, IOE.tap(this.logDeviceInfo(device)), IOE.flatMap((hkDevices) => (0, function_1.pipe)(hkDevices, A.traverse(IOE.ApplicativeSeq)((hbAcc) => {
            const newDevice = {
                ...device,
                displayName: (0, fp_util_1.getOrElse)(hbAcc.altDeviceName, (0, function_1.constant)(device.displayName)),
                supportedOperations: device.supportedOperations.filter((op) => {
                    var _a;
                    const disabled = (_a = disabledOperationsMap.get(device.displayName.trim())) !== null && _a !== void 0 ? _a : [];
                    return !disabled.includes(op);
                }),
            };
            return (0, function_1.pipe)(O.bindTo('platAcc')(hbAcc.maybeCachedAcc), O.fold(() => this.addNewAccessory(newDevice, hbAcc.deviceType, hbAcc.uuid), ({ platAcc }) => this.restoreExistingAccessory(newDevice, hbAcc.deviceType, platAcc)));
        }))));
    }
    restoreExistingAccessory(device, hbDeviceType, acc) {
        var _a, _b, _c;
        if (!((_a = acc.context) === null || _a === void 0 ? void 0 : _a.deviceId) ||
            !((_b = acc.context) === null || _b === void 0 ? void 0 : _b.deviceType) ||
            !((_c = acc.context) === null || _c === void 0 ? void 0 : _c.homebridgeDeviceType)) {
            this.log.info('Update accessory context:', acc.displayName)();
            acc.context = {
                ...acc.context,
                deviceId: device.id,
                deviceType: device.deviceType,
                homebridgeDeviceType: hbDeviceType,
            };
            this.api.updatePlatformAccessories([acc]);
        }
        return (0, function_1.pipe)(IOE.Do, IOE.flatMapEither(() => accessory_factory_1.default.createAccessory(this, acc, device, hbDeviceType)), IOE.tapIO(() => this.log.info('Restored existing accessory from cache:', device.displayName)), IOE.tapEither(() => {
            this.activeDeviceIds.push(device.id);
            return E.of((0, function_1.constVoid)());
        }));
    }
    addNewAccessory(device, hbDeviceType, uuid) {
        const platAcc = new this.api.platformAccessory(device.displayName, uuid);
        platAcc.context = {
            ...platAcc.context,
            deviceId: device.id,
            deviceType: device.deviceType,
            homebridgeDeviceType: hbDeviceType,
        };
        return (0, function_1.pipe)(IOE.Do, IOE.flatMapEither(() => accessory_factory_1.default.createAccessory(this, platAcc, device, hbDeviceType)), IOE.tapIO(() => this.log.info('Added accessory:', device.displayName)), IOE.tapEither((acc) => {
            acc.isExternalAccessory
                ? this.api.publishExternalAccessories(settings.PLUGIN_NAME, [platAcc])
                : this.api.registerPlatformAccessories(settings.PLUGIN_NAME, settings.PLATFORM_NAME, [platAcc]);
            this.activeDeviceIds.push(device.id);
            return E.of((0, function_1.constVoid)());
        }));
    }
    findStaleAccessories(activeAccessories) {
        return (0, function_1.pipe)(IO.of(A.Functor.map(activeAccessories, ({ platformAcc: { UUID } }) => UUID)), IO.map((activeAccessoryIds) => A.Filterable.filter(this.cachedAccessories, ({ UUID }) => !activeAccessoryIds.includes(UUID))));
    }
    unregisterStaleAccessories(staleAccessories) {
        staleAccessories.forEach((staleAccessory) => {
            this.log.info(`Removing stale cached accessory ${staleAccessory.UUID} ${staleAccessory.displayName}`)();
        });
        if (staleAccessories.length) {
            this.api.unregisterPlatformAccessories(settings.PLUGIN_NAME, settings.PLATFORM_NAME, staleAccessories);
        }
    }
    logDeviceInfo(device) {
        return () => (0, function_1.pipe)(IOE.bindTo('deviceJson')(IOE.fromEither(util.stringifyJson(device))), IOE.bind('state', () => IOE.fromEither(util.stringifyJson(this.deviceStore.getCacheStatesForDevice(device.id)))), IOE.tapIO(({ deviceJson }) => this.log.debug(`${device.displayName} ::: Attempting to add accessory(s) for device: ${deviceJson}`)), IOE.tapIO(({ state }) => this.log.debug(`${device.displayName} ::: Current state: ${state}`)));
    }
    alexaRemoteLogger(...args) {
        return (0, ts_pattern_1.match)(args[0])
            .when((msg) => typeof msg !== 'string' ||
            msg.trim().length === 0 ||
            msg.startsWith('Alexa-Remote: No authentication check needed') ||
            msg.startsWith('Alexa-Remote: Response') ||
            msg.startsWith('Alexa-Remote: Sending Request') ||
            msg.startsWith('Alexa-Remote: Use as') ||
            msg.startsWith('Alexa-Cookie: Sending Request') ||
            msg.startsWith('Alexa-Cookie: Headers') ||
            msg.startsWith('Alexa-Cookie: Use as') ||
            msg.startsWith('Alexa-Cookie: Cookies handled') ||
            msg.startsWith('Alexa-Cookie: Proxy catched cookie') ||
            msg.startsWith('Alexa-Cookie: Proxy catched parameters') ||
            msg.startsWith('Alexa-Cookie: Modify headers') ||
            msg.startsWith('Alexa-Cookie: Proxy') ||
            msg.startsWith('Alexa-Cookie: Initial Page Request') ||
            msg.startsWith('Final Registration Result') ||
            msg.startsWith('[HPM]') ||
            msg.startsWith('Proxy Init') ||
            msg.startsWith('Router') ||
            msg.startsWith('{'), function_1.constVoid)
            .when((msg) => typeof msg !== 'string' ||
            msg.startsWith('Get User data Response') ||
            msg.startsWith('Register App Response') ||
            msg.startsWith('Exchange Token Response') ||
            msg.startsWith('Handle token registration Start'), (msg) => this.log.debug(`Alexa-Cookie: ${msg.substring(0, 250)}...`)())
            .otherwise((msg) => {
            const params = args.slice(1);
            params.length > 0
                ? this.log.debug(msg, params)()
                : this.log.debug(msg)();
        });
    }
}
exports.AlexaSmartHomePlatform = AlexaSmartHomePlatform;
//# sourceMappingURL=platform.js.map