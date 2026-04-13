import { Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import { RangeFeature } from '../domain/alexa/save-device-capabilities';
import BaseAccessory from './base-accessory';
export default class AirQualityAccessory extends BaseAccessory {
    static requiredOperations: SupportedActionsType[];
    service: Service;
    isExternalAccessory: boolean;
    configureServices(): void;
    handleAirQualityGet(asset: RangeFeature): Promise<number>;
    handlePM25DensityGet(asset: RangeFeature): Promise<number>;
    handleVocDensityGet(asset: RangeFeature): Promise<number>;
    private determineDensity;
}
//# sourceMappingURL=air-quality-accessory.d.ts.map