import { CapabilityState, SupportedFeatures } from './index';
export interface ThermostatState {
    featureName: keyof typeof ThermostatFeatures & keyof typeof SupportedFeatures;
    value: CapabilityState['value'];
    instance?: CapabilityState['instance'];
    name?: CapabilityState['name'];
}
export declare const ThermostatFeatures: {
    readonly range: "range";
    readonly temperatureSensor: "temperatureSensor";
    readonly thermostat: "thermostat";
};
export type ThermostatFeaturesType = keyof typeof ThermostatFeatures;
//# sourceMappingURL=thermostat.d.ts.map