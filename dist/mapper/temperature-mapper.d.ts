import * as O from 'fp-ts/Option';
import type { Characteristic } from 'homebridge';
import { CapabilityState } from '../domain/alexa';
import { TemperatureScale } from '../domain/alexa/temperature';
export declare const mapAlexaTempToHomeKit: (state: CapabilityState['value']) => O.None | O.Some<number>;
export declare const mapHomeKitTempToAlexa: (temp: number, units: TemperatureScale) => number;
export declare const mapAlexaTempUnitsToHomeKit: (state: CapabilityState['value'], characteristic: typeof Characteristic) => O.None | O.Some<number>;
//# sourceMappingURL=temperature-mapper.d.ts.map