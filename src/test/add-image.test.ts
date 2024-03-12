/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import * as imageServer from '@root/sockets/image';
import * as cloudinaryUploads from '@utils/cloudinary';
import { imageQueue } from '@root/queues/image.queue';
import { UserCache } from '@root/redis/user.cache';
import { authUserPayload } from './mock/auth.mock';
import { imagesMockRequest, imagesMockResponse } from './mock/image.mock';
import { existingUser } from './mock/user.mock';
import { imageController } from '@controllers/image.controller';
import { ErrorCustom } from '@interfaces/error.interface';

jest.useFakeTimers();
jest.mock('@queues/base.queue');
jest.mock('@root/redis/user.cache');
jest.mock('@root/sockets/user');
jest.mock('@utils/cloudinary');

Object.defineProperties(imageServer, {
  socketIOImageObject: {
    value: new Server(),
    writable: true
  }
});

describe('Add', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('profileImage', () => {
    it('should call image upload method', async () => {
      const req: Request = imagesMockRequest({}, { image: 'testing' }, authUserPayload) as Request;
      const res: Response = imagesMockResponse();
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

      await imageController.addProfileImage(req, res);
      expect(cloudinaryUploads.uploads).toHaveBeenCalledWith(req.body.image, req.currentUser?.userId, true, true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image uploaded successfully',
        imageUrl: 'https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456'
      });
    });

    it('should call updateSingleUserItemInCache method', async () => {
      const req: Request = imagesMockRequest({}, { image: 'testing' }, authUserPayload) as Request;
      const res: Response = imagesMockResponse();
      jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache').mockResolvedValue(existingUser);
      jest.spyOn(imageServer.socketIOImageObject, 'emit');
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

      const url = 'https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456';

      await imageController.addProfileImage(req, res);
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'profilePicture', url);
      expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('update user', existingUser);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image uploaded successfully',
        imageUrl: url
      });
    });

    it('should call addImageJob method', async () => {
      const req: Request = imagesMockRequest({}, { image: 'testing' }, authUserPayload) as Request;
      const res: Response = imagesMockResponse();
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));
      jest.spyOn(imageQueue, 'addImageJob');

      await imageController.addProfileImage(req, res);
      expect(imageQueue.addImageJob).toHaveBeenCalledWith('addUserProfileImageToDB', {
        key: `${req.currentUser?.userId}`,
        value: 'https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456',
        imgId: '123456',
        imgVersion: '1234'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image uploaded successfully',
        imageUrl: 'https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456'
      });
    });
  });

  describe('backgroundImage', () => {
    it('should upload new image', async () => {
      const req: Request = imagesMockRequest({}, { image: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' }, authUserPayload) as Request;
      const res: Response = imagesMockResponse();
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '2467', public_id: '987654' }));

      await imageController.addBackgroundImage(req, res);
      expect(cloudinaryUploads.uploads).toHaveBeenCalledWith(req.body.image);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image uploaded successfully'
      });
    });

    it('should not upload existing image', async () => {
      const req: Request = imagesMockRequest(
        {},
        { image: 'https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456' },
        authUserPayload
      ) as Request;
      const res: Response = imagesMockResponse();
      jest.spyOn(cloudinaryUploads, 'uploads');

      await imageController.addBackgroundImage(req, res);
      expect(cloudinaryUploads.uploads).not.toHaveBeenCalledWith(req.body.image);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image uploaded successfully',
        imageUrl: `https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456`
      });
    });

    it('should return bad request error', async () => {
      const req: Request = imagesMockRequest({}, { image: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' }, authUserPayload) as Request;
      const res: Response = imagesMockResponse();
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '', public_id: '', message: 'Error uploading image' }));

      imageController.addBackgroundImage(req, res).catch((error: ErrorCustom) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializedErrors().message).toEqual('Error uploading image');
      });
    });

    it('should call updateSingleUserItemInCache method', async () => {
      const req: Request = imagesMockRequest({}, { image: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' }, authUserPayload) as Request;
      const res: Response = imagesMockResponse();
      jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache').mockResolvedValue(existingUser);
      jest.spyOn(imageServer.socketIOImageObject, 'emit');
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

      await imageController.addBackgroundImage(req, res);
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser!.userId}`, 'bgImageId', '123456');
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser!.userId}`, 'bgImageVersion', '1234');
      expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('update user', {
        bgImageId: '123456',
        bgImageVersion: '1234',
        user: existingUser
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image uploaded successfully',
        imageUrl: `https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456`
      });
    });

    it('should call addImageJob method', async () => {
      const req: Request = imagesMockRequest({}, { image: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' }, authUserPayload) as Request;
      const res: Response = imagesMockResponse();
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));
      jest.spyOn(imageQueue, 'addImageJob');

      await imageController.addBackgroundImage(req, res);
      expect(imageQueue.addImageJob).toHaveBeenCalledWith('updateBGImageInDB', {
        key: `${req.currentUser?.userId}`,
        imgId: '123456',
        imgVersion: '1234'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image uploaded successfully',
        imageUrl: `https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456`
      });
    });
  });
});
