import { ICommentDocument, ICommentJob, IQueryComment } from "@interfaces/comment.interface";
import { INotificationTemplate } from "@interfaces/notification.interface";
import { IPostDocument } from "@interfaces/post.interface";
import { CommentsModel } from "@models/comment.model";
import { NotificationModel } from "@models/notification.model";
import { PostModel } from "@models/post.model";
import { notificationTemplate } from "@root/emails/templates/notification/notification-template";
import { emailQueue } from "@root/queues/email.queue";
import { userCache } from "@root/redis/user.cache";
import { socketIONotificationObject } from "@root/sockets/notification";
import mongoose from "mongoose";

class CommentService {
   public async addCommentToDB(data: ICommentJob) {
      const { comment, postId, userTo, userFrom, username } = data;
      const [comments, post, user] = await Promise.all([
         CommentsModel.create(comment) as unknown as ICommentDocument,
         PostModel.findByIdAndUpdate(postId, {
            $inc: { commentsCount: 1 }
         }, { new: true }) as unknown as IPostDocument,
         userCache.getUserFromaCache(userTo)
      ])
      console.log(user, userTo, userFrom);
      //send notification to user
      if (user.notifications.comments && userTo !== userFrom) {
         const notificationModel = new NotificationModel();
         const notifications = await notificationModel.insertNotification({
            userFrom,
            userTo,
            message: `${username} commented on your post.`,
            notificationType: 'comment',
            entityId: new mongoose.Types.ObjectId(postId),
            createdItemId: new mongoose.Types.ObjectId(comments._id!),
            createdAt: new Date(),
            comment: comment.comment,
            post: post.post,
            imgId: post.imgId!,
            imgVersion: post.imgVersion!,
            gifUrl: post.gifUrl!,
            reaction: ''
         });
         // send client with socket
         socketIONotificationObject.emit('send notification', notifications, { userTo })
         // send to mail
         const paramsTemplate: INotificationTemplate = {
            username: `${user.username}`,
            message: `${username} commented on your post.`,
            header: 'Comment notification from Social App'
         }
         const templates = notificationTemplate.notificationMessageTemplate(paramsTemplate)
         emailQueue.addEmailJob('commentsEmail', {
            to: `${user.email}`,
            subject: 'Comment notification',
            html: templates,
            text: 'Comment notification from Social App'
         })

      }
   }
   public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>) {
      return CommentsModel.aggregate([
         { $match: query },
         { $sort: sort }
      ])
   }
   public async getUserPostComments(query: IQueryComment, sort: Record<string, 1 | -1>) {
      return CommentsModel.aggregate([
         { $match: query },
         { $sort: sort },
         {
            $group: {
               _id: null,
               names: {
                  $addToSet: '$username'
               },
               count: {
                  $sum: 1
               }
            }
         },
         {
            $project: { _id: 0 }
         }
      ])
   }
}
export const commentService = new CommentService();