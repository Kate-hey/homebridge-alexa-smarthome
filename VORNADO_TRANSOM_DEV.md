# Vornado Transom AE - Full HomeKit Integration Development Plan

**Fork target:** `joeyhage/homebridge-alexa-smarthome`  
**Device name in Alexa:** `window fan`  
**Endpoint ID:** `amzn1.alexa.endpoint.33823809-75ac-401e-9013-9b87f84ce39f`  
**Model ID:** `A1AZ0VKGUB06NH`  
**Goal:** Extend fan accessory support to expose temperature setpoint, ambient temperature sensor, and direction (intake/exhaust) toggle to HomeKit, beyond the current on/off-only behavior.

---

## Device State Observations (Empirical)

### Observation 1 - 4/12/2026 (baseline, fan in intake mode)

```json
[
  { "featureName": "power",   "name": "powerState",  "value": "ON"  },
  { "featureName": "range",   "name": "rangeValue",  "value": 71, "instance": "3", "rangeName": "Set Temperature" },
  { "featureName": "range",   "name": "rangeValue",  "value": 74, "instance": "5", "rangeName": "Air Temperature" },
  { "featureName": "toggle",  "name": "toggleState", "value": "OFF" }
]
```

### Observation 2 - 4/13/2026 (direction switched to exhaust via Alexa app)

```json
[
  { "featureName": "power",   "name": "powerState",  "value": "ON"  },
  { "featureName": "range",   "name": "rangeValue",  "value": 71, "instance": "3", "rangeName": "Set Temperature" },
  { "featureName": "range",   "name": "rangeValue",  "value": 67, "instance": "5", "rangeName": "Air Temperature" },
  { "featureName": "toggle",  "name": "toggleState", "value": "OFF" }
]
```

### Conclusions from Comparison

| Feature | Observation |
|---|---|
| `toggleState` | Remained `OFF` across both observations despite direction change. **Toggle is NOT the direction control.** |
| `Air Temperature` | Changed from 74°F to 67°F. Temperature sensor is live and updating correctly. |
| `Set Temperature` | Unchanged at 71°F. Confirms this is a user-configurable setpoint, not a sensor. |
| Direction control | Not reflected anywhere in the current state output. See analysis below. |

---

## Direction Control - Updated Analysis

The direction change does not appear in the polled state. There are two candidate explanations.

### Candidate A: Second `turnOn`/`turnOff` Pair in supportedOperations

The `supportedOperations` array contains two `turnOn` and two `turnOff` entries:

```json
"supportedOperations": [
  "turnOn",
  "turnOff",
  "setRangeValue",
  "adjustRangeValue",
  "turnOn",
  "turnOff"
]
```

The first pair controls main power. The second pair is a sub-endpoint and is the most likely candidate for direction control. In the Alexa Smart Home API, sub-endpoint operations are sent to a child endpoint ID that is derived from the primary endpoint ID. The plugin's current state query may not be returning the sub-endpoint's state, which would explain why direction does not appear in the state array.

**Action item:** Inspect the raw API response from `alexa-remote2` before it is parsed by the plugin. Look for a `relationships` or `subEndpoints` array on the device object, or a separate endpoint ID associated with the second `turnOn`/`turnOff` pair. Enable maximum debug logging and search for the full unfiltered device object.

### Candidate B: Toggle Is Direction, State Is Not Refreshing

Less likely given that the air temperature did update. However, it is worth forcing a cache flush and re-polling before ruling this out. Delete the plugin's persisted state file and restart Homebridge, then re-check.

### What the Toggle Likely Is

Given that it is not direction, `toggleState` is most likely one of:
- Auto mode on/off (fan runs to setpoint vs. constant speed)
- A sleep/timer mode
- An ionizer or air quality feature (some Vornado models have this)

The toggle value has been `OFF` in both observations. Try toggling it explicitly from the Alexa app using a routine or the device controls and observe whether the state response changes.

---

## Capability Summary (Current Understanding)

| Feature | Instance | Read/Write | Confirmed | Description |
|---|---|---|---|---|
| `power` / `powerState` | - | R/W | Yes | Fan power on/off |
| `range` / `rangeValue` | `3` | R/W | Yes | Target temperature setpoint (°F) |
| `range` / `rangeValue` | `5` | Read-only | Yes | Ambient air temperature sensor (°F) |
| `toggle` / `toggleState` | - | R/W | Partial | Unknown - NOT direction |
| Direction (exhaust/intake) | - | R/W | Not found yet | Likely sub-endpoint `turnOn`/`turnOff` |

---

## Next Debugging Steps

### Step 1 - Find the Sub-Endpoint

Add temporary logging in the plugin to dump the full raw device object from `alexa-remote2` before any parsing occurs. Look for:

```
device.relationships
device.subEndpoints
device.endpoints
```

The second `turnOn`/`turnOff` pair must be bound to a specific endpoint ID. Find that ID and confirm it responds to direction commands.

