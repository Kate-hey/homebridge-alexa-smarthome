import { Endpoint } from './get-devices';
import { CapabilityState } from './index';
export declare const extractStates: (deviceFeatures: EndpointStateResponse['data']['endpoint']['features']) => CapabilityState[];
interface EndpointStateResponse {
    data: {
        endpoint: {
            features: Endpoint['features'];
        };
    };
}
export default EndpointStateResponse;
//# sourceMappingURL=get-device-state.d.ts.map