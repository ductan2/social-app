"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordSchema = exports.emailSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const emailSchema = joi_1.default.object().keys({
    email: joi_1.default.string().email().required().messages({
        'string.base': 'Field must be valid',
        'string.required': 'Field must be valid',
        'string.email': 'Field must be valid'
    })
});
exports.emailSchema = emailSchema;
const passwordSchema = joi_1.default.object().keys({
    password: joi_1.default.string().required().min(6).max(20).messages({
        'string.base': 'Password should be of type string',
        'string.min': 'Invalid password',
        'string.max': 'Invalid password',
        'string.empty': 'Password is a required field'
    }),
    confirmPassword: joi_1.default.string().required().valid(joi_1.default.ref('password')).messages({
        'any.only': 'Passwords should match',
        'any.required': 'Confirm password is a required field'
    })
});
exports.passwordSchema = passwordSchema;
//# sourceMappingURL=password.scheme.js.map