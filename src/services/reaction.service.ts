import { INotificationDocument, INotificationTemplate } from "@interfaces/notification.interface";
import { IPostDocument } from "@interfaces/post.interface";
import { IQueryReaction, IReactionDocument, IReactionJob } from "@interfaces/reaction.interface";
import { IUserDocument } from "@interfaces/user.interface";
import { NotificationModel } from "@models/notification.model";
import { PostModel } from "@models/post.model";
import { ReactionModel } from "@models/reaction.model";
import { notificationTemplate } from "@root/emails/templates/notification/notification-template";
import { Helpers } from "@root/helpers";
import { emailQueue } from "@root/queues/email.queue";
import { userCache } from "@root/redis/user.cache";
import { socketIONotificationObject } from "@root/sockets/notification";
import { omit } from "lodash";
import mongoose from "mongoose";

class ReactionService {
   public async addReactionFromDB(reactionData: IReactionJob) {
      const { postId, previousReaction, username, reactionObject, type, userTo, userFrom } = reactionData;
      let updateReactionObject = reactionObject;
      if (previousReaction) {
         updateReactionObject = omit(reactionObject, ['_id'])
      }
      const updatedReaction: [IUserDocument, IReactionDocument, IPostDocument] = await Promise.all([
         userCache.getUserFromaCache(`${userTo}`) as unknown as IUserDocument,
         ReactionModel.replaceOne({ postId, type: previousReaction, username }, updateReactionObject, { upsert: true }) as unknown as IReactionDocument,
         PostModel.findOneAndUpdate({ _id: postId }, {
            $inc: {
               [`reactions.${previousReaction}`]: -1, // decrement the previous reaction if it exists
               [`reactions.${type}`]: 1 // increment the new reaction
            }
         }, { new: true }) as unknown as IPostDocument
      ])
      if (updatedReaction[0].notifications.reactions && userTo !== userFrom) {
         const notificationModel: INotificationDocument = new NotificationModel();
         const notifications = await notificationModel.insertNotification({
            userFrom: userFrom as string,
            userTo: userTo as string,
            message: `${username} reacted to your post.`,
            notificationType: 'reactions',
            entityId: new mongoose.Types.ObjectId(postId),
            createdItemId: new mongoose.Types.ObjectId(updatedReaction[1]._id!),
            createdAt: new Date(),
            comment: '',
            post: updatedReaction[2].post,
            imgId: updatedReaction[2].imgId!,
            imgVersion: updatedReaction[2].imgVersion!,
            gifUrl: updatedReaction[2].gifUrl!,
            reaction: type!
         });
         socketIONotificationObject.emit('insert notification', notifications, { userTo });
         const templateParams: INotificationTemplate = {
            username: updatedReaction[0].username!,
            message: `${username} reacted to your post.`,
            header: 'Post Reaction Notification'
         };
         const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
         emailQueue.addEmailJob('reactionsEmail', {
            to: updatedReaction[0].email!,
            html: template,
            subject: 'Post reaction notification',
            text: `${username} reacted to your post.`
         });
      }
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
   public async getReactionByUsername(username: string) {
      // get all reactions of a user
      return ReactionModel.find({
         username: Helpers.firstLetterUppercase(username)
      }).lean()
   }
}
export const reactionService = new ReactionService();