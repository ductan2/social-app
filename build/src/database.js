"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const config_1 = require("./configs/config");
const mongoose_1 = __importDefault(require("mongoose"));
const redis_connection_1 = require("./redis/redis.connection");
const logger = config_1.config.createLogger('Database');
class Database {
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            mongoose_1.default.connection.on('error', (err) => {
                logger.error("Error database is ==> ", err);
                process.exit(1);
            });
            if (process.env.NODE_ENV !== "production") {
                mongoose_1.default.set('debug', true);
            }
            try {
                yield mongoose_1.default.connect(`${config_1.config.DATABASE_URL}`, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                });
                redis_connection_1.redisConnection.connection();
                logger.info("Connected to the database successfully");
            }
            catch (error) {
                logger.error("Error connecting to the database:", error);
                process.exit(1);
            }
        });
    }
}
exports.database = new Database();
//# sourceMappingURL=database.js.map