"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postWithImageSchema = exports.postSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const postSchema = joi_1.default.object().keys({
    post: joi_1.default.string().optional().allow(null, ''),
    bgColor: joi_1.default.string().optional().allow(null, ''),
    privacy: joi_1.default.string().optional().allow(null, ''),
    feelings: joi_1.default.string().optional().allow(null, ''),
    gifUrl: joi_1.default.string().optional().allow(null, ''),
    profilePicture: joi_1.default.string().optional().allow(null, ''),
    imgVersion: joi_1.default.string().optional().allow(null, ''),
    imgId: joi_1.default.string().optional().allow(null, ''),
    image: joi_1.default.string().optional().allow(null, '')
});
exports.postSchema = postSchema;
const postWithImageSchema = joi_1.default.object().keys({
    image: joi_1.default.string().required().messages({
        'any.required': 'Image is a required field',
        'string.empty': 'Image property is not allowed to be empty'
    }),
    post: joi_1.default.string().optional().allow(null, ''),
    bgColor: joi_1.default.string().optional().allow(null, ''),
    privacy: joi_1.default.string().optional().allow(null, ''),
    feelings: joi_1.default.string().optional().allow(null, ''),
    gifUrl: joi_1.default.string().optional().allow(null, ''),
    profilePicture: joi_1.default.string().optional().allow(null, ''),
    imgVersion: joi_1.default.string().optional().allow(null, ''),
    imgId: joi_1.default.string().optional().allow(null, '')
});
exports.postWithImageSchema = postWithImageSchema;
//# sourceMappingURL=post.scheme.js.map