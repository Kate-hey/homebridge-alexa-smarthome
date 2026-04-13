import type { Characteristic } from 'homebridge';
import { CapabilityState } from '../domain/alexa';
export declare const mapAlexaModeToHomeKit: (value: CapabilityState['value'], characteristic: typeof Characteristic) => number;
export declare const mapHomekitModeToAlexa: (value: number, characteristic: typeof Characteristic) => string;
//# sourceMappingURL=thermostat-mapper.d.ts.map