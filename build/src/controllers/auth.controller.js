"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.authController = void 0;
const error_interface_1 = require("../interfaces/error.interface");
const joi_validation_decorator_1 = require("../decorators/joi-validation.decorator");
const helpers_1 = require("../helpers");
const user_cache_1 = require("../redis/user.cache");
const signup_scheme_1 = require("../schemes/signup.scheme");
const auth_service_1 = require("../services/auth.service");
const cloudinary_1 = require("../utils/cloudinary");
const mongodb_1 = require("mongodb");
const lodash_1 = require("lodash");
const auth_queue_1 = require("../queues/auth.queue");
const user_queue_1 = require("../queues/user.queue");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../configs/config");
const signin_sheme_1 = require("../schemes/signin.sheme");
const user_service_1 = require("../services/user.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const ip_1 = __importDefault(require("ip"));
const moment_1 = __importDefault(require("moment"));
const reset_password_1 = require("../emails/templates/reset-password/reset-password");
const email_queue_1 = require("../queues/email.queue");
const password_scheme_1 = require("../schemes/password.scheme");
const forgot_password_1 = require("../emails/templates/forgot-password/forgot-password");
class AuthController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { avatarColor, email, password, username, avatarImage } = req.body;
            const isUserExist = yield auth_service_1.authService.checkUserExist(email, username);
            if (isUserExist) {
                throw new error_interface_1.BadRequestError('User already exist');
            }
            const authObjectId = new mongodb_1.ObjectId();
            const userObjectId = new mongodb_1.ObjectId();
            const uid = `${helpers_1.Helpers.generateRandomInteget(12)}`;
            const authData = {
                _id: authObjectId,
                uId: uid,
                email: helpers_1.Helpers.lowerCase(email),
                username: helpers_1.Helpers.firstLetterUppercase(username),
                password,
                avatarColor
            };
            const result = (yield (0, cloudinary_1.uploads)(avatarImage, `${userObjectId}`, true, true));
            if (!(result === null || result === void 0 ? void 0 : result.public_id)) {
                throw new error_interface_1.BadRequestError('Error uploading image');
            }
            // add redis cache
            let userDataCache = AuthController.prototype.userData(authData, userObjectId);
            userDataCache.profilePicture = result.secure_url; // result.secure_url is the url of the uploaded image
            yield user_cache_1.userCache.saveUserToCache(`${userObjectId}`, uid, userDataCache);
            //add to database
            (0, lodash_1.omit)(userDataCache, ['uId', 'username', 'email', 'password', 'avatarColor']); // remove sensitive data
            auth_queue_1.authQueue.addAuthJob('addAuthToDB', { value: userDataCache });
            user_queue_1.userQueue.addUserJob('addUserToDB', { value: userDataCache });
            const userJWT = AuthController.prototype.signupToken(authData, userObjectId);
            req.session = { jwt: userJWT };
            res.status(http_status_codes_1.default.CREATED).json({ message: 'User created successfully', user: authData });
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body; // username can be email or username
            const isUserExist = yield auth_service_1.authService.checkUserExist(username, username);
            if (!isUserExist) {
                throw new error_interface_1.BadRequestError('Invalid credentials');
            }
            const user = yield user_service_1.userService.getUserByAuthId(`${isUserExist._id}`);
            const isPasswordMatch = yield auth_service_1.authService.comparePassword(password, isUserExist.password);
            if (!isPasswordMatch) {
                throw new error_interface_1.BadRequestError('Password is incorrect');
            }
            const userJWT = AuthController.prototype.signupToken(isUserExist, new mongodb_1.ObjectId(user === null || user === void 0 ? void 0 : user._id));
            req.session = { jwt: userJWT };
            const userDocument = Object.assign(Object.assign({}, user), { authId: isUserExist._id, uId: isUserExist.uId, username: isUserExist.username, email: isUserExist.email, avatarColor: isUserExist.avatarColor, createdAt: isUserExist.createdAt });
            res.status(http_status_codes_1.default.OK).json({ message: 'User logged in successfully', user: userDocument, token: userJWT });
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            req.session = null;
            res.status(http_status_codes_1.default.OK).json({ message: 'User logged out successfully', user: {}, token: '' });
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const userExist = yield auth_service_1.authService.getAuthByEmail(email);
            if (!userExist) {
                throw new error_interface_1.NotFoundError('User not found');
            }
            const randomCharacter = yield helpers_1.Helpers.generateRandomString();
            yield auth_service_1.authService.updatePasswordResetToken(`${userExist._id}`, randomCharacter, Date.now() * 60 * 60 * 1000);
            const resetLink = `${config_1.config.CLIENT_URL}/reset-password?token=${randomCharacter}`;
            const template = forgot_password_1.forgotPasswordTemplate.forgotPasswordTemplate(userExist.username, resetLink);
            email_queue_1.emailQueue.addEmailJob('forgotPassword', { to: userExist.email, subject: 'Reset password', html: template, text: 'Reset your password' });
            res.status(http_status_codes_1.default.OK).json({ message: 'Reset link sent successfully' });
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { password, confirmPassword } = req.body;
            const { token } = req.params;
            if (password !== confirmPassword) {
                throw new error_interface_1.BadRequestError('Password does not match');
            }
            const userExist = yield auth_service_1.authService.getAuthByToken(`${token}`);
            if (!userExist) {
                throw new error_interface_1.NotFoundError('User not found');
            }
            userExist.password = password;
            userExist.passwordResetToken = undefined;
            userExist.passwordResetExpires = undefined;
            yield userExist.save();
            const templateParams = {
                date: (0, moment_1.default)().format('DD/MM/YYYY HH:mm'),
                email: userExist.email,
                username: userExist.username,
                ipaddress: ip_1.default.address()
            };
            const template = reset_password_1.resetPasswordTemplate.passwordResetTemplate(templateParams);
            email_queue_1.emailQueue.addEmailJob('forgotPassword', { to: userExist.email, subject: 'Password change', html: template, text: 'Confirm password' });
            res.status(http_status_codes_1.default.OK).json({ message: 'Password reset successfully' });
        });
    }
    currentUser(req, res) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cachedUser = yield user_cache_1.userCache.getUserFromaCache(`${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`);
            const userExist = (cachedUser === null || cachedUser === void 0 ? void 0 : cachedUser._id) ? cachedUser : yield user_service_1.userService.getUserById(`${(_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.userId}`);
            if (!userExist) {
                throw new error_interface_1.NotFoundError('User not found');
            }
            res.status(http_status_codes_1.default.OK).json({
                message: 'User fetched successfully',
                user: userExist,
                token: (_c = req.session) === null || _c === void 0 ? void 0 : _c.jwt
            });
        });
    }
    // service private methods
    userData(data, userObjectId) {
        const { _id, username, email, uId, password, avatarColor } = data;
        return {
            _id: userObjectId,
            authId: _id,
            uId,
            username: helpers_1.Helpers.firstLetterUppercase(username),
            email,
            password,
            avatarColor,
            profilePicture: '',
            blocked: [],
            blockedBy: [],
            work: '',
            location: '',
            school: '',
            quote: '',
            bgImageVersion: '',
            bgImageId: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            notifications: {
                messages: true,
                reactions: true,
                comments: true,
                follows: true
            },
            social: {
                facebook: '',
                instagram: '',
                twitter: '',
                youtube: ''
            }
        };
    }
    signupToken(data, userObjectId) {
        return jsonwebtoken_1.default.sign({
            userId: data._id,
            uId: data.uId,
            email: data.email,
            username: data.username,
            avatarColor: data.avatarColor,
            userObjectId: userObjectId
        }, `${config_1.config.JWT_SECRET}`, { expiresIn: config_1.config.JWT_EXPIRATION });
    }
}
__decorate([
    (0, joi_validation_decorator_1.JoiValidation)(signup_scheme_1.signupSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, joi_validation_decorator_1.JoiValidation)(signin_sheme_1.signinSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, joi_validation_decorator_1.JoiValidation)(password_scheme_1.emailSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, joi_validation_decorator_1.JoiValidation)(password_scheme_1.passwordSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map