"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetEndpointFeatures = void 0;
exports.SetEndpointFeatures = `mutation updatePowerFeatureForEndpoints($featureControlRequests: [FeatureControlRequest!]!) {
  setEndpointFeatures(
    setEndpointFeaturesInput: {
      featureControlRequests: $featureControlRequests
    }
  ) {
    featureControlResponses {
      endpointId
      featureOperationName
      __typename
    }
    errors {
      endpointId
      code
      __typename
    }
    __typename
  }
}`;
//# sourceMappingURL=set_endpoint_features.graphql.js.map