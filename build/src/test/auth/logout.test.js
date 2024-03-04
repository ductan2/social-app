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
const auth_mock_1 = require("../mock/auth.mock");
const auth_controller_1 = require("../../controllers/auth.controller");
const USERNAME = 'Manny';
const PASSWORD = 'manny1';
describe('SignOut', () => {
    it('should set session to null', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        yield auth_controller_1.authController.logout(req, res);
        expect(req.session).toBeNull();
    }));
    it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        yield auth_controller_1.authController.logout(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: '"User logged out successfully',
            user: {},
            token: ''
        });
    }));
});
//# sourceMappingURL=logout.test.js.map