import { Either } from 'fp-ts/Either';
import { AlexaDeviceError } from '../domain/alexa/errors';
import { SmartHomeDevice } from '../domain/alexa/get-devices';
import { HomebridgeAccessoryInfo } from '../domain/homebridge';
import type { AlexaSmartHomePlatform } from '../platform';
export declare const mapAlexaDeviceToHomeKitAccessoryInfos: (platform: AlexaSmartHomePlatform, entityId: string, device: SmartHomeDevice) => Either<AlexaDeviceError, HomebridgeAccessoryInfo[]>;
//# sourceMappingURL=index.d.ts.map