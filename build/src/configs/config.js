"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const bunyan_1 = __importDefault(require("bunyan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Config {
    constructor() {
        this.DATABASE_URL = process.env.DATABASE_URL || '';
        this.PORT = process.env.PORT || '';
        this.NODE_ENV = process.env.NODE_ENV || '';
        this.SECRET_KEY_1 = process.env.SECRET_KEY_1 || '';
        this.SECRET_KEY_2 = process.env.SECRET_KEY_2 || '';
        this.CLIENT_URL = process.env.CLIENT_URL || '';
        this.REDIS_HOST = process.env.REDIS_HOST || '';
        this.CLOUD_NAME = process.env.CLOUD_NAME || '';
        this.API_KEY = process.env.API_KEY || '';
        this.API_SECRET = process.env.API_SECRET || '';
        this.JWT_SECRET = process.env.JWT_SECRET || '';
        this.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '';
        this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
        this.SENDER_PASSWORD = process.env.SENDER_PASSWORD || '';
        // this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
        // this.SENDGRID_SENDER = process.env.SENDGRID_SENDER || '';
    }
    validateConfig() {
        for (const [key, value] of Object.entries(this)) {
            if (value === '' || value === undefined) {
                throw new Error(`Missing environment variable: ${key} or is empty. Please check your .env file.`);
            }
        }
    }
    cloudinaryConfig() {
        cloudinary_1.default.v2.config({
            cloud_name: this.CLOUD_NAME,
            api_key: this.API_KEY,
            api_secret: this.API_SECRET
        });
    }
    createLogger(name) {
        return bunyan_1.default.createLogger({ name, level: 'debug' });
    }
}
exports.config = new Config();
//# sourceMappingURL=config.js.map