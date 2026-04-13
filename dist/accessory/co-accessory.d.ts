import { Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import { RangeFeature } from '../domain/alexa/save-device-capabilities';
import BaseAccessory from './base-accessory';
export default class CarbonMonoxideAccessory extends BaseAccessory {
    static requiredOperations: SupportedActionsType[];
    service: Service;
    isExternalAccessory: boolean;
    configureServices(): void;
    handleCarbonMonoxideDetectedGet(asset: RangeFeature): Promise<number>;
    handleCarbonMonoxideLevelGet(asset: RangeFeature): Promise<number>;
    private determineLevel;
}
//# sourceMappingURL=co-accessory.d.ts.map