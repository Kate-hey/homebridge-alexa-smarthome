import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import * as RR from 'fp-ts/ReadonlyRecord';
import * as TE from 'fp-ts/TaskEither';
import { flow, identity, pipe } from 'fp-ts/lib/function';
import { CharacteristicValue, Service } from 'homebridge';
import { SupportedActionsType } from '../domain/alexa';
import { FanRangeFeatures, FanState } from '../domain/alexa/fan';
import { RangeFeature } from '../domain/alexa/save-device-capabilities';
import * as mapper from '../mapper/fan-mapper';
import * as tempMapper from '../mapper/temperature-mapper';
import BaseAccessory from './base-accessory';

export default class FanAccessory extends BaseAccessory {
  static requiredOperations: SupportedActionsType[] = ['turnOn', 'turnOff'];
  service: Service;
  isExternalAccessory = false;
  private heaterCoolerService?: Service;
  private airTempAsset?: RangeFeature;
  private setTempAsset?: RangeFeature;

  configureServices() {
    this.service =
      this.platformAcc.getService(this.Service.Fanv2) ||
      this.platformAcc.addService(this.Service.Fanv2, this.device.displayName);

    this.service
      .getCharacteristic(this.Characteristic.Active)
      .onGet(this.handleActiveGet.bind(this))
      .onSet(this.handleActiveSet.bind(this));

    // Remove stale RotationSpeed characteristic if present from previous version
    if (this.service.testCharacteristic(this.Characteristic.RotationSpeed)) {
      this.service.removeCharacteristic(
        this.service.getCharacteristic(this.Characteristic.RotationSpeed),
      );
    }

    // Remove stale Switch service (old Auto Mode) if present
    const staleSwitch = this.platformAcc.getService(this.Service.Switch);
    if (staleSwitch) {
      this.platformAcc.removeService(staleSwitch);
    }

    // Remove stale TemperatureSensor service if present (now part of HeaterCooler)
    const staleTempSensor = this.platformAcc.getService(
      this.Service.TemperatureSensor,
    );
    if (staleTempSensor) {
      this.platformAcc.removeService(staleTempSensor);
    }

    // Look up range features for temperature
    const maybeAirTemp = pipe(
      this.rangeFeatures,
      RR.lookup(FanRangeFeatures.airTemperature),
    );
    const maybeSetTemp = pipe(
      this.rangeFeatures,
      RR.lookup(FanRangeFeatures.setTemperature),
    );

    if (O.isSome(maybeAirTemp) || O.isSome(maybeSetTemp)) {
      this.airTempAsset = O.isSome(maybeAirTemp)
        ? maybeAirTemp.value
        : undefined;
      this.setTempAsset = O.isSome(maybeSetTemp)
        ? maybeSetTemp.value
        : undefined;

      this.heaterCoolerService =
        this.platformAcc.getService(this.Service.HeaterCooler) ||
        this.platformAcc.addService(
          this.Service.HeaterCooler,
          'Temperature Control',
        );

      // Active — maps to Auto Mode toggle (instance 4)
      this.heaterCoolerService
        .getCharacteristic(this.Characteristic.Active)
        .onGet(this.handleAutoModeGet.bind(this))
        .onSet(this.handleAutoModeSet.bind(this));

      // CurrentHeaterCoolerState — read-only, COOLING when auto on, INACTIVE when off
      this.heaterCoolerService
        .getCharacteristic(this.Characteristic.CurrentHeaterCoolerState)
        .onGet(this.handleCurrentHeaterCoolerStateGet.bind(this));

      // TargetHeaterCoolerState — locked to COOL
      this.heaterCoolerService
        .getCharacteristic(this.Characteristic.TargetHeaterCoolerState)
        .setProps({
          validValues: [
            this.Characteristic.TargetHeaterCoolerState.COOL,
          ],
        })
        .onGet(() => this.Characteristic.TargetHeaterCoolerState.COOL)
        .onSet(() => {});

      // CurrentTemperature — ambient air temperature (instance 5)
      if (this.airTempAsset) {
        this.heaterCoolerService
          .getCharacteristic(this.Characteristic.CurrentTemperature)
          .onGet(this.handleCurrentTempGet.bind(this, this.airTempAsset));
      }

      // CoolingThresholdTemperature — set temperature (instance 3)
      if (this.setTempAsset) {
        this.heaterCoolerService
          .getCharacteristic(this.Characteristic.CoolingThresholdTemperature)
          .setProps({ minValue: 15, maxValue: 33, minStep: 0.5 })
          .onGet(this.handleSetTempGet.bind(this, this.setTempAsset))
          .onSet(this.handleSetTempSet.bind(this, this.setTempAsset));
      }

      // TemperatureDisplayUnits — Fahrenheit (read-only)
      this.heaterCoolerService
        .getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
        .onGet(
          () => this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT,
        )
        .onSet(() => {
          throw this.readOnlyError;
        });
    }
  }

  async handleActiveGet(): Promise<boolean> {
    const determinePowerState = flow(
      A.findFirst<FanState>(({ featureName }) => featureName === 'power'),
      O.tap(({ value }) =>
        O.of(this.logWithContext('debug', `Get power result: ${value}`)),
      ),
      O.map(({ value }) => value === 'ON'),
    );

    return pipe(
      this.getStateGraphQl(determinePowerState),
      TE.match((e) => {
        this.logWithContext('errorT', 'Get power', e);
        throw this.serviceCommunicationError;
      }, identity),
    )();
  }

