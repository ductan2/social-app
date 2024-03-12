import { IFollowerData } from "@interfaces/follower.interface";
import { INotificationDocument, INotificationTemplate } from "@interfaces/notification.interface";
import { IUserDocument } from "@interfaces/user.interface";
import { FollowerModel } from "@models/follower.model";
import { NotificationModel } from "@models/notification.model";
import { UserModel } from "@models/user.mode";
import { notificationTemplate } from "@root/emails/templates/notification/notification-template";
import { emailQueue } from "@root/queues/email.queue";
import { userCache } from "@root/redis/user.cache";
import { socketIONotificationObject } from "@root/sockets/notification";
import { map } from "lodash";
import { BulkWriteResult, ObjectId } from "mongodb";
import mongoose from "mongoose";
class FollowerService {
   async addFollowerToDB(followerId: string, followingId: string, username: string, followerDocumentId: ObjectId) {
      const following = await FollowerModel.create({
         _id: followerDocumentId,
         followerId: new mongoose.Types.ObjectId(followerId),
         followingId: new mongoose.Types.ObjectId(followingId)
      })
      const users = UserModel.bulkWrite([
         {
            updateOne: {
               filter: { _id: new mongoose.Types.ObjectId(followerId) },
               update: { $inc: { followingCount: 1 } }
            }
         },
         {
            updateOne: {
               filter: { _id: new mongoose.Types.ObjectId(followingId) },
               update: { $inc: { followersCount: 1 } }
            }
         }
      ])
      const response: [BulkWriteResult, IUserDocument | null] = await Promise.all([users, userCache.getUserFromCache(followingId)]);
      if (response[1]?.notifications.follows && followerId !== followerId) {
         const notificationModel: INotificationDocument = new NotificationModel();
         const notifications = await notificationModel.insertNotification({
            userFrom: followerId,
            userTo: followingId,
            message: `${username} is now following you.`,
            notificationType: 'follows',
            entityId: new mongoose.Types.ObjectId(followerId),
            createdItemId: new mongoose.Types.ObjectId(following._id),
            createdAt: new Date(),
            comment: '',
            post: '',
            imgId: '',
            imgVersion: '',
            gifUrl: '',
            reaction: ''
         });
         socketIONotificationObject.emit('insert notification', notifications, { userTo: followingId });
         const templateParams: INotificationTemplate = {
            username: response[1].username!,
            message: `${username} is now following you.`,
            header: 'Follower Notification'
         };
         const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
         emailQueue.addEmailJob('followersEmail', {
            to: response[1].email!,
            html: template,
            subject: `Follower Notification`,
            text: `${username} is now following you.`
         });
      }
   }

   async removeFollowerToDB(followerId: string, followingId: string) {
   await FollowerModel.deleteOne({
      followerId: new mongoose.Types.ObjectId(followerId),
      followingId: new mongoose.Types.ObjectId(followingId)
   })
   const users = UserModel.bulkWrite([
      {
         updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(followerId) },
            update: { $inc: { followingCount: -1 } }
         }
      },
      {
         updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(followingId) },
            update: { $inc: { followersCount: -1 } }
         }
      }
   ])
   return Promise.all([users, users]);
}
   public async getFollowerData(userObjectId: ObjectId): Promise < IFollowerData[] > {
   const follower: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
      { $unwind: '$followerId' },
      { $lookup: { from: 'Auth', localField: 'followerId.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
         $addFields: {
            _id: '$followerId._id',
            username: '$authId.username',
            avatarColor: '$authId.avatarColor',
            uId: '$authId.uId',
            postCount: '$followerId.postsCount',
            followersCount: '$followerId.followersCount',
            followingCount: '$followerId.followingCount',
            profilePicture: '$followerId.profilePicture',
            userProfile: '$followerId'
         }
      },
      {
         $project: {
            authId: 0,
            followerId: 0,
            followeeId: 0,
            createdAt: 0,
            __v: 0
         }
      }
   ]);
   return follower;
}
   public async getFollowingData(userObjectId: ObjectId): Promise < IFollowerData[] > {
   const followee: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followerId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
      { $unwind: '$followeeId' },
      { $lookup: { from: 'Auth', localField: 'followeeId.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
         $addFields: {
            _id: '$followeeId._id',
            username: '$authId.username',
            avatarColor: '$authId.avatarColor',
            uId: '$authId.uId',
            postCount: '$followeeId.postsCount',
            followersCount: '$followeeId.followersCount',
            followingCount: '$followeeId.followingCount',
            profilePicture: '$followeeId.profilePicture',
            userProfile: '$followeeId'
         }
      },
      {
         $project: {
            authId: 0,
            followerId: 0,
            followeeId: 0,
            createdAt: 0,
            __v: 0
         }
      }
   ]);
   return followee;
}
   public async getFolloweesIds(userId: string): Promise < string[] > {
   // return the followee ids of the user
   const followee = await FollowerModel.aggregate([
      { $match: { followerId: new mongoose.Types.ObjectId(userId) } },
      {
         $project: {
            followeeId: 1,
            _id: 0
         }
      }
   ]);
   return map(followee, (result) => result.followeeId.toString());
}
}
export const followerService = new FollowerService();