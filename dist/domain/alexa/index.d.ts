import { InitOptions } from 'alexa-remote2';
import { Nullable } from '../index';
export declare const SupportedDeviceTypes: string[];
export type AmazonDomain = 'amazon.com' | 'amazon.ca' | 'amazon.de' | 'amazon.es' | 'amazon.fr' | 'amazon.it' | 'amazon.in' | 'amazon.nl' | 'amazon.co.jp' | 'amazon.co.uk' | 'amazon.com.au' | 'amazon.com.br' | 'amazon.com.mx';
type FormerRegistrationData = Extract<Extract<InitOptions, Partial<object>>['formerRegistrationData'], object>;
export type Authentication = FormerRegistrationData;
export interface DeviceResponse {
    entity: Nullable<{
        entityId: string;
        entityType: string;
    }>;
    entityId: Nullable<string>;
    code: Nullable<string>;
    message: Nullable<string>;
    error: Nullable<string>;
}
export declare const SupportedNamespaces: {
    readonly 'Alexa.LockController': "Alexa.LockController";
    readonly 'Alexa.PowerController': "Alexa.PowerController";
    readonly 'Alexa.BrightnessController': "Alexa.BrightnessController";
    readonly 'Alexa.TemperatureSensor': "Alexa.TemperatureSensor";
    readonly 'Alexa.ThermostatController': "Alexa.ThermostatController";
    readonly 'Alexa.RangeController': "Alexa.RangeController";
    readonly 'Alexa.HumiditySensor': "Alexa.HumiditySensor";
    readonly 'Alexa.ThermostatController.HVAC.Components': "Alexa.ThermostatController.HVAC.Components";
};
export type SupportedNamespacesType = keyof typeof SupportedNamespaces;
export declare const SupportedActions: {
    readonly lock: "lock";
    readonly unlock: "unlock";
    readonly turnOn: "turnOn";
    readonly turnOff: "turnOff";
    readonly setBrightness: "setBrightness";
    readonly setColor: "setColor";
    readonly setColorTemperature: "setColorTemperature";
    readonly setTargetSetpoint: "setTargetSetpoint";
    readonly adjustTargetSetpoint: "adjustTargetSetpoint";
    readonly setThermostatMode: "setThermostatMode";
};
export type SupportedActionsType = keyof typeof SupportedActions;
export declare const SupportedFeatures: {
    readonly brightness: "brightness";
    readonly color: "color";
    readonly colorTemperature: "colorTemperature";
    readonly lock: "lock";
    readonly power: "power";
    readonly range: "range";
    readonly temperatureSensor: "temperatureSensor";
    readonly thermostat: "thermostat";
    readonly toggle: "toggle";
};
export type SupportedFeatures = keyof typeof SupportedFeatures;
export interface CapabilityState {
    featureName: SupportedFeatures;
    value: string | number | boolean | Record<string, unknown>;
    instance?: Nullable<string>;
    name?: Nullable<string>;
    rangeName?: Nullable<string>;
}
export {};
//# sourceMappingURL=index.d.ts.map