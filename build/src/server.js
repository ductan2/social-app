"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialServer = void 0;
const express_1 = require("express");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const compression_1 = __importDefault(require("compression"));
const socket_io_1 = require("socket.io");
const redis_1 = require("redis");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const index_routes_1 = require("./routes/index.routes");
const config_1 = require("./configs/config");
const post_1 = require("./sockets/post");
const error_interface_1 = require("./interfaces/error.interface");
require("express-async-errors");
const logger = config_1.config.createLogger('Server');
class SocialServer {
    constructor(app) {
        this.PORT = config_1.config.PORT || 3000;
        this.socialApp = app;
    }
    start() {
        this.securityMiddleware(this.socialApp);
        this.standardMiddleware(this.socialApp);
        this.routeMiddleware(this.socialApp);
        this.globalErrorHandler(this.socialApp);
        this.startServer(this.socialApp);
    }
    securityMiddleware(app) {
        app.use((0, cookie_session_1.default)({
            name: 'session',
            keys: [`${config_1.config.SECRET_KEY_1}`, `${config_1.config.SECRET_KEY_2}`],
            maxAge: 24 * 60 * 60 * 1000,
            secure: false, // set to true if your using https
        }));
        app.use((0, cors_1.default)()); // enable cors
        app.use((0, hpp_1.default)()); // prevent http parameter pollution
        app.use((0, helmet_1.default)()); // set security headers
        app.use((0, cors_1.default)({
            origin: '*',
            credentials: true,
            optionsSuccessStatus: http_status_codes_1.default.OK // 200 for preflight
        }));
    }
    standardMiddleware(app) {
        app.use((0, compression_1.default)());
        app.use((0, express_1.json)({ limit: '50mb' }));
    }
    routeMiddleware(app) {
        app.use(index_routes_1.routerMain.routes());
    }
    globalErrorHandler(app) {
        app.all('*', (req, res) => {
            res.status(http_status_codes_1.default.NOT_FOUND).json({
                message: `Can't find ${req.originalUrl} on this server!`
            });
        });
        app.use((err, req, res, next) => {
            console.log("🚀 ~ SocialServer ~ app.use ~ err:", err);
            if (err instanceof error_interface_1.ErrorCustom) {
                res.status(err.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR).json(err.serializedErrors());
            }
            else {
                res.status(500).json(err);
            }
            next();
        });
    }
    createSockerIO(httpServer) {
        const io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: config_1.config.CLIENT_URL,
                methods: ["GET", "POST", 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            },
        });
        const pubClient = (0, redis_1.createClient)({ url: `${config_1.config.REDIS_HOST}` });
        const subClient = pubClient.duplicate();
        Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        });
        io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
        return io;
    }
    sockerIOConnection(io) {
        const postSocketIO = new post_1.SocketIOPostHandler(io);
        postSocketIO.listen();
    }
    startHttpServer(httpServer) {
        httpServer.listen(this.PORT, () => {
            logger.info(`Server is running on port ${this.PORT} with process ${process.pid}`);
        });
    }
    startServer(app) {
        const httpServer = new http_1.default.Server(app);
        const sockerIO = this.createSockerIO(httpServer);
        this.startHttpServer(httpServer);
        this.sockerIOConnection(sockerIO);
    }
}
exports.SocialServer = SocialServer;
//# sourceMappingURL=server.js.map