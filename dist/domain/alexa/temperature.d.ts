import { CapabilityState } from './index';
export declare const isTemperatureValue: (state: CapabilityState['value']) => state is Temperature;
export type TemperatureScale = 'fahrenheit' | 'celsius' | 'FAHRENHEIT' | 'CELSIUS';
export interface Temperature {
    scale: TemperatureScale;
    value: number;
    [x: string]: number | string;
}
//# sourceMappingURL=temperature.d.ts.map