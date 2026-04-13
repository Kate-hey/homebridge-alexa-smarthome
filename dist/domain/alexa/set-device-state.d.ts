import * as E from 'fp-ts/Either';
import { AlexaApiError } from './errors';
import { DeviceResponse } from './index';
export declare const validateSetStateSuccessful: <B extends SetDeviceStateResponse>(b: B) => E.Either<AlexaApiError, B>;
export default interface SetDeviceStateResponse {
    controlResponses: DeviceResponse[];
    errors: DeviceResponse[];
}
//# sourceMappingURL=set-device-state.d.ts.map