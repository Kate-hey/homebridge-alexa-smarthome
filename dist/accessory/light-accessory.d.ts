import { CharacteristicValue, Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import BaseAccessory from './base-accessory';
export default class LightAccessory extends BaseAccessory {
    static requiredOperations: SupportedActionsType[];
    service: Service;
    isExternalAccessory: boolean;
    configureServices(): void;
    handlePowerGet(): Promise<boolean>;
    handlePowerSet(value: CharacteristicValue): Promise<void>;
    handleBrightnessGet(): Promise<number>;
    handleBrightnessSet(value: CharacteristicValue): Promise<void>;
    handleHueGet(): Promise<number>;
    handleHueSet(value: CharacteristicValue): Promise<void>;
    handleSaturationGet(): Promise<number>;
    handleColorTemperatureGet(): Promise<number>;
    handleColorTemperatureSet(value: CharacteristicValue): Promise<void>;
}
//# sourceMappingURL=light-accessory.d.ts.map