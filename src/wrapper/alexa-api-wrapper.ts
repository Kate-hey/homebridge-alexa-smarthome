import { Semaphore, SemaphoreInterface, withTimeout } from 'async-mutex';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { TaskEither } from 'fp-ts/TaskEither';
import { match as fpMatch } from 'fp-ts/boolean';
import { constVoid, constant, pipe } from 'fp-ts/lib/function';
import { Service } from 'homebridge';
import { Pattern, match } from 'ts-pattern';
import AlexaRemote, {
  type CallbackWithErrorAndBody,
  type EntityType,
} from 'alexa-remote2';
import {
  CapabilityState,
  SupportedActionsType,
  SupportedFeatures,
} from '../domain/alexa';
import { AlexaApiError, HttpError, TimeoutError } from '../domain/alexa/errors';
import EndpointStateResponse, {
  extractStates,
} from '../domain/alexa/get-device-state.js';
import GetDeviceStatesResponse, {
  ValidStatesByDevice,
} from '../domain/alexa/get-device-states';
import {
  Endpoint,
  GetDevicesGraphQlResponse,
  SmartHomeDevice,
  validateGetDevicesSuccessful,
} from '../domain/alexa/get-devices';
import { extractRangeFeatures } from '../domain/alexa/save-device-capabilities';
import SetDeviceStateResponse, {
  validateSetStateSuccessful,
} from '../domain/alexa/set-device-state.js';
import DeviceStore from '../store/device-store';
import { PluginLogger } from '../util/plugin-logger';
import {
  AirQualityQuery,
  EndpointsQuery,
  FanQuery,
  LightQuery,
  LockQuery,
  PowerQuery,
  RangeQuery,
  SetEndpointFeatures,
  TempSensorQuery,
  ThermostatQuery,
} from './graphql';

export interface DeviceStatesCache {
  lastUpdated: Date;
  cachedStates: ValidStatesByDevice;
}

export class AlexaApiWrapper {
  private readonly semaphore: SemaphoreInterface;

  constructor(
    private readonly service: typeof Service,
    private readonly alexaRemote: AlexaRemote,
    private readonly log: PluginLogger,
    private readonly deviceStore: DeviceStore,
    private readonly textCommandDeviceSerial?: string,
  ) {
    this.semaphore = withTimeout(
      new Semaphore(2, new TimeoutError('Alexa API Timeout')),
      65_000,
    );
  }

  getDevices(): TaskEither<AlexaApiError, SmartHomeDevice[]> {
    const excludeHomebridgeAlexaPluginDevices = (e: Endpoint) =>
      !(Array.isArray(e.endpointReports) ? e.endpointReports : []).some(
        ({ reporter }) =>
          (reporter?.skillStage?.toLowerCase() === 'development' &&
            reporter.id ===
              'amzn1.ask.skill.a28c43e1-cba6-4aac-93ca-509e8c7ce39b') ||
          (reporter?.skillStage?.toLowerCase() === 'live' &&
            reporter.id ===
              'amzn1.ask.skill.2af008bb-2bb0-4bef-b131-e191f944a87e'),
      );
    return pipe(
      TE.tryCatch(
        () =>
          this.executeGraphQlQuery<GetDevicesGraphQlResponse>(EndpointsQuery),
        (reason) =>
          new HttpError(
            `Error getting smart home devices. Reason: ${
              (reason as Error).message
            }`,
          ),
      ),
      TE.flatMapEither(validateGetDevicesSuccessful),
      TE.map(A.filter(([e]) => excludeHomebridgeAlexaPluginDevices(e))),
      TE.tapIO((devices) => {
        this.deviceStore.deviceCapabilities = extractRangeFeatures(devices);
        devices.forEach(([e, d]) => {
          this.log.debug(
            `${d.displayName} ::: Raw device features: ${JSON.stringify(
              e.features,
              undefined,
              2,
            )}`,
          )();
          const states = extractStates(e.features);
          this.log.debug(
            `${d.displayName} ::: Device states: ${JSON.stringify(
              states,
              undefined,
              2,
            )}`,
          );
          this.deviceStore.updateCache([d.id], {
            [d.id]: O.of(states.map(E.right)),
          });
        });
        return this.log.debug(
          'Successfully obtained devices and their capabilities',
        );
      }),
      TE.map(A.map(([, d]) => d)),
    );
  }

