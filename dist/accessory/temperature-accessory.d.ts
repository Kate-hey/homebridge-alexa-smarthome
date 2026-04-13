import { Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import BaseAccessory from './base-accessory';
export default class TemperatureAccessory extends BaseAccessory {
    static requiredOperations: SupportedActionsType[];
    service: Service;
    isExternalAccessory: boolean;
    configureServices(): void;
    handleCurrentTempGet(): Promise<number>;
}
//# sourceMappingURL=temperature-accessory.d.ts.map