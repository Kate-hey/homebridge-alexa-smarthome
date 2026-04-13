import { IO } from 'fp-ts/IO';
import { LogLevel, type Logger, type PlatformConfig } from 'homebridge';
export type PluginLogLevel = `${LogLevel}`;
export declare class PluginLogger {
    private readonly logger;
    readonly config: PlatformConfig;
    constructor(logger: Logger, config: PlatformConfig);
    log(message: string, ...parameters: any[]): IO<void>;
    debug(message: string, ...parameters: any[]): IO<void>;
    info(message: string, ...parameters: any[]): IO<void>;
    warn(message: string, ...parameters: any[]): IO<void>;
    error(message: string, ...parameters: any[]): IO<void>;
    errorT(prefix: string, e: any): IO<void>;
}
//# sourceMappingURL=plugin-logger.d.ts.map