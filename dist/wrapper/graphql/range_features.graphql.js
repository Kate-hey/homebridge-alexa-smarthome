"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeQuery = void 0;
exports.RangeQuery = `query getRangeStates(
  $endpointId: String!
) {
  endpoint(id: $endpointId) {
    features {
      name
      instance
      properties {
        name
        ... on RangeValue {
          rangeValue {
            value
          }
        }
      }
      configuration {
        ... on RangeConfiguration {
          friendlyName {
            value {
              text
            }
          }
        }
      }
    }
  }
}`;
//# sourceMappingURL=range_features.graphql.js.map