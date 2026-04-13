import { Either } from 'fp-ts/Either';
import { Nullable } from '../index';
import { AlexaApiError } from './errors';
export declare const validateGetDevicesSuccessful: (res: GetDevicesGraphQlResponse) => Either<AlexaApiError, [Endpoint, SmartHomeDevice][]>;
export interface SmartHomeDevice {
    id: string;
    endpointId: string;
    displayName: string;
    supportedOperations: string[];
    enabled: boolean;
    deviceType: string;
    serialNumber: string;
    model: string;
    manufacturer: string;
}
export interface Endpoint {
    id: string;
    friendlyName: string;
    displayCategories: Nullable<{
        primary: {
            value: string;
        };
    }>;
    serialNumber: Nullable<{
        value: {
            text: string;
        };
    }>;
    enablement: 'ENABLED' | 'DISABLED';
    model: Nullable<{
        value: {
            text: string;
        };
    }>;
    manufacturer: Nullable<{
        value: {
            text: string;
        };
    }>;
    features: Array<{
        name: string;
        instance: Nullable<string>;
        operations: Nullable<Array<{
            name: string;
        }>>;
        properties: Array<{
            name: string;
            rangeValue: Nullable<{
                value: number;
            }>;
            value: Nullable<{
                value: number;
                scale: 'CELSIUS' | 'FAHRENHEIT' | 'KELVIN';
            }>;
            toggleStateValue: Nullable<'ON' | 'OFF'>;
            powerStateValue: Nullable<'ON' | 'OFF'>;
            brightnessStateValue: Nullable<number>;
            colorStateValue: Nullable<{
                hue: number;
                saturation: number;
                brightness: number;
            }>;
            colorTemperatureInKelvinStateValue: Nullable<number>;
            lockState: Nullable<'LOCKED' | 'UNLOCKED' | 'JAMMED'>;
            thermostatModeValue: Nullable<'HEAT' | 'COOL' | 'AUTO' | 'ECO' | 'OFF'>;
        }>;
        configuration: Nullable<{
            friendlyName: {
                value: {
                    text: string;
                };
            };
        }>;
    }>;
    endpointReports: Nullable<Array<{
        reporter: {
            id: string;
            namespace: string;
            skillStage: string;
        };
    }>>;
}
export interface GetDevicesGraphQlResponse {
    data: Nullable<{
        endpoints: Nullable<{
            items: Nullable<Endpoint[]>;
        }>;
    }>;
}
//# sourceMappingURL=get-devices.d.ts.map