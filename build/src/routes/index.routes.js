"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerMain = void 0;
const express_1 = require("express");
const auth_routes_1 = require("./auth.routes");
const base_queue_1 = require("../queues/base.queue");
const post_routes_1 = require("./post.routes");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const BASE_URL = '/api/v1';
class RouterMain {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.use('/queues', base_queue_1.serverAdapter.getRouter());
        this.router.use(`${BASE_URL}/auth`, auth_routes_1.authRouter.routes());
        this.router.use(`${BASE_URL}/posts`, auth_middleware_1.authMiddleware.verifyToken, post_routes_1.postRouter.routes());
        return this.router;
    }
}
exports.routerMain = new RouterMain();
//# sourceMappingURL=index.routes.js.map