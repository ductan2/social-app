"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    authId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Auth', index: true },
    profilePicture: { type: String, default: '' },
    postsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number },
    blocked: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    notifications: {
        messages: { type: Boolean, default: true },
        reactions: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        follows: { type: Boolean, default: true }
    },
    social: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' },
        youtube: { type: String, default: '' }
    },
    work: { type: String, default: '' },
    school: { type: String, default: '' },
    location: { type: String, default: '' },
    quote: { type: String, default: '' },
    bgImageVersion: { type: String, default: '' },
    bgImageId: { type: String, default: '' }
});
const UserModel = (0, mongoose_1.model)('User', userSchema, 'User');
exports.UserModel = UserModel;
//# sourceMappingURL=user.mode.js.map