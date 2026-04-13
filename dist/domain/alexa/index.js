"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportedFeatures = exports.SupportedActions = exports.SupportedNamespaces = exports.SupportedDeviceTypes = void 0;
exports.SupportedDeviceTypes = [
    'LIGHT',
    'SWITCH',
    'SMARTLOCK',
    'FAN',
    'SMARTPLUG',
    'THERMOSTAT',
    'ALEXA_VOICE_ENABLED',
    'AIR_QUALITY_MONITOR',
    'VACUUM_CLEANER',
    'GAME_CONSOLE',
    'AIR_FRESHENER',
];
exports.SupportedNamespaces = {
    'Alexa.LockController': 'Alexa.LockController',
    'Alexa.PowerController': 'Alexa.PowerController',
    'Alexa.BrightnessController': 'Alexa.BrightnessController',
    'Alexa.TemperatureSensor': 'Alexa.TemperatureSensor',
    'Alexa.ThermostatController': 'Alexa.ThermostatController',
    'Alexa.RangeController': 'Alexa.RangeController',
    'Alexa.HumiditySensor': 'Alexa.HumiditySensor',
    'Alexa.ThermostatController.HVAC.Components': 'Alexa.ThermostatController.HVAC.Components',
};
exports.SupportedActions = {
    lock: 'lock',
    unlock: 'unlock',
    turnOn: 'turnOn',
    turnOff: 'turnOff',
    setBrightness: 'setBrightness',
    setColor: 'setColor',
    setColorTemperature: 'setColorTemperature',
    setTargetSetpoint: 'setTargetSetpoint',
    adjustTargetSetpoint: 'adjustTargetSetpoint',
    setThermostatMode: 'setThermostatMode',
    setRangeValue: 'setRangeValue',
    adjustRangeValue: 'adjustRangeValue',
};
exports.SupportedFeatures = {
    brightness: 'brightness',
    color: 'color',
    colorTemperature: 'colorTemperature',
    lock: 'lock',
    power: 'power',
    range: 'range',
    temperatureSensor: 'temperatureSensor',
    thermostat: 'thermostat',
    toggle: 'toggle',
};
//# sourceMappingURL=index.js.map