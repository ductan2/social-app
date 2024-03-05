import { ICommentDocument, ICommentJob, ICommentNameList } from "@interfaces/comment.interface";
import { commentQueue } from "@root/queues/comment.queue";
import { commentCache } from "@root/redis/comment.cache";
import { Request, Response } from "express";
import { ObjectId } from 'mongodb';
import HTTP_STATUS from "http-status-codes";
import { commentService } from "@services/comment.service";
import mongoose from "mongoose";
class CommentController {
   public async createComment(req: Request, res: Response) {
      const { userTo, postId, profilePicture, comment } = req.body;
      const commentObjectId: ObjectId = new ObjectId();
      const commentData: ICommentDocument = {
         _id: commentObjectId,
         postId,
         username: `${req.currentUser?.username}`,
         avatarColor: `${req.currentUser?.avatarColor}`,
         profilePicture,
         comment,
         createdAt: new Date(),
      } as ICommentDocument;
      await commentCache.saveCommentToCache(postId, JSON.stringify(commentData));

      const databaseCommentData: ICommentJob = {
         postId,
         userTo,
         userFrom: req.currentUser!.userId,
         username: req.currentUser!.username,
         comment: commentData
      };
      commentQueue.addCommentJob('addCommentToDB', databaseCommentData);
      res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' });
   }
   public async getComments(req: Request, res: Response): Promise<void> {
      const { postId } = req.params;
      const [listCommentsCache, lengthCommentsCache] = await commentCache.getCommentsFromCache(postId);
      const comments: ICommentDocument[] = listCommentsCache.length
         ? listCommentsCache
         : await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

      res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments: comments, length: lengthCommentsCache });
   }

   public async getCommentsNames(req: Request, res: Response): Promise<void> {
      const { postId } = req.params;
      const cachedCommentsNames: ICommentNameList[] = await commentCache.getCommentsUsernameFromCache(postId);
      const commentsNames: ICommentNameList[] = cachedCommentsNames.length
         ? cachedCommentsNames
         : await commentService.getUserPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

      res.status(HTTP_STATUS.OK).json({ message: 'Post comments names', comments: commentsNames.length ? commentsNames[0] : [] });
   }

   public async getSingleComment(req: Request, res: Response): Promise<void> {
      const { postId, commentId } = req.params;
      const cachedComments: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);
      const comments: ICommentDocument[] = cachedComments.length
         ? cachedComments
         : await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

      res.status(HTTP_STATUS.OK).json({ message: 'Single comment', comments: comments.length ? comments[0] : [] });
   }
}
export const commentController = new CommentController()