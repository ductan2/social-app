import { IUserDocument } from "@interfaces/user.interface";
import { UserModel } from "@models/user.mode";
import mongoose from "mongoose";


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