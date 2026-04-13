"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThermostatQuery = void 0;
exports.ThermostatQuery = `query getThermostatStates(
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
        ... on Setpoint {
          value {
            value
            scale
          }
        }
        ... on TemperatureSensor {
          value {
            value
            scale
          }
        }
        ... on ThermostatMode {
          thermostatModeValue
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
//# sourceMappingURL=thermostat_features.graphql.js.map