  async handleActiveSet(value: CharacteristicValue): Promise<void> {
    this.logWithContext('debug', `Triggered set power: ${value}`);
    if (typeof value !== 'number') {
      throw this.invalidValueError;
    }
    const action = mapper.mapHomeKitPowerToAlexaAction(
      value,
      this.Characteristic,
    );
    return pipe(
      this.platform.alexaApi.setDeviceStateGraphQl(
        this.device.endpointId,
        'power',
        action,
      ),
      TE.match(
        (e) => {
          this.logWithContext('errorT', 'Set power', e);
          throw this.serviceCommunicationError;
        },
        () => {
          this.updateCacheValue({
            value: mapper.mapHomeKitPowerToAlexaValue(
              value,
              this.Characteristic,
            ),
            featureName: 'power',
          });
        },
      ),
    )();
  }

  async handleCurrentTempGet(asset: RangeFeature): Promise<number> {
    const determineCurrentTemp = flow(
      A.findFirst<FanState>(
        ({ featureName, instance }) =>
          featureName === 'range' && asset.instance === instance,
      ),
      O.flatMap(({ value }) =>
        typeof value === 'number'
          ? tempMapper.mapAlexaTempToHomeKit({ value, scale: 'FAHRENHEIT' })
          : O.none,
      ),
      O.tap((s) =>
        O.of(
          this.logWithContext('debug', `Get current temperature result: ${s}`),
        ),
      ),
    );

    return pipe(
      this.getStateGraphQl(determineCurrentTemp),
      TE.match((e) => {
        this.logWithContext('errorT', 'Get current temperature', e);
        throw this.serviceCommunicationError;
      }, identity),
    )();
  }

  async handleSetTempGet(asset: RangeFeature): Promise<number> {
    const determineSetTemp = flow(
      A.findFirst<FanState>(
        ({ featureName, instance }) =>
          featureName === 'range' && asset.instance === instance,
      ),
      O.flatMap(({ value }) =>
        typeof value === 'number'
          ? tempMapper.mapAlexaTempToHomeKit({ value, scale: 'FAHRENHEIT' })
          : O.none,
      ),
      O.tap((s) =>
        O.of(
          this.logWithContext(
            'debug',
            `Get set temperature result: ${s} Celsius`,
          ),
        ),
      ),
    );

    return pipe(
      this.getStateGraphQl(determineSetTemp),
      TE.match((e) => {
        this.logWithContext('errorT', 'Get set temperature', e);
        throw this.serviceCommunicationError;
      }, identity),
    )();
  }

  async handleSetTempSet(
    asset: RangeFeature,
    value: CharacteristicValue,
  ): Promise<void> {
    this.logWithContext('debug', `Triggered set temperature: ${value}`);
    if (typeof value !== 'number') {
      throw this.invalidValueError;
    }
    const fahrenheit = tempMapper.mapHomeKitTempToAlexa(value, 'FAHRENHEIT');
    return pipe(
      this.platform.alexaApi.setDeviceStateGraphQl(
        this.device.endpointId,
        'range',
        'setRangeValue',
        { rangeValue: fahrenheit },
        asset.instance,
      ),
      TE.match(
        (e) => {
          this.logWithContext('errorT', 'Set temperature', e);
          throw this.serviceCommunicationError;
        },
        () => {
          this.updateCacheValue({
            value: fahrenheit,
            featureName: 'range',
            instance: asset.instance,
          });
        },
      ),
    )();
  }

  async handleAutoModeGet(): Promise<number> {
    const determineToggleState = flow(
      A.findFirst<FanState>(({ featureName }) => featureName === 'toggle'),
      O.tap(({ value }) =>
        O.of(this.logWithContext('debug', `Get auto mode result: ${value}`)),
      ),
      O.map(({ value }) =>
        value === 'ON'
          ? this.Characteristic.Active.ACTIVE
          : this.Characteristic.Active.INACTIVE,
      ),
    );

    return pipe(
      this.getStateGraphQl(determineToggleState),
      TE.match((e) => {
        this.logWithContext('errorT', 'Get auto mode', e);
        throw this.serviceCommunicationError;
      }, identity),
    )();
  }

  async handleAutoModeSet(value: CharacteristicValue): Promise<void> {
    this.logWithContext('debug', `Triggered set auto mode: ${value}`);
    if (typeof value !== 'number') {
      throw this.invalidValueError;
    }
    const action: SupportedActionsType =
      value === this.Characteristic.Active.ACTIVE ? 'turnOn' : 'turnOff';
    return pipe(
      this.platform.alexaApi.setDeviceStateGraphQl(
        this.device.endpointId,
        'toggle',
        action,
        {},
        '4',
      ),
      TE.match(
        (e) => {
          this.logWithContext('errorT', 'Set auto mode', e);
          throw this.serviceCommunicationError;
        },
        () => {
          this.updateCacheValue({
            value:
              value === this.Characteristic.Active.ACTIVE ? 'ON' : 'OFF',
            featureName: 'toggle',
          });
        },
      ),
    )();
  }

  async handleCurrentHeaterCoolerStateGet(): Promise<number> {
    const determineState = flow(
      A.findFirst<FanState>(({ featureName }) => featureName === 'toggle'),
      O.map(({ value }) =>
        value === 'ON'
          ? this.Characteristic.CurrentHeaterCoolerState.COOLING
          : this.Characteristic.CurrentHeaterCoolerState.INACTIVE,
      ),
    );

    return pipe(
      this.getStateGraphQl(determineState),
      TE.match((e) => {
        this.logWithContext('errorT', 'Get heater cooler state', e);
        throw this.serviceCommunicationError;
      }, identity),
    )();
  }
}
