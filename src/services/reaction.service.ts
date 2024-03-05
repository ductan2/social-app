import { IQueryReaction, IReactionJob } from "@interfaces/reaction.interface";
import { PostModel } from "@models/post.model";
import { ReactionModel } from "@models/reaction.model";
import { Helpers } from "@root/helpers";
import { userCache } from "@root/redis/user.cache";
import { omit } from "lodash";
import mongoose from "mongoose";

class ReactionService {
   public async addReactionFromDB(reactionData: IReactionJob) {
      const { postId, previousReaction, username, reactionObject, type, userTo } = reactionData;
      let updateReactionObject = reactionObject;
      if (previousReaction) {
         updateReactionObject = omit(reactionObject, ['_id'])
      }
      const updateReaction = await Promise.all([
         userCache.getUserFromaCache(`${userTo}`),
         ReactionModel.replaceOne({ postId, type: previousReaction, username }, updateReactionObject, { upsert: true }),
         PostModel.findOneAndUpdate({ _id: postId }, {
            $inc: {
               [`reactions.${previousReaction}`]: -1, // decrement the previous reaction if it exists
               [`reactions.${type}`]: 1 // increment the new reaction
            }
         }, { new: true })
      ])

   }

   public async removeReactionFromDB(reactionData: IReactionJob) {
      const { postId, previousReaction, username, reactionObject, type, userFrom, userTo } = reactionData;
      await Promise.all([
         ReactionModel.deleteOne({ postId, username, type: previousReaction }),
         PostModel.findOneAndUpdate({ _id: postId }, {
            $inc: {
               [`reactions.${previousReaction}`]: -1
            }
         }, { new: true })
      ])
   }
   public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>) {
      return ReactionModel.aggregate([
         {
            $match: query
         },
         {
            $sort: sort
         }
      ])
   }
   public async getPostReactionByUsername(postId: string, username: string) {
      // get the reaction of a user to a post
      return ReactionModel.findOne({
         postId: new mongoose.Types.ObjectId(postId),
         username: Helpers.firstLetterUppercase(username)
      }).lean()
   }
   public async getReactionByUsername( username: string) {
      // get all reactions of a user
      return ReactionModel.find({
         username: Helpers.firstLetterUppercase(username)
      }).lean()
   }
}
export const reactionService = new ReactionService();