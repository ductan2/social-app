
import { Helpers } from "@root/helpers";
import { ISignUpData } from "../interfaces/auth.interface";
import { AuthModel } from "@models/auth.model";
import { compare } from "bcryptjs";



class AuthService {
   async createAuthUser(data: ISignUpData) {
      return AuthModel.create(data);
   }
   async checkUserExist(email: string, username: string) {
      return AuthModel
         .findOne({ $or: [{ email: Helpers.lowerCase(email) }, { username: Helpers.firstLetterUppercase(username) }] })
         .lean();
   }
   async checkUser(username: string) {
      return AuthModel
         .findOne({ $or: [{ email: Helpers.lowerCase(username) }, { username: Helpers.firstLetterUppercase(username) }] })
         .lean();
   }
    async comparePassword(password: string, passwordHash: string): Promise<boolean> {
      return compare(password, passwordHash);
   }
   
   async getAuthByEmail(email: string) {
      return AuthModel.findOne({ email: Helpers.lowerCase(email) }).lean();
   }
   async updatePasswordResetToken(id: string, token: string, exp: number) {
      return AuthModel.findByIdAndUpdate(id, { passwordResetToken: token, passwordResetExpires: exp });
   }
   async getAuthByToken(token: string) {
      return AuthModel.findOne({
         passwordResetToken: token,
         passwordResetExpires: { $gt: Date.now() }
      });
   }
}
export const authService = new AuthService();