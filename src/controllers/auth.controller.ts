
import { IAuthDocument } from "@interfaces/auth.interface";
import { BadRequestError, NotFoundError } from "@interfaces/error.interface";
import { IUserDocument } from "@interfaces/user.interface";
import { JoiValidation } from "@root/decorators/joi-validation.decorator";
import { Helpers } from "@root/helpers";
import { userCache } from "@root/redis/user.cache";
import { signupSchema } from "@root/schemes/signup.scheme";
import { authService } from "@services/auth.service";
import { uploads } from "@utils/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { omit } from "lodash";
import { authQueue } from "@root/queues/auth.queue";
import { userQueue } from "@root/queues/user.queue";
import JWT from "jsonwebtoken";
import { config } from "@config/config";
import { signinSchema } from "@root/schemes/signin.sheme";
import { compare } from 'bcryptjs';
import { userService } from "@services/user.service";
import HTTP_STATUS from "http-status-codes";
class AuthController {
   @JoiValidation(signupSchema)
   async register(req: Request, res: Response) {
      const { avatarColor, email, password, username, avatarImage } = req.body;
      const isUserExist = await authService.checkUserExist(email, username);
      if (isUserExist) {
         throw new BadRequestError('User already exist');
      }
      const authObjectId = new ObjectId();
      const userObjectId = new ObjectId();
      const uid = `${Helpers.generateRandomInteget(12)}`
      const authData: IAuthDocument = {
         _id: authObjectId as ObjectId,
         uId: uid,
         email: Helpers.lowerCase(email),
         username: Helpers.firstLetterUppercase(username),
         password,
         avatarColor
      } as IAuthDocument;

      const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
      if (!result?.public_id) {
         throw new BadRequestError('Error uploading image');
      }
      // add redis cache
      let userDataCache = AuthController.prototype.userData(authData, userObjectId);
      userDataCache.profilePicture = result.secure_url; // result.secure_url is the url of the uploaded image
      await userCache.saveUserToCache(`${userObjectId}`, uid, userDataCache);

      //add to database
      omit(userDataCache, ['uId', 'username', 'email', 'password', 'avatarColor'])// remove sensitive data
      authQueue.addAuthJob('addAuthToDB', { value: userDataCache })
      userQueue.addUserJob('addUserToDB', { value: userDataCache })

      const userJWT: string = AuthController.prototype.signupToken(authData, userObjectId);
      req.session = { jwt: userJWT }

      res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: authData });
   }
   @JoiValidation(signinSchema)
   async login(req: Request, res: Response) {
      const { username, password } = req.body; // username can be email or username
      const isUserExist = await authService.checkUserExist(username, username);
      if (!isUserExist) {
         throw new BadRequestError('Invalid credentials');
      }
      const user = await userService.getUserByAuthId(`${isUserExist._id}`);
      const isPasswordMatch: boolean = await AuthController.prototype.comparePassword(password, isUserExist.password as string);
      if (!isPasswordMatch) {
         throw new BadRequestError('Password is incorrect');
      }
      const userJWT = AuthController.prototype.signupToken(isUserExist, new ObjectId(user?._id));
      req.session = { jwt: userJWT }
      const userDocument: IUserDocument = {
         ...user,
         authId: isUserExist._id,
         uId: isUserExist.uId,
         username: isUserExist.username,
         email: isUserExist.email,
         avatarColor: isUserExist.avatarColor,
         createdAt: isUserExist.createdAt,
      } as IUserDocument;

      res.status(HTTP_STATUS.OK).json({ message: 'User logged in successfully', user: userDocument, token: userJWT });
   }
   async logout(req: Request, res: Response) {
      req.session = null;
      res.status(HTTP_STATUS.OK).json({ message: 'User logged out successfully', user: {}, token: '' });
   }

   async currentUser(req: Request, res: Response) {
      const cachedUser = await userCache.getUserFromaCache(`${req.currentUser?.userId}`);
      const userExist = cachedUser?._id ? cachedUser : await userService.getUserById(`${req.currentUser?.userId}`);
      if (!userExist) {
         throw new NotFoundError('User not found');
      }

      res.status(HTTP_STATUS.OK).json({
         message: 'User fetched successfully',
         user: userExist,
         token: req.session?.jwt
      });


   }



   // service private methods
   private async comparePassword(password: string, passwordHash: string): Promise<boolean> {
      return compare(password, passwordHash);
   }
   private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
      const { _id, username, email, uId, password, avatarColor } = data;
      return {
         _id: userObjectId,
         authId: _id,
         uId,
         username: Helpers.firstLetterUppercase(username),
         email,
         password,
         avatarColor,
         profilePicture: '',
         blocked: [],
         blockedBy: [],
         work: '',
         location: '',
         school: '',
         quote: '',
         bgImageVersion: '',
         bgImageId: '',
         followersCount: 0,
         followingCount: 0,
         postsCount: 0,
         notifications: {
            messages: true,
            reactions: true,
            comments: true,
            follows: true
         },
         social: {
            facebook: '',
            instagram: '',
            twitter: '',
            youtube: ''
         }
      } as unknown as IUserDocument;
   }
   private signupToken(data: IAuthDocument, userObjectId: ObjectId) {
      return JWT.sign({
         userId: data._id,
         uId: data.uId,
         email: data.email,
         username: data.username,
         avatarColor: data.avatarColor,
         userObjectId: userObjectId
      }, `${config.JWT_SECRET}`, { expiresIn: config.JWT_EXPIRATION });
   }
}
export const authController = new AuthController();