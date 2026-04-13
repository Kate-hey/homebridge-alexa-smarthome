"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempSensorQuery = void 0;
exports.TempSensorQuery = `query getTemperatureStates(
  $endpointId: String!
) {
  endpoint(id: $endpointId) {
    features {
      name
      properties {
        name
        ... on TemperatureSensor {
          value {
            value
            scale
          }
        }
      }
    }
  }
}`;
//# sourceMappingURL=temperature_features.graphql.js.map