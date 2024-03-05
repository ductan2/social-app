import { Request, Response } from 'express';
import { existingUser } from '../mock/user.mock';
import { authUserPayload } from '../mock/auth.mock';
import { commentCache } from '@root/redis/comment.cache';
import { commentQueue } from '@root/queues/comment.queue';
import { commentController } from '@controllers/comment.controller';
import { reactionMockRequest, reactionMockResponse } from '../mock/reaction.mock';


jest.useFakeTimers();
jest.mock('@queues/base.queue');
jest.mock('@root/redis/comment.cache');

describe('Add', () => {
   beforeEach(() => {
      jest.restoreAllMocks();
   });

   afterEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
   });

   it('should call savePostCommentToCache and addCommentJob methods', async () => {
      const req: Request = reactionMockRequest(
         {},
         {
            postId: '6027f77087c9d9ccb1555268',
            comment: 'This is a comment',
            profilePicture: 'https://place-hold.it/500x500',
            userTo: `${existingUser._id}`
         },
         authUserPayload
      ) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(commentCache, 'saveCommentToCache');
      jest.spyOn(commentQueue, 'addCommentJob');

      await commentController.createComment(req, res);
      expect(commentCache.saveCommentToCache).toHaveBeenCalled();
      expect(commentQueue.addCommentJob).toHaveBeenCalled();
   });

   it('should send correct json response', async () => {
      const req: Request = reactionMockRequest(
         {},
         {
            postId: '6027f77087c9d9ccb1555268',
            comment: 'This is a comment',
            profilePicture: 'https://place-hold.it/500x500',
            userTo: `${existingUser._id}`
         },
         authUserPayload
      ) as Request;
      const res: Response = reactionMockResponse();

      await commentController.createComment(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
         message: 'Comment created successfully'
      });
   });
});
