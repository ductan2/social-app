"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.UnauthorizedError = exports.InternalServerError = exports.NotFoundError = exports.BadRequestError = exports.ErrorCustom = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
class ErrorCustom extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, ErrorCustom.prototype); // to fix the issue with the instanceof operator
    }
    serializedErrors() {
        return {
            message: this.message,
            status: this.status,
            statusCode: this.statusCode
        };
    }
}
exports.ErrorCustom = ErrorCustom;
class BadRequestError extends ErrorCustom {
    constructor(message) {
        super(message);
        this.message = message;
        this.statusCode = http_status_codes_1.default.BAD_REQUEST;
        this.status = "Bad Request";
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends ErrorCustom {
    constructor(message) {
        super(message);
        this.message = message;
        this.statusCode = http_status_codes_1.default.NOT_FOUND;
        this.status = "Not Found";
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends ErrorCustom {
    constructor(message) {
        super(message);
        this.message = message;
        this.statusCode = http_status_codes_1.default.INTERNAL_SERVER_ERROR;
        this.status = "Internal Server Error";
    }
}
exports.InternalServerError = InternalServerError;
class UnauthorizedError extends ErrorCustom {
    constructor(message) {
        super(message);
        this.message = message;
        this.statusCode = http_status_codes_1.default.UNAUTHORIZED;
        this.status = "Unauthorized";
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ErrorCustom {
    constructor(message) {
        super(message);
        this.message = message;
        this.statusCode = http_status_codes_1.default.FORBIDDEN;
        this.status = "Forbidden";
    }
}
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=error.interface.js.map