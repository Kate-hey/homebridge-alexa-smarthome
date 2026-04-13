"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FanQuery = void 0;
exports.FanQuery = `query getFanStates(
  $endpointId: String!
) {
  endpoint(id: $endpointId) {
    features {
      name
      instance
      properties {
        name
        ... on Power {
          powerStateValue
        }
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
//# sourceMappingURL=fan_features.graphql.js.map