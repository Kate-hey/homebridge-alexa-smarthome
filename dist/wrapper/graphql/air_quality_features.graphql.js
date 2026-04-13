"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirQualityQuery = void 0;
exports.AirQualityQuery = `query getAirQualityStates(
  $endpointId: String!
) {
  endpoint(id: $endpointId) {
    features {
      name
      properties {
        name
        ... on RangeValue {
          rangeValue {
            value
          }
        }
        ... on TemperatureSensor {
          value {
            value
            scale
          }
        }
        ... on ToggleState {
          toggleStateValue
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
//# sourceMappingURL=air_quality_features.graphql.js.map