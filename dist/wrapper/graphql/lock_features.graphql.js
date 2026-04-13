"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockQuery = void 0;
exports.LockQuery = `query getLockState(
  $endpointId: String!
) {
  endpoint(id: $endpointId) {
    features {
      name
      __typename
      properties {
        name
        ... on Lock {
          lockState
        }
      }
    }
    __typename
  }
}`;
//# sourceMappingURL=lock_features.graphql.js.map