import { CharacteristicValue, Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import { RangeFeature } from '../domain/alexa/save-device-capabilities';
import BaseAccessory from './base-accessory';
export default class FanAccessory extends BaseAccessory {
    static requiredOperations: SupportedActionsType[];
    service: Service;
    isExternalAccessory: boolean;
    private tempSensorService?;
    configureServices(): void;
    handleActiveGet(): Promise<boolean>;
    handleActiveSet(value: CharacteristicValue): Promise<void>;
    handleCurrentTempGet(asset: RangeFeature): Promise<number>;
}
//# sourceMappingURL=fan-accessory.d.ts.map