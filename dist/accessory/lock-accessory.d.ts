import { CharacteristicValue, Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import BaseAccessory from './base-accessory';
export default class LockAccessory extends BaseAccessory {
    static requiredOperations: SupportedActionsType[];
    service: Service;
    isExternalAccessory: boolean;
    configureServices(): void;
    handleCurrentStateGet(): Promise<number>;
    handleTargetStateGet(): Promise<number>;
    handleTargetStateSet(value: CharacteristicValue): Promise<void>;
}
//# sourceMappingURL=lock-accessory.d.ts.map