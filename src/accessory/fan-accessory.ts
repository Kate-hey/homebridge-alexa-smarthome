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
  private tempSensorService?: Service;
  private autoModeService?: Service;
  private setTempAsset?: RangeFeature;

  configureServices() {
    this.service =
      this.platformAcc.getService(this.Service.Fanv2) ||
      this.platformAcc.addService(this.Service.Fanv2, this.device.displayName);

    this.service
      .getCharacteristic(this.Characteristic.Active)
      .onGet(this.handleActiveGet.bind(this))
      .onSet(this.handleActiveSet.bind(this));

    // Phase 1: Ambient temperature sensor (read-only, range instance 5)
    pipe(
      this.rangeFeatures,
      RR.lookup(FanRangeFeatures.airTemperature),
      O.map((asset) => {
        this.tempSensorService =
          this.platformAcc.getService(this.Service.TemperatureSensor) ||
          this.platformAcc.addService(
            this.Service.TemperatureSensor,
            FanRangeFeatures.airTemperature,
          );
        this.tempSensorService
          .getCharacteristic(this.Characteristic.CurrentTemperature)
          .onGet(this.handleCurrentTempGet.bind(this, asset));
      }),
    );

    // Phase 3: Temperature setpoint (writable, range instance 3)
    pipe(
      this.rangeFeatures,
      RR.lookup(FanRangeFeatures.setTemperature),
      O.map((asset) => {
        this.setTempAsset = asset;
        this.service
          .getCharacteristic(this.Characteristic.RotationSpeed)
          .setProps({ minValue: 15, maxValue: 32, minStep: 1 })
          .onGet(this.handleSetTempGet.bind(this, asset))
          .onSet(this.handleSetTempSet.bind(this, asset));
      }),
    );

    // Phase 4: Auto mode toggle (instance 4)
    if (
      this.device.supportedOperations.includes('turnOn') &&
      this.device.supportedOperations.includes('turnOff')
    ) {
      const cachedToggle = this.getCacheValue('toggle');
      if (O.isSome(cachedToggle)) {
        this.autoModeService =
          this.platformAcc.getService(this.Service.Switch) ||
          this.platformAcc.addService(
            this.Service.Switch,
            'Auto Mode',
            'auto-mode',
          );
        this.autoModeService
          .getCharacteristic(this.Characteristic.On)
          .onGet(this.handleAutoModeGet.bind(this))
          .onSet(this.handleAutoModeSet.bind(this));
      }
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

  async handleAutoModeGet(): Promise<boolean> {
    const determineToggleState = flow(
      A.findFirst<FanState>(
        ({ featureName }) => featureName === 'toggle',
      ),
      O.tap(({ value }) =>
        O.of(
          this.logWithContext('debug', `Get auto mode result: ${value}`),
        ),
      ),
      O.map(({ value }) => value === 'ON'),
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
    if (typeof value !== 'boolean') {
      throw this.invalidValueError;
    }
    const action: SupportedActionsType = value ? 'turnOn' : 'turnOff';
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
            value: value ? 'ON' : 'OFF',
            featureName: 'toggle',
          });
        },
      ),
    )();
  }
}
