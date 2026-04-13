"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerQuery = void 0;
exports.PowerQuery = `query getPowerState(
  $endpointId: String!
) {
  endpoint(id: $endpointId) {
    features {
      name
      properties {
        name
        ... on Power {
          powerStateValue
        }
      }
    }
  }
}`;
//# sourceMappingURL=power_features.graphql.js.map