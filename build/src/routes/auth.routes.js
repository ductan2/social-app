"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_1 = require("express");
class AuthRouter {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.post('/register', auth_controller_1.authController.register);
        this.router.post('/login', auth_controller_1.authController.login);
        this.router.get('/logout', auth_controller_1.authController.logout);
        this.router.post('/forgot-password', auth_controller_1.authController.forgotPassword);
        this.router.post("/reset-password/:token", auth_controller_1.authController.resetPassword);
        this.router.get('/me', auth_middleware_1.authMiddleware.verifyToken, auth_middleware_1.authMiddleware.checkAuthentication, auth_controller_1.authController.currentUser);
        return this.router;
    }
}
exports.authRouter = new AuthRouter();
//# sourceMappingURL=auth.routes.js.map