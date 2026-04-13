export declare abstract class PluginError extends Error {
    readonly name: string;
    readonly cause?: unknown;
    constructor(message: string, name: string, cause?: unknown);
}
export declare class JsonFormatError extends PluginError {
    constructor(message: string, cause?: unknown);
}
export declare class ValidationError extends PluginError {
    constructor(message: string, cause?: unknown);
}
export declare class IoError extends PluginError {
    constructor(message: string, cause?: unknown);
}
//# sourceMappingURL=errors.d.ts.map