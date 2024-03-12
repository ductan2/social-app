import { BadRequestError } from "@interfaces/error.interface";
import { IBasicInfo, INotificationSettings, ISocialLinks, IUserDocument } from "@interfaces/user.interface";
import { UserModel } from "@models/user.mode";
import mongoose, { Document } from "mongoose";
import { followerService } from "./follower.service";
import { indexOf } from "lodash";
import { AuthModel } from "@models/auth.model";


class UserService {



   public async addUserData(data: IUserDocument) {
      return UserModel.create(data)
   }
   public async getUserByAuthId(authId: string) {
      return UserModel.findOne({ authId: new mongoose.Types.ObjectId(authId) }).lean();
   }
   public async getUserById(userId: string) {
      return UserModel.findOne({ _id: new mongoose.Types.ObjectId(userId) }).lean();
   }
   public async getAllUsers(userId: string, skip: number, limit: number): Promise<IUserDocument[]> {
      const users: IUserDocument[] = await UserModel.aggregate([
         { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
         { $skip: skip },
         { $limit: limit },
         { $sort: { createdAt: -1 } },
         { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
         { $unwind: '$authId' },
         { $project: this.aggregateProject() }
      ]);
      return users;
   }
   public async getTotalUsersInDB(): Promise<number> {
      const totalCount: number = await UserModel.find({}).countDocuments();
      return totalCount;
   }
   public async blockUserInDB(userId: string, blockedId: string) {
      return UserModel.bulkWrite([
         {
            updateOne: {
               filter: {
                  _id: new mongoose.Types.ObjectId(userId),
                  blocked: { $ne: new mongoose.Types.ObjectId(blockedId) },
               },
               update: {
                  $push: { blocked: new mongoose.Types.ObjectId(blockedId) } as mongoose.mongo.PushOperator<Document>
               },
            },
         },
         {
            updateOne: {
               filter: {
                  _id: new mongoose.Types.ObjectId(blockedId),
                  blockedBy: { $ne: new mongoose.Types.ObjectId(userId) },
               },
               update: {
                  $push: { blockedBy: new mongoose.Types.ObjectId(userId) } as mongoose.mongo.PushOperator<Document>
               }
            }
         }
      ])
   }
   public async unblockUserInDB(userId: string, blockedId: string) {
      return UserModel.bulkWrite([
         {
            updateOne: {
               filter: { _id: new mongoose.Types.ObjectId(userId) },
               update: { $pull: { blocked: new mongoose.Types.ObjectId(blockedId) } as mongoose.mongo.PushOperator<Document> }
            },
         },
         {
            updateOne: {
               filter: {
                  _id: new mongoose.Types.ObjectId(blockedId)
               },
               update: {
                  $pull: { blockedBy: new mongoose.Types.ObjectId(userId) } as mongoose.mongo.PushOperator<Document>
               }
            }
         }
      ])
   }
   public async updatePassword(username: string, hashedPassword: string): Promise<void> {
      await AuthModel.updateOne({ username }, { $set: { password: hashedPassword } }).exec();
   }

   public async updateUserInfo(userId: string, info: IBasicInfo): Promise<void> {
      await UserModel.updateOne(
         { _id: userId },
         {
            $set: {
               work: info['work'],
               school: info['school'],
               quote: info['quote'],
               location: info['location']
            }
         }
      ).lean();
   }
   public async getRandomUser(userId: string) {
      // random 10 users from db
      const randomUsers: IUserDocument[] = [];
      const users: IUserDocument[] = await UserModel.aggregate([
         { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
         { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
         { $unwind: '$authId' },
         { $sample: { size: 10 } },
         {
            $addFields: {
               username: '$authId.username',
               email: '$authId.email',
               avatarColor: '$authId.avatarColor',
               uId: '$authId.uId',
               createdAt: '$authId.createdAt'
            }
         },
         {
            $project: {
               authId: 0,
               __v: 0
            }
         }
      ]);
      const followers: string[] = await followerService.getFolloweesIds(`${userId}`);
      for (const user of users) {
         const followerIndex = indexOf(followers, user._id.toString());
         if (followerIndex < 0) {
            randomUsers.push(user);
         }
      }
      return randomUsers;
   }
   public async updateSocialLinks(userId: string, links: ISocialLinks): Promise<void> {
      await UserModel.updateOne(
         { _id: userId },
         {
            $set: { social: links }
         }
      ).exec();
   }

   public async updateNotificationSettings(userId: string, settings: INotificationSettings): Promise<void> {
      await UserModel.updateOne({ _id: userId }, { $set: { notifications: settings } }).exec();
   }
   public async searchUsers(regex: RegExp): Promise<IUserDocument[]> {
      return AuthModel.aggregate([
         { $match: { username: { $regex: regex } } },
         { $lookup: { from: 'User', localField: '_id', foreignField: 'authId', as: 'userId' } },
         { $unwind: '$user' },
         {
            $project: {
               _id: '$user._id',
               username: 1,
               email: 1,
               avatarColor: 1,
               profilePicture: 1
            }
         }
      ]);
   }
   private aggregateProject() {
      return {
         _id: 1,
         username: '$authId.username',
         uId: '$authId.uId',
         email: '$authId.email',
         avatarColor: '$authId.avatarColor',
         createdAt: '$authId.createdAt',
         postsCount: 1,
         work: 1,
         school: 1,
         quote: 1,
         location: 1,
         blocked: 1,
         blockedBy: 1,
         followersCount: 1,
         followingCount: 1,
         notifications: 1,
         social: 1,
         bgImageVersion: 1,
         bgImageId: 1,
         profilePicture: 1
      };
   }

   // public async getUserById(userId: string): Promise<IUserDocument> {
   //    const users: IUserDocument[] = await UserModel.aggregate([
   //      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
   //      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
   //      { $unwind: '$authId' },
   //    //   { $project: this.aggregateProject() } // Assuming aggregateProject is a method in your class
   //    ]);

   //    return users[0];
   //  }
}
export const userService = new UserService()