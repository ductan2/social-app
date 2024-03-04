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
const auth_controller_1 = require("../../controllers/auth.controller");
const auth_service_1 = require("../../services/auth.service");
const helpers_1 = require("../../helpers");
const user_service_1 = require("../../services/user.service");
const user_mock_1 = require("../mock/user.mock");
const auth_mock_1 = require("../mock/auth.mock");
const USERNAME = 'Nguye123n';
const PASSWORD = 'admin1234';
const WRONG_USERNAME = 'ma';
const WRONG_PASSWORD = 'ma';
const LONG_PASSWORD = 'mathematics1mathematics1mathematics1mathematics1mathematics1mathematics1mathematics1mathematics1mathematics1mathematics1mathematics1';
const LONG_USERNAME = 'mathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematicsmathematics';
jest.useFakeTimers();
jest.mock('@queues/base.queue');
describe('SignIn', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if username is not available', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: '', password: PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.login(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Username is a required field');
        });
    });
    it('should throw an error if username length is less than minimum length', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: WRONG_USERNAME, password: WRONG_PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.login(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Invalid username');
        });
    });
    it('should throw an error if username length is greater than maximum length', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: LONG_USERNAME, password: WRONG_PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.login(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Invalid username');
        });
    });
    it('should throw an error if password is not available', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: '' });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.login(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Password is a required field');
        });
    });
    it('should throw an error if password length is less than minimum length', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: WRONG_PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.login(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Password is too short');
        });
    });
    it('should throw an error if password length is greater than maximum length', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: LONG_PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_controller_1.authController.login(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Password is too long');
        });
    });
    it('should throw "Invalid credentials" if username does not exist', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        jest.spyOn(auth_service_1.authService, 'checkUser').mockResolvedValueOnce(null);
        auth_controller_1.authController.login(req, res).catch((error) => {
            expect(auth_service_1.authService.checkUser).toHaveBeenCalledWith(helpers_1.Helpers.firstLetterUppercase(req.body.username) && helpers_1.Helpers.lowerCase(req.body.username));
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Invalid credentials');
        });
    });
    it('should throw "Invalid credentials" if password does not exist', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        jest.spyOn(auth_service_1.authService, 'checkUser').mockResolvedValueOnce(null);
        auth_controller_1.authController.login(req, res).catch((error) => {
            expect(auth_service_1.authService.checkUser).toHaveBeenCalledWith(helpers_1.Helpers.firstLetterUppercase(req.body.username) && helpers_1.Helpers.lowerCase(req.body.username));
            expect(error.statusCode).toEqual(400);
            expect(error.serializedErrors().message).toEqual('Invalid credentials');
        });
    });
    it('should set session data for valid credentials and send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_mock_1.authMock.comparePassword = () => Promise.resolve(true);
        jest.spyOn(auth_service_1.authService, 'checkUserExist').mockResolvedValue(auth_mock_1.authMock);
        jest.spyOn(user_service_1.userService, 'getUserByAuthId').mockResolvedValue(user_mock_1.mergedAuthAndUserData);
        jest.spyOn(auth_service_1.authService, 'comparePassword').mockResolvedValue(true); // jest.spyon is used to mock the comparePassword method
        yield auth_controller_1.authController.login(req, res);
        expect((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt).toBeDefined();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User logged in successfully',
            user: user_mock_1.mergedAuthAndUserData,
            token: (_b = req.session) === null || _b === void 0 ? void 0 : _b.jwt
        });
    }), 10000);
});
//# sourceMappingURL=signin.test.js.map