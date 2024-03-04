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
const auth_controller_1 = require("../../controllers/auth.controller");
const auth_service_1 = require("../../services/auth.service");
const user_cache_1 = require("../../redis/user.cache");
const cloudinaryUploads = __importStar(require("../../utils/cloudinary"));
const auth_mock_1 = require("../mock/auth.mock");
jest.useFakeTimers();
jest.mock('@queues/base.queue');
jest.mock('@root/redis/user.cache');
jest.mock('@queues/user.queue');
jest.mock('@queues/auth.queue');
jest.mock('@root/utils/cloudinary');
describe('SignUp', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if username length is less than minimum length', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: 'ma',
            email: 'manny@test.com',
            password: 'qwerty',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
        });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.register(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Invalid username');
        });
    });
    it('should throw an error if username length is greater than maximum length', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: 'mathematics',
            email: 'manny@test.com',
            password: 'qwerty',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
        });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.register(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Invalid username');
        });
    });
    it('should throw an error if email is not valid', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: 'Manny',
            email: 'not valid',
            password: 'qwerty',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
        });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.register(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Email must be valid');
        });
    });
    it('should throw an error if email is not available', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: 'Manny', email: '', password: 'qwerty', avatarColor: 'red', avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.register(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Email is a required field');
        });
    });
    it('should throw an error if password is not available', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: 'Manny',
            email: 'manny@test.com',
            password: '',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
        });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.register(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Password is a required field');
        });
    });
    it('should throw an error if password length is less than minimum length', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: 'Manny',
            email: 'manny@test.com',
            password: 'ma',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
        });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.register(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Password is too short');
        });
    });
    it('should throw an error if password length is greater than maximum length', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: 'Manny',
            email: 'manny@test.com',
            password: 'mathematics1',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
        });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.register(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Password is too long');
        });
    });
    it('should throw unauthorize error is user already exist', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: 'Manny',
            email: 'manny@test.com',
            password: 'qwerty',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
        });
        const res = (0, auth_mock_1.authMockResponse)();
        jest.spyOn(auth_service_1.authService, 'checkUser').mockResolvedValue(auth_mock_1.authMock);
        auth_controller_1.authController.register(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Invalid credentials');
        });
    });
    it('should throw an error if username is not available', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: '',
            email: 'manny@test.com',
            password: 'qwerty',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
        });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.register(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Username is a required field');
        });
    });
    it('should set session data for valid credentials and send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: 'nguye12123n',
            email: 'manny@test.com',
            password: 'qwerty',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
        });
        const res = (0, auth_mock_1.authMockResponse)();
        jest.spyOn(auth_service_1.authService, 'checkUserExist').mockResolvedValue(null);
        const userSpy = jest.spyOn(user_cache_1.UserCache.prototype, 'saveUserToCache');
        console.log("🚀 ~ it ~ userSpy:", userSpy);
        jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation(() => Promise.resolve({ version: '1234737373', public_id: '123456' }));
        yield auth_controller_1.authController.register(req, res);
        expect((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt).toBeDefined();
        expect(res.json).toHaveBeenCalledWith({
            message: 'User created successfully',
            user: userSpy.mock.calls[0][2],
            token: (_b = req.session) === null || _b === void 0 ? void 0 : _b.jwt
        });
    }));
});
//# sourceMappingURL=signup.test.js.map