/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

import { authController } from '@controllers/auth.controller';
import { ErrorCustom } from '@interfaces/error.interface';
import { authService } from '@services/auth.service';
import { Helpers } from '@root/helpers';
import { userService } from '@services/user.service';
import { mergedAuthAndUserData } from '../mock/user.mock';
import { authMock, authMockRequest, authMockResponse } from '../mock/auth.mock';



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
      const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request;
      const res: Response = authMockResponse();
      authController.login(req, res).catch((error: ErrorCustom) => {
         expect(error.statusCode).toEqual(400);
         expect(error.serializedErrors().message).toEqual('Username is a required field');
      });
   });

   it('should throw an error if username length is less than minimum length', () => {
      const req: Request = authMockRequest({}, { username: WRONG_USERNAME, password: WRONG_PASSWORD }) as Request;
      const res: Response = authMockResponse();
      authController.login(req, res).catch((error: ErrorCustom) => {
         expect(error.statusCode).toEqual(400);
         expect(error.serializedErrors().message).toEqual('Invalid username');
      });
   });

   it('should throw an error if username length is greater than maximum length', () => {
      const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: WRONG_PASSWORD }) as Request;
      const res: Response = authMockResponse();
      authController.login(req, res).catch((error: ErrorCustom) => {
         expect(error.statusCode).toEqual(400);
         expect(error.serializedErrors().message).toEqual('Invalid username');
      });
   });

   it('should throw an error if password is not available', () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request;
      const res: Response = authMockResponse();
      authController.login(req, res).catch((error: ErrorCustom) => {
         expect(error.statusCode).toEqual(400);
         expect(error.serializedErrors().message).toEqual('Password is a required field');
      });
   });

   it('should throw an error if password length is less than minimum length', () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: WRONG_PASSWORD }) as Request;
      const res: Response = authMockResponse();
      authController.login(req, res).catch((error: ErrorCustom) => {
         expect(error.statusCode).toEqual(400);
         expect(error.serializedErrors().message).toEqual('Password is too short');
      });
   });

   it('should throw an error if password length is greater than maximum length', () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request;
      const res: Response = authMockResponse();
      authController.login(req, res).catch((error: ErrorCustom) => {
         expect(error.statusCode).toEqual(400);
         expect(error.serializedErrors().message).toEqual('Password is too long');
      });
   });

   it('should throw "Invalid credentials" if username does not exist', () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'checkUser').mockResolvedValueOnce(null as any);

      authController.login(req, res).catch((error: ErrorCustom) => {
         expect(authService.checkUser).toHaveBeenCalledWith(Helpers.firstLetterUppercase(req.body.username) && Helpers.lowerCase(req.body.username));
         expect(error.statusCode).toEqual(400);
         expect(error.serializedErrors().message).toEqual('Invalid credentials');
      });
   });

   it('should throw "Invalid credentials" if password does not exist', () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'checkUser').mockResolvedValueOnce(null as any);

      authController.login(req, res).catch((error: ErrorCustom) => {
         expect(authService.checkUser).toHaveBeenCalledWith(Helpers.firstLetterUppercase(req.body.username) && Helpers.lowerCase(req.body.username));
         expect(error.statusCode).toEqual(400);
         expect(error.serializedErrors().message).toEqual('Invalid credentials');
      });
   });

   it('should set session data for valid credentials and send correct json response', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
      const res: Response = authMockResponse();
      authMock.comparePassword = () => Promise.resolve(true);
      jest.spyOn(authService, 'checkUserExist').mockResolvedValue(authMock as any);
      jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(mergedAuthAndUserData as any);
      jest.spyOn(authService, 'comparePassword').mockResolvedValue(true); // jest.spyon is used to mock the comparePassword method
      await authController.login(req, res);
      expect(req.session?.jwt).toBeDefined();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
         message: 'User logged in successfully',
         user: mergedAuthAndUserData,
         token: req.session?.jwt
      });
   },10000);
});