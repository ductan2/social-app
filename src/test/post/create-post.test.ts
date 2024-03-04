/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';

import * as postServer from '@root/sockets/post';
import { newPost, postMockRequest, postMockResponse } from '../mock/post.mock';
import { authUserPayload } from '../mock/auth.mock';
import { postCache } from '@root/redis/post.cache';
import { postQueue } from '@root/queues/post.queue';
import { postController } from '@controllers/post.controller';
import { ErrorCustom } from '@interfaces/error.interface';
import * as cloudinaryUploads from '@utils/cloudinary';

jest.useFakeTimers();
jest.mock('@queues/base.queue');
jest.mock('@root/redis/post.cache');
jest.mock('@root/utils/cloudinary');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
});

describe('Create', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('post', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      const spy = jest.spyOn(postCache, 'savePostToCache');
      console.log("🚀 ~ it ~ spy:", spy)
      jest.spyOn(postQueue, 'addQueueJob');

      await postController.createPost(req, res);
      const createdPost = spy.mock.calls[0][0].createdPost;
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
      expect(postCache.savePostToCache).toHaveBeenCalledWith({
        key: spy.mock.calls[0][0].key,
        currentUserId: `${req.currentUser?.userId}`,
        uId: `${req.currentUser?.uId}`,
        createdPost
      });
      expect(postQueue.addQueueJob).toHaveBeenCalledWith('addPostQueueJob', { userId: req.currentUser?.userId, value: createdPost });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post created successfully',
         post: createdPost
      });
    });
  });

  describe('postWithImage', () => {
    it('should throw an error if image is not available', () => {
      delete newPost.image;
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();

      postController.createPostWithImage(req, res).catch((error: ErrorCustom) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializedErrors().message).toEqual('Image is a required field');
      });
    });

    it('should throw an upload error', () => {
      newPost.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '', public_id: '', message: 'Upload error' }));

      postController.createPostWithImage(req, res).catch((error: ErrorCustom) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializedErrors().message).toEqual('Error uploading image');
      });
    });

    it('should send correct json response', async () => {
      newPost.image = 'testing image';
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      const spy = jest.spyOn(postCache, 'savePostToCache');
      jest.spyOn(postQueue, 'addQueueJob');
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

      await postController.createPostWithImage(req, res);
      const createdPost = spy.mock.calls[0][0].createdPost;
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
      expect(postCache.savePostToCache).toHaveBeenCalledWith({
        key: spy.mock.calls[0][0].key,
        currentUserId: `${req.currentUser?.userId}`,
        uId: `${req.currentUser?.uId}`,
        createdPost
      });
      expect(postQueue.addQueueJob).toHaveBeenCalledWith('addPostQueueJob', { userId: req.currentUser?.userId, value: createdPost });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post created with image successfully',
         post: createdPost
      });
    });
  });
});
