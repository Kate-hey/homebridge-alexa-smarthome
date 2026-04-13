import type { Characteristic } from 'homebridge';
import { CapabilityState } from '../domain/alexa';
export declare const mapHomeKitPowerToAlexaAction: (value: CapabilityState['value'], characteristic: typeof Characteristic) => "lock" | "unlock" | "turnOn" | "turnOff" | "setBrightness" | "setColor" | "setColorTemperature" | "setTargetSetpoint" | "adjustTargetSetpoint" | "setThermostatMode";
export declare const mapHomeKitPowerToAlexaValue: (value: CapabilityState['value'], characteristic: typeof Characteristic) => string;
//# sourceMappingURL=fan-mapper.d.ts.map