"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLogger = void 0;
const ts_pattern_1 = require("ts-pattern");
const errors_1 = require("../domain/alexa/errors");
class PluginLogger {
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
    }
    log(message, ...parameters) {
        return () => this.logger.log("info" /* LogLevel.INFO */, message, ...parameters);
    }
    debug(message, ...parameters) {
        return () => {
            if (this.config.debug) {
                this.logger.info(message, ...parameters);
            }
        };
    }
    info(message, ...parameters) {
        return () => this.logger.info(message, ...parameters);
    }
    warn(message, ...parameters) {
        return () => this.logger.warn(message, ...parameters);
    }
    error(message, ...parameters) {
        return () => this.logger.error(message, ...parameters);
    }
    errorT(prefix, e) {
        return () => (0, ts_pattern_1.match)(e)
            .with({ name: errors_1.DeviceOffline.name, message: ts_pattern_1.Pattern.select(ts_pattern_1.Pattern.string) }, (m) => this.debug(`${prefix} - ${m}`)())
            .with({
            message: ts_pattern_1.Pattern.select('message', ts_pattern_1.Pattern.string),
            cause: ts_pattern_1.Pattern.select('cause'),
        }, ({ cause, message }) => this.errorT(`${prefix} - ${message}. Caused by`, cause)())
            .with({ message: ts_pattern_1.Pattern.select(ts_pattern_1.Pattern.string) }, (m) => this.logger.error(`${prefix} - ${m}`))
            .with(ts_pattern_1.Pattern.string, (e) => this.logger.error(`${prefix} - ${e}`))
            .otherwise((e) => this.logger.error(`${prefix} - Unknown error`, e));
    }
}
exports.PluginLogger = PluginLogger;
//# sourceMappingURL=plugin-logger.js.map