### Step 2 - Confirm Toggle Behavior

Using the Alexa app, find any toggle-type control on the device (auto mode, ionizer, etc.) and switch it. Re-check the log to confirm whether `toggleState` responds.

### Step 3 - Query Sub-Endpoint State Directly

If the sub-endpoint ID is found, query its state separately via `alexa-remote2` and check whether it returns a value that tracks direction.

---

## Implementation Plan (Updated)

### Phase 1 - Ambient Temperature Sensor (Read-Only, Confirmed Working, Start Here)

The temperature sensor (instance 5) is confirmed live. This is the safest first implementation with no unknowns.

```typescript
this.tempSensorService = this.accessory.getService(this.platform.Service.TemperatureSensor)
  || this.accessory.addService(this.platform.Service.TemperatureSensor);

this.tempSensorService
  .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
  .onGet(this.getCurrentTemperature.bind(this));

async getCurrentTemperature(): Promise<CharacteristicValue> {
  const fahrenheit = this.deviceState.airTemperature; // instance 5 value
  return (fahrenheit - 32) * 5 / 9; // HomeKit requires Celsius
}
```

HomeKit always uses Celsius internally. The conversion is required regardless of user display settings.

### Phase 2 - Direction Toggle (Blocked Pending Sub-Endpoint Discovery)

Hold until the sub-endpoint ID for the second `turnOn`/`turnOff` pair is confirmed. Once confirmed, the implementation will wire a HomeKit `Switch` service (named `"Exhaust Mode"`) or `SwingMode` to that sub-endpoint.

### Phase 3 - Temperature Setpoint (Blocked Pending Valid Range Confirmation)

Expose `Set Temperature` (range instance 3) as a writable control. Requires determining the valid min/max range and choosing the HomeKit service model. Do not implement until Phase 1 is tested.

### Phase 4 - Toggle Characteristic (Blocked Pending Identity Confirmation)

Once the toggle's actual function is confirmed, wire it to an appropriate HomeKit characteristic. If it is auto mode, a `Switch` service labeled `"Auto Mode"` is appropriate.

---

## State Parser Updates Required

Regardless of phase, the state parser must be updated to handle multi-instance range features correctly. Both range items share `featureName: "range"` and differ only by `instance`.

```typescript
interface DeviceState {
  powerState: 'ON' | 'OFF';
  setTemperature?: number;  // instance 3, °F
  airTemperature?: number;  // instance 5, °F
  toggleState?: 'ON' | 'OFF';
}

function parseState(rawState: AlexaStateItem[]): DeviceState {
  const state: DeviceState = { powerState: 'OFF' };
  for (const item of rawState) {
    if (item.featureName === 'power') {
      state.powerState = item.value;
    } else if (item.featureName === 'range' && item.instance === '3') {
      state.setTemperature = item.value;
    } else if (item.featureName === 'range' && item.instance === '5') {
      state.airTemperature = item.value;
    } else if (item.featureName === 'toggle') {
      state.toggleState = item.value;
    }
  }
  return state;
}
```

---

## Files to Modify

| File (verify paths in your fork) | Change |
|---|---|
| `src/accessories/fan-accessory.ts` | Add TemperatureSensor service; extend state parse; add direction once confirmed |
| `src/platform.ts` or device factory | Verify `FAN` deviceType routes to full fan accessory, not a switch fallback |
| `src/util/mapper.ts` or equivalent | Extend state parser to handle multi-instance range by featureName + instance |
| `config.schema.json` | Optional: config flag to suppress temperature sensor |

---

## Limitations and Known Constraints

**Fan speed is not available.** The four speed settings are voice-only in Alexa and do not appear in the Smart Home API surface.

**Direction control not yet located.** The sub-endpoint controlling exhaust/intake has not been confirmed. Investigation is required before implementation.

**No push state sync.** ACK devices do not send state change notifications. HomeKit will not reflect changes made via Alexa app, voice, or physical buttons until the next poll cycle.

**Temperature units.** The API reports in Fahrenheit. HomeKit requires Celsius. Conversion is required on all read and write paths.

**Amazon session cookie expiry.** The `alexa-remote2` session cookie is valid for approximately 14 days. Re-authentication is a manual step.

---

## Reference

- Plugin upstream: https://github.com/joeyhage/homebridge-alexa-smarthome
- Alexa-remote2 library: https://github.com/Apollon77/alexa-remote
- Comparable Vornado plugin (OSCR37, same ACK stack): https://github.com/anishmgoyal/homebridge-vornado-oscr37-alexa-plugin
- Issue tracking Transom fan detection: https://github.com/joeyhage/homebridge-alexa-smarthome/issues/113
- HAP-Node.js Fan service reference: https://developers.homebridge.io/#/service/Fan
- HAP-Node.js TemperatureSensor reference: https://developers.homebridge.io/#/service/TemperatureSensor
