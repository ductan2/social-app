"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.AuthMiddleware = void 0;
const config_1 = require("../configs/config");
const error_interface_1 = require("../interfaces/error.interface");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthMiddleware {
    verifyToken(req, res, next) {
        var _a;
        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt)) {
            throw new error_interface_1.NotFoundError('Token not found, Please login again!');
        }
        try {
            const payload = jsonwebtoken_1.default.verify(req.session.jwt, config_1.config.JWT_SECRET);
            req.currentUser = payload;
        }
        catch (error) {
            throw new error_interface_1.UnauthorizedError('Token is invalid or expired, Please login again!');
        }
        next();
    }
    checkAuthentication(req, res, next) {
        if (!req.currentUser) {
            throw new error_interface_1.UnauthorizedError('Not Authorized');
        }
        next();
    }
}
exports.AuthMiddleware = AuthMiddleware;
exports.authMiddleware = new AuthMiddleware();
//# sourceMappingURL=auth.middleware.js.map