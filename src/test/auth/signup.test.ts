/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

import { authController } from '@controllers/auth.controller';
import { ErrorCustom } from '@interfaces/error.interface';
import { authService } from '@services/auth.service';
import { UserCache } from '@root/redis/user.cache';
import * as cloudinaryUploads from '@root/utils/cloudinary';
import { authMock, authMockRequest, authMockResponse } from '../mock/auth.mock';
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
    const req: Request = authMockRequest(
      {},
      {
        username: 'ma',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    authController.register(req, res).catch((error: ErrorCustom) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializedErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'mathematics',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    authController.register(req, res).catch((error: ErrorCustom) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializedErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if email is not valid', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'not valid',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    authController.register(req, res).catch((error: ErrorCustom) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializedErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw an error if email is not available', () => {
    const req: Request = authMockRequest(
      {},
      { username: 'Manny', email: '', password: 'qwerty', avatarColor: 'red', avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' }
    ) as Request;
    const res: Response = authMockResponse();
    authController.register(req, res).catch((error: ErrorCustom) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializedErrors().message).toEqual('Email is a required field');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: '',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    authController.register(req, res).catch((error: ErrorCustom) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializedErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: 'ma',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    authController.register(req, res).catch((error: ErrorCustom) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializedErrors().message).toEqual('Password is too short');
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: 'mathematics1',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    authController.register(req, res).catch((error: ErrorCustom) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializedErrors().message).toEqual('Password is too long');
    });
  });

  it('should throw unauthorize error is user already exist', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'checkUser').mockResolvedValue(authMock as any);
    authController.register(req, res).catch((error: ErrorCustom) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializedErrors().message).toEqual('Invalid credentials');
    });
  });
  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    authController.register(req, res).catch((error: ErrorCustom) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializedErrors().message).toEqual('Username is a required field');
    });
  });

  

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'nguye12123n',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'checkUserExist').mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    console.log("🚀 ~ it ~ userSpy:", userSpy)
    jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234737373', public_id: '123456' }));
    
    await authController.register(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  }); 
});