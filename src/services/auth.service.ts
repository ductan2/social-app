import { Helpers } from "src/helpers";
import { ISignUpData } from "../interfaces/auth.interface";
import { AuthModel } from "src/models/auth.model";


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

}
export const authService = new AuthService();