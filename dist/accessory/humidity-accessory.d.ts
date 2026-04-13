import { Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import { RangeFeature } from '../domain/alexa/save-device-capabilities';
import BaseAccessory from './base-accessory';
export default class HumidityAccessory extends BaseAccessory {
    static requiredOperations: SupportedActionsType[];
    service: Service;
    isExternalAccessory: boolean;
    configureServices(): void;
    handleHumidityGet(asset: RangeFeature): Promise<number>;
    private determineLevel;
}
//# sourceMappingURL=humidity-accessory.d.ts.map