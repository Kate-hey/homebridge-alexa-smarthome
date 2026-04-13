"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IoError = exports.ValidationError = exports.JsonFormatError = exports.PluginError = void 0;
class PluginError extends Error {
    constructor(message, name, cause) {
        super(message);
        this.name = name;
        this.cause = cause;
        this.message = `${name}(${message})`;
    }
}
exports.PluginError = PluginError;
class JsonFormatError extends PluginError {
    constructor(message, cause) {
        super(message, JsonFormatError.name, cause);
    }
}
exports.JsonFormatError = JsonFormatError;
class ValidationError extends PluginError {
    constructor(message, cause) {
        super(message, ValidationError.name, cause);
    }
}
exports.ValidationError = ValidationError;
class IoError extends PluginError {
    constructor(message, cause) {
        super(message, IoError.name, cause);
    }
}
exports.IoError = IoError;
//# sourceMappingURL=errors.js.map