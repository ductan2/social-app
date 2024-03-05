import { IReactionDocument, IReactionJob } from "@interfaces/reaction.interface";
import { JoiValidation } from "@root/decorators/joi-validation.decorator";
import { addReactionSchema } from "@root/schemas/reaction.schema";
import { Request, Response } from "express";
import { ObjectId } from 'mongodb';
import HTTP_STATUS from "http-status-codes";
import { reactionQueue } from "@root/queues/reaction.queue";
import { reactionService } from "@services/reaction.service";
import { reactionCache } from "@root/redis/reaction.cache";
class ReactionController {

   @JoiValidation(addReactionSchema)
   public async createReaction(req: Request, res: Response) {
      const { userTo, postId, type, previousReaction, postReactions, profilePicture } = req.body;
      console.log("🚀 ~ ReactionController ~ createReaction ~ postId:", postId)
      const reactionObject: IReactionDocument = {
         _id: new ObjectId(),
         postId,
         type,
         avataColor: req.currentUser!.avatarColor,
         username: req.currentUser!.username,
         profilePicture
      } as IReactionDocument;
      await reactionCache.saveReactionToCache(postId, reactionObject, postReactions, type, previousReaction);
      const databaseReactionData: IReactionJob = {
         postId,
         userTo,
         userFrom: req.currentUser!.userId,
         username: req.currentUser!.username,
         type,
         previousReaction,
         reactionObject
      } as IReactionJob;
      reactionQueue.addReactionJob('addReactionToDB', databaseReactionData);
      res.status(HTTP_STATUS.CREATED).json({ message: 'Reaction added successfully' });
   }
   public async removeReaction(req: Request, res: Response) {
      const { postId, previousReaction, postReactions } = req.params;
      await reactionCache.removeReactionFromCache(postId, `${req.currentUser!.username}`, JSON.parse(postReactions));
      const databaseReactionData: IReactionJob = {
         postId,
         username: req.currentUser!.username,
         previousReaction
      };
      reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData);
      res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post' });
   }
   public async getReaction(req: Request, res: Response) {
      const { postId } = req.params;
      const cacheReaction: [IReactionDocument[], number] = await reactionCache.getReactionsFromCache(postId);
      const reactions = cacheReaction ? cacheReaction : await reactionService.getPostReactions({ postId }, { createdAt: -1 });
      res.status(HTTP_STATUS.OK).json({ message: 'Reactions retrieved successfully', reactions });
   }
   public async getReactionByUsername(req: Request, res: Response) {
      const { postId, username } = req.params;
      const cacheReaction = await reactionCache.getReactionByUsername(postId, username);
      const reaction = cacheReaction ? cacheReaction : await reactionService.getPostReactionByUsername(postId, username);
      res.status(HTTP_STATUS.OK).json({ message: 'Reaction retrieved successfully', reaction });
   }
   public async getSingleReactionsByUsername(req: Request, res: Response): Promise<void> {
      const { username } = req.params;
      const reactions: IReactionDocument[] = await reactionService.getReactionByUsername(username);
      res.status(HTTP_STATUS.OK).json({ message: 'All reactions by username', reactions });
   }
}
export const reactionController = new ReactionController();
