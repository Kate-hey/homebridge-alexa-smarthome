import { CharacteristicValue, Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import BaseAccessory from './base-accessory';
export default class OutletAccessory extends BaseAccessory {
    static requiredOperations: SupportedActionsType[];
    service: Service;
    isExternalAccessory: boolean;
    configureServices(): void;
    handlePowerGet(): Promise<boolean>;
    handlePowerSet(value: CharacteristicValue): Promise<void>;
}
//# sourceMappingURL=outlet-accessory.d.ts.map