import { CharacteristicValue, Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import { RangeFeature } from '../domain/alexa/save-device-capabilities';
import BaseAccessory from './base-accessory';
export default class ThermostatAccessory extends BaseAccessory {
    static requiredOperations: SupportedActionsType[];
    service: Service;
    isExternalAccessory: boolean;
    isPowerSupported: boolean;
    configureServices(): void;
    handleCurrentTempGet(): Promise<number>;
    handleCurrentRelativeHumidityGet(asset: RangeFeature): Promise<number>;
    handleTempUnitsGet(): Promise<number>;
    handleTargetStateGet(): Promise<number>;
    handleTargetStateSet(value: CharacteristicValue): Promise<void>;
    handleTargetTempGet(): Promise<number>;
    handleTargetTempSet(value: CharacteristicValue): Promise<void>;
    handleCoolTempGet(): Promise<number>;
    handleCoolTempSet(value: CharacteristicValue): Promise<void>;
    handleHeatTempGet(): Promise<number>;
    handleHeatTempSet(value: CharacteristicValue): Promise<void>;
    handlePowerGet(): Promise<boolean>;
    handlePowerSet(value: CharacteristicValue): Promise<void>;
    private getAutoTempFromTargetTemp;
    private calculateTargetTemp;
    private isTempWithScale;
    private onInvalidOrAutoMode;
    private onAutoMode;
    private getCachedTemps;
}
//# sourceMappingURL=thermostat-accessory.d.ts.map