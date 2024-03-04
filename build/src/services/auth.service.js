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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const helpers_1 = require("../helpers");
const auth_model_1 = require("../models/auth.model");
const bcryptjs_1 = require("bcryptjs");
class AuthService {
    createAuthUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return auth_model_1.AuthModel.create(data);
        });
    }
    checkUserExist(email, username) {
        return __awaiter(this, void 0, void 0, function* () {
            return auth_model_1.AuthModel
                .findOne({ $or: [{ email: helpers_1.Helpers.lowerCase(email) }, { username: helpers_1.Helpers.firstLetterUppercase(username) }] })
                .lean();
        });
    }
    checkUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return auth_model_1.AuthModel
                .findOne({ $or: [{ email: helpers_1.Helpers.lowerCase(username) }, { username: helpers_1.Helpers.firstLetterUppercase(username) }] })
                .lean();
        });
    }
    comparePassword(password, passwordHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, bcryptjs_1.compare)(password, passwordHash);
        });
    }
    getAuthByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return auth_model_1.AuthModel.findOne({ email: helpers_1.Helpers.lowerCase(email) }).lean();
        });
    }
    updatePasswordResetToken(id, token, exp) {
        return __awaiter(this, void 0, void 0, function* () {
            return auth_model_1.AuthModel.findByIdAndUpdate(id, { passwordResetToken: token, passwordResetExpires: exp });
        });
    }
    getAuthByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return auth_model_1.AuthModel.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() }
            });
        });
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map