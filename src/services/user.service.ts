import { BadRequestError } from "@interfaces/error.interface";
import { IUserDocument } from "@interfaces/user.interface";
import { UserModel } from "@models/user.mode";
import mongoose, { Document } from "mongoose";


class UserService {



   async addUserData(data: IUserDocument) {
      return UserModel.create(data)
   }
   async getUserByAuthId(authId: string) {
      return UserModel.findOne({ authId: new mongoose.Types.ObjectId(authId) }).lean();
   }
   async getUserById(userId: string) {
      return UserModel.findOne({ _id: new mongoose.Types.ObjectId(userId) }).lean();
   }
   async blockUserToDB(userId: string, blockedId: string) {
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
   async unBlockUserToDB(userId: string, blockedId: string) {
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