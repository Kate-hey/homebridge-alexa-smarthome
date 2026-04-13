import { CharacteristicValue, Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import { RangeFeature } from '../domain/alexa/save-device-capabilities';
import BaseAccessory from './base-accessory';
export default class FanAccessory extends BaseAccessory {
    static requiredOperations: SupportedActionsType[];
    service: Service;
    isExternalAccessory: boolean;
    private tempSensorService?;
    private autoModeService?;
    private setTempAsset?;
    configureServices(): void;
    handleActiveGet(): Promise<boolean>;
    handleActiveSet(value: CharacteristicValue): Promise<void>;
    handleCurrentTempGet(asset: RangeFeature): Promise<number>;
    handleSetTempGet(asset: RangeFeature): Promise<number>;
    handleSetTempSet(asset: RangeFeature, value: CharacteristicValue): Promise<void>;
    handleAutoModeGet(): Promise<boolean>;
    handleAutoModeSet(value: CharacteristicValue): Promise<void>;
}
//# sourceMappingURL=fan-accessory.d.ts.map