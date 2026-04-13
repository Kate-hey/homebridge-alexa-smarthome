import * as E from 'fp-ts/Either';
import { Either } from 'fp-ts/Either';
import * as IOE from 'fp-ts/IOEither';
import { IOEither } from 'fp-ts/IOEither';
import * as J from 'fp-ts/Json';
import { Option } from 'fp-ts/Option';
import type { PlatformConfig } from 'homebridge';
import { Authentication } from '../domain/alexa';
import { AlexaDeviceError } from '../domain/alexa/errors';
import type { AlexaPlatformConfig } from '../domain/homebridge';
import { IoError, JsonFormatError, PluginError } from '../domain/homebridge/errors';
import { AlexaSmartHomePlatform } from '../platform';
export declare const validateConfig: (config: PlatformConfig) => config is AlexaPlatformConfig;
export declare const isValidAuthentication: (maybeCookieData: J.Json | {
    readonly [key: string]: J.Json | undefined;
}) => maybeCookieData is {
    macDms: {
        device_private_key: string;
        adp_token: string;
    };
    localCookie: string;
    frc: string;
    "map-md": string;
    deviceId: string;
    deviceSerial: string;
    refreshToken: string;
    tokenDate: number;
    amazonPage: string;
    csrf: string;
    deviceAppName: string;
    dataVersion: number | undefined;
};
export declare const readFile: (path: string) => IOE.IOEither<IoError, string>;
export declare const parseJson: (s: string) => E.Either<JsonFormatError, J.Json>;
export declare const stringifyJson: (json: unknown) => E.Either<JsonFormatError, string>;
export declare const getAuthentication: (persistPath: string) => IOEither<Option<PluginError>, Authentication>;
export declare const extractEntityId: (id: string) => Either<AlexaDeviceError, string>;
export declare const round: (value: number, decimals: number) => number;
export declare const isRecord: <T extends string | number | symbol>(obj: unknown) => obj is Record<T, unknown>;
export declare const generateUuid: (platform: AlexaSmartHomePlatform, entityId: string, deviceType: string) => string;
//# sourceMappingURL=index.d.ts.map