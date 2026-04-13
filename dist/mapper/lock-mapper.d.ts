import type { Characteristic } from 'homebridge';
import { CapabilityState } from '../domain/alexa';
export declare const mapAlexaCurrentStateToHomeKit: (value: CapabilityState['value'], characteristic: typeof Characteristic) => number;
export declare const mapAlexaTargetStateToHomeKit: (value: CapabilityState['value'], characteristic: typeof Characteristic) => number;
//# sourceMappingURL=lock-mapper.d.ts.map