  getDeviceStateGraphQl(
    device: SmartHomeDevice,
    service: Service,
    useCache: boolean,
  ): TaskEither<AlexaApiError, [boolean, CapabilityState[]]> {
    const {
      AirQualitySensor,
      CarbonMonoxideSensor,
      Fanv2,
      HumiditySensor,
      Lightbulb,
      LockMechanism,
      TemperatureSensor,
      Thermostat,
    } = this.service;
    return pipe(
      TE.tryCatch(
        () => this.semaphore.acquire(),
        (e) => e as TimeoutError,
      ),
      TE.map((_) => useCache),
      TE.flatMap(
        fpMatch(
          () =>
            pipe(
              TE.of(
                match(service.UUID)
                  .with(AirQualitySensor.UUID, constant(AirQualityQuery))
                  .with(Fanv2.UUID, constant(FanQuery))
                  .with(Lightbulb.UUID, constant(LightQuery))
                  .with(LockMechanism.UUID, constant(LockQuery))
                  .with(TemperatureSensor.UUID, constant(TempSensorQuery))
                  .with(Thermostat.UUID, constant(ThermostatQuery))
                  .with(
                    Pattern.union(
                      CarbonMonoxideSensor.UUID,
                      HumiditySensor.UUID,
                    ),
                    constant(RangeQuery),
                  )
                  .otherwise(constant(PowerQuery)),
              ),
              TE.tapIO((query) =>
                this.log.debug(
                  `Querying for changes to ${
                    device.displayName
                  } using ${query.substring(0, query.indexOf('('))}`,
                ),
              ),
              TE.flatMap((query) =>
                TE.tryCatch(
                  () =>
                    this.executeGraphQlQuery<EndpointStateResponse>(query, {
                      endpointId: device.endpointId,
                    }),
                  (reason) =>
                    new HttpError(
                      `Error getting smart home device state for ${
                        device.displayName
                      }. Reason: ${(reason as Error).message}`,
                    ),
                ),
              ),
              TE.map((_) => extractStates(_.data.endpoint.features)),
              TE.map((states) => {
                this.deviceStore.updateCache([device.id], {
                  [device.id]: O.of(states.map(E.right)),
                });
                return [false, states] as [boolean, CapabilityState[]];
              }),
            ),
          () =>
            pipe(
              TE.of([
                true,
                this.deviceStore.getCacheStatesForDevice(device.id),
              ] as [boolean, CapabilityState[]]),
              TE.tapIO(() =>
                this.log.debug('Obtained device state from cache'),
              ),
            ),
        ),
      ),
      TE.mapBoth(
        (e) => {
          this.semaphore.release();
          return e;
        },
        (res) => {
          this.semaphore.release();
          return res;
        },
      ),
    );
  }

  setDeviceStateGraphQl(
    endpointId: string,
    featureName: SupportedFeatures,
    featureOperationName: SupportedActionsType,
    payload: Record<string, unknown> = {},
    instance?: string,
  ): TaskEither<AlexaApiError, void> {
    const request = {
      endpointId,
      featureOperationName,
      featureName,
      ...(instance ? { instance } : {}),
      ...(Object.keys(payload).length > 0 ? { payload } : {}),
    };
    return pipe(
      TE.tryCatch(
        () =>
          this.executeGraphQlQuery<EndpointStateResponse>(SetEndpointFeatures, {
            featureControlRequests: [request],
          }),
        (reason) =>
          new HttpError(
            `Error setting smart home device state. Reason: ${
              (reason as Error).message
            }`,
          ),
      ),
      TE.map(constVoid),
    );
  }

