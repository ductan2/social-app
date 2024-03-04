"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialApp = void 0;
const express_1 = __importDefault(require("express"));
const server_1 = require("./server");
const database_1 = require("./database");
const config_1 = require("./configs/config");
class SocialApp {
    initialize() {
        config_1.config.cloudinaryConfig();
        database_1.database.connect();
        config_1.config.validateConfig();
        const app = (0, express_1.default)();
        const server = new server_1.SocialServer(app);
        server.start();
    }
}
exports.socialApp = new SocialApp();
exports.socialApp.initialize();
//# sourceMappingURL=app.js.map