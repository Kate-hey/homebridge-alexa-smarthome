import { CapabilityState, SupportedFeatures } from './index';

export interface FanState {
  featureName: keyof typeof FanFeatures & keyof typeof SupportedFeatures;
  value: CapabilityState['value'];
  instance?: CapabilityState['instance'];
}

export const FanFeatures = {
  power: 'power',
  range: 'range',
} as const;

export const FanRangeFeatures = {
  airTemperature: 'Air Temperature',
} as const;