  setDeviceState(
    deviceId: string,
    action: SupportedActionsType,
    parameters: Record<string, string> = {},
    entityType: EntityType = 'APPLIANCE',
  ): TaskEither<AlexaApiError, void> {
    return pipe(
      TE.tryCatch(
        () =>
          this.changeDeviceState(
            deviceId,
            { action, ...parameters },
            entityType,
          ),
        (reason) =>
          new HttpError(
            `Error setting smart home device state. Reason: ${
              (reason as Error).message
            }`,
          ),
      ),
      TE.flatMapEither(validateSetStateSuccessful),
      TE.map(constVoid),
    );
  }

  private async executeGraphQlQuery<T>(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<T> {
    const flags = {
      method: 'POST',
      data: JSON.stringify({
        query,
        variables,
      }),
    };
    return AlexaApiWrapper.toPromise<T>((cb) =>
      this.alexaRemote.httpsGet(false, '/nexus/v1/graphql', cb, flags),
    );
  }

  sendTextCommand(text: string): TaskEither<AlexaApiError, void> {
    const serials = this.alexaRemote.serialNumbers;
    const serialKeys = Object.keys(serials);
    this.log.info(
      `Available Alexa devices: ${JSON.stringify(
        serialKeys.map((k) => ({
          serial: k,
          name: serials[k]?.deviceAccountId ?? 'unknown',
        })),
      )}`,
    )();
    const firstSerial =
      this.textCommandDeviceSerial &&
      serialKeys.includes(this.textCommandDeviceSerial)
        ? this.textCommandDeviceSerial
        : serialKeys[0];
    if (!firstSerial) {
      return TE.left(
        new HttpError('No Alexa device found to route text command through'),
      );
    }
    this.log.info(
      `Sending text command via device ${firstSerial}: "${text}"`,
    )();
    return pipe(
      TE.tryCatch(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          AlexaApiWrapper.toPromise<any>((cb) =>
            this.alexaRemote.sendSequenceCommand(
              firstSerial,
              'textCommand',
              text,
              cb,
            ),
          ),
        (reason) =>
          new HttpError(
            `Error sending text command. Reason: ${(reason as Error).message}`,
          ),
      ),
      TE.tap((result) => {
        this.log.info(`Text command result: ${JSON.stringify(result)}`)();
        return TE.of(result);
      }),
      TE.map(constVoid),
    );
  }

  private changeDeviceState(
    entityId: string,
    parameters: Record<string, string>,
    entityType: EntityType = 'APPLIANCE',
  ): Promise<SetDeviceStateResponse> {
    return AlexaApiWrapper.toPromise<SetDeviceStateResponse>(
      this.alexaRemote.executeSmarthomeDeviceAction.bind(
        this.alexaRemote,
        [entityId],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parameters as any,
        entityType,
      ),
    );
  }

  private static async toPromise<T>(
    fn: (cb: CallbackWithErrorAndBody) => void,
  ): Promise<T> {
    return new Promise((resolve, reject) =>
      fn((error, body) =>
        pipe(
          !!error,
          fpMatch(
            () => resolve(body as T),
            () => reject(error),
          ),
        ),
      ),
    );
  }

  private queryDeviceStates(
    entityIds: string[],
    entityType: string,
  ): TE.TaskEither<HttpError, GetDeviceStatesResponse> {
    return TE.tryCatch(
      () =>
        AlexaApiWrapper.toPromise<GetDeviceStatesResponse>(
          this.alexaRemote.querySmarthomeDevices.bind(
            this.alexaRemote,
            entityIds,
            entityType as EntityType,
          ),
        ),
      (reason) =>
        new HttpError(
          `Error getting smart home device state. Reason: ${
            (reason as Error).message
          }`,
        ),
    );
  }

  private doesCacheContainAllIds = (cachedIds: string[], queryIds: string[]) =>
    queryIds.every((id) => {
      return cachedIds.includes(id);
    });
}
