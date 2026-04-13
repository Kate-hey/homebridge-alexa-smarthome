import { Either } from 'fp-ts/Either';
import { PlatformAccessory } from 'homebridge';
import { AlexaDeviceError } from '../domain/alexa/errors';
import { SmartHomeDevice } from '../domain/alexa/get-devices';
import { AlexaSmartHomePlatform } from '../platform';
import BaseAccessory from './base-accessory';
export default class AccessoryFactory {
    static createAccessory(platform: AlexaSmartHomePlatform, platAcc: PlatformAccessory, device: SmartHomeDevice, homeKitDeviceType: string): Either<AlexaDeviceError, BaseAccessory>;
}
//# sourceMappingURL=accessory-factory.d.ts.map