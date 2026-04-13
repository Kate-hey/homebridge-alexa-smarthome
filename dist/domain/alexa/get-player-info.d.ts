import { Either } from 'fp-ts/Either';
import { Nullable } from '../index';
import { AlexaApiError } from './errors';
export declare const validateGetPlayerInfoSuccessful: (res: GetPlayerInfoResponse) => Either<AlexaApiError, PlayerInfo>;
export interface PlayerInfo {
    infoText?: Nullable<{
        subText1?: Nullable<string>;
        subText2?: Nullable<string>;
        title?: Nullable<string>;
    }>;
    progress?: Nullable<{
        allowScrubbing?: Nullable<boolean>;
        mediaLength?: Nullable<number>;
        mediaProgress?: Nullable<number>;
    }>;
    provider?: Nullable<{
        providerDisplayName?: Nullable<string>;
        providerName?: Nullable<string>;
    }>;
    state?: Nullable<'PLAYING' | 'PAUSED'>;
    transport?: {
        next?: Nullable<'ENABLED' | 'DISABLED'>;
        playPause?: Nullable<'ENABLED' | 'DISABLED'>;
        previous?: Nullable<'ENABLED' | 'DISABLED'>;
        repeat?: Nullable<'SELECTED' | 'DISABLED'>;
        shuffle?: Nullable<'SELECTED' | 'DISABLED'>;
    };
    volume?: Nullable<{
        muted?: Nullable<boolean>;
        volume?: Nullable<number>;
    }>;
}
export default interface GetPlayerInfoResponse {
    playerInfo: Nullable<PlayerInfo>;
}
//# sourceMappingURL=get-player-info.d.ts.map