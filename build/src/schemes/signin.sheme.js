"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.signinSchema = joi_1.default.object().keys({
    username: joi_1.default.string().required().min(4).max(50).messages({
        'string.base': 'Username must be of type string',
        'string.min': 'Invalid username',
        'string.max': 'Invalid username',
        'string.empty': 'Username is a required field'
    }),
    password: joi_1.default.string().required().min(6).max(20).messages({
        'string.base': 'Password must be of type string',
        'string.min': 'Password is too short',
        'string.max': 'Password is too long',
        'string.empty': 'Password is a required field'
    }),
});
//# sourceMappingURL=signin.sheme.js.map