"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightQuery = void 0;
exports.LightQuery = `query getPowerBrightnessColorColorTempStates(
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
        ... on Brightness {
          brightnessStateValue
        }
        ... on Color {
          colorStateValue {
            hue
            saturation
            brightness
          }
        }
        ... on ColorTemperature {
          colorTemperatureInKelvinStateValue
        }
      }
    }
  }
}
`;
//# sourceMappingURL=light_features.graphql.js.map