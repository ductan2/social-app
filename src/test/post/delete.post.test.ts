import { Request, Response } from 'express';
import { Server } from 'socket.io';
import * as postServer from '@root/sockets/post';


import { postCache } from '@root/redis/post.cache';
import { postQueue } from '@root/queues/post.queue';
import { postController } from '@controllers/post.controller';
import { newPost, postMockRequest, postMockResponse } from '../mock/post.mock';
import { authUserPayload } from '../mock/auth.mock';


jest.useFakeTimers();
jest.mock('@queues/base.queue');
jest.mock('@root/redis/post.cache');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
});

describe('Delete', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
    const res: Response = postMockResponse();
    jest.spyOn(postServer.socketIOPostObject, 'emit');
    jest.spyOn(postCache, 'deletePostFromCache');
    jest.spyOn(postQueue, 'addQueueJob');

    await postController.deletePosts(req, res);
    expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('delete post', req.params.postId);
    expect(postCache.deletePostFromCache).toHaveBeenCalledWith(req.params.postId, `${req.currentUser?.userId}`);
    expect(postQueue.addQueueJob).toHaveBeenCalledWith('deletePostQueueJob', { postId: req.params.postId, userId: req.currentUser?.userId });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post deleted successfully'
    });
  });
});
