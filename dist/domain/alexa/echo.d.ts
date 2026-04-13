import { AlexaSmartHomePlatform } from '../../platform';
import { HomebridgeAccessoryInfo } from '../homebridge';
import { Nullable } from '../index';
import { CapabilityState, SupportedNamespaces } from './index';
export declare const isMediaPlaybackValue: (state: EchoState['value']) => state is MediaPlayback;
export interface EchoState {
    namespace: keyof typeof EchoNamespaces & keyof typeof SupportedNamespaces;
    value: CapabilityState['value'];
}
export declare const EchoNamespaces: {
    readonly 'Alexa.PlaybackStateReporter': "Alexa.PlaybackStateReporter";
};
export type EchoNamespacesType = keyof typeof EchoNamespaces;
export interface MediaPlayer {
    playerId: Nullable<string>;
    state: string;
    supportedOperations: string[];
    shuffle: string;
    repeat: string;
    media: {
        trackName: string;
        [x: string]: unknown;
    };
    [x: string]: unknown;
}
export interface MediaPlayback extends MediaPlayer {
    players: MediaPlayer[];
}
export declare const toSupportedHomeKitAccessories: (platform: AlexaSmartHomePlatform, entityId: string, deviceName: string, capStates: CapabilityState[]) => HomebridgeAccessoryInfo[];
//# sourceMappingURL=echo.d.ts.map