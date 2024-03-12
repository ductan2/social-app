import { IAuthDocument } from "@interfaces/auth.interface";
import { BadRequestError, NotFoundError } from "@interfaces/error.interface";
import { IFollowerData } from "@interfaces/follower.interface";
import { IPostDocument } from "@interfaces/post.interface";
import { IAllUsers, IResetPasswordParams, ISearchUser, IUserDocument } from "@interfaces/user.interface";
import { JoiValidation } from "@root/decorators/joi-validation.decorator";
import { resetPasswordTemplate } from "@root/emails/templates/reset-password/reset-password";
import { Helpers } from "@root/helpers";
import { emailQueue } from "@root/queues/email.queue";
import { followerCache } from "@root/redis/follower.cache";
import { postCache } from "@root/redis/post.cache";
import { userCache } from "@root/redis/user.cache";
import { basicInfoSchema, changePasswordSchema, notificationSettingsSchema, socialLinksSchema } from "@root/schemas/user.schema";
import { authService } from "@services/auth.service";

import { followerService } from "@services/follower.service";
import { postService } from "@services/post.service";
import { userService } from "@services/user.service";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import moment from "moment";
import publicIP from "ip";
import mongoose from "mongoose";
import { userQueue } from "@root/queues/user.queue";
const PAGE_SIZE = 12;

interface IUserAll {
   newSkip: number;
   limit: number;
   skip: number;
   userId: string;
}
class UserController {
   public async getAllUsers(req: Request, res: Response) {
      const { page } = req.params;
      const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
      const limit: number = PAGE_SIZE * parseInt(page);
      const newSkip: number = skip === 0 ? skip : skip + 1;
      const allUsers = await UserController.prototype.allUsers({
         newSkip,
         limit,
         skip,
         userId: `${req.currentUser!.userId}`
      });
      const followers: IFollowerData[] = await UserController.prototype.getFollowers(`${req.currentUser!.userId}`);
      res.status(HTTP_STATUS.OK).json({ message: 'Get users', users: allUsers.users, totalUsers: allUsers.totalUsers, followers });
   }
   public async getProfile(req: Request, res: Response) {
      const cacheUser = await userCache.getUserFromCache(req.currentUser!.userId);
      const user = cacheUser ? cacheUser : await userService.getUserById(req.currentUser!.userId);
      res.status(HTTP_STATUS.OK).json({ message: 'User profile fetched', user });
   }
   public async getProfileById(req: Request, res: Response) {
      const cacheUser = await userCache.getUserFromCache(req.params.userId);
      const user = cacheUser ? cacheUser : await userService.getUserById(req.params.userId);
      if (!user?._id) {
         throw new NotFoundError('User not found');
      }
      res.status(HTTP_STATUS.OK).json({ message: 'User profile fetched', user });
   }
   public async randomUserSuggestions(req: Request, res: Response): Promise<void> {
      let randomUsers: IUserDocument[] = [];
      const cachedUsers: IUserDocument[] = await userCache.getRandomUsersFromCache(`${req.currentUser!.userId}`, req.currentUser!.username);
      if (cachedUsers.length) {
         randomUsers = [...cachedUsers];
      } else {
         const users: IUserDocument[] = await userService.getRandomUser(req.currentUser!.userId);
         randomUsers = [...users];
      }
      res.status(HTTP_STATUS.OK).json({ message: 'User suggestions', users: randomUsers });
   }
   @JoiValidation(changePasswordSchema)
   public async changePassword(req: Request, res: Response) {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (newPassword !== confirmPassword) {
         throw new BadRequestError('Passwords do not match.');
      }
      const existingUser: IAuthDocument = await authService.checkUser(req.currentUser!.username) as IAuthDocument;
      const passwordsMatch: boolean = await existingUser.comparePassword(currentPassword);
      if (!passwordsMatch) {
         throw new BadRequestError('Invalid credentials');
      }
      const hashedPassword: string = await existingUser.hashPassword(newPassword);
      userService.updatePassword(`${req.currentUser!.username}`, hashedPassword);

      const templateParams: IResetPasswordParams = {
         username: existingUser.username!,
         email: existingUser.email!,
         ipaddress: publicIP.address(),
         date: moment().format('DD//MM//YYYY HH:mm')
      };
      const template: string = resetPasswordTemplate.passwordResetTemplate(templateParams);
      emailQueue.addEmailJob('changePassword', { html: template, to: existingUser.email!, subject: 'Password update confirmation', text: 'Password updated successfully' });
      res.status(HTTP_STATUS.OK).json({
         message: 'Password updated successfully. You will be redirected shortly to the login page.'
      });
   }

   @JoiValidation(basicInfoSchema)
   public async updateInfo(req: Request, res: Response): Promise<void> {
      for (const [key, value] of Object.entries(req.body)) {
         await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, key, `${value}`);
      }
      userQueue.addUserJob('updateBasicInfoInDB', {
         key: `${req.currentUser!.userId}`,
         value: req.body
      });
      res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
   }

   @JoiValidation(socialLinksSchema)
   public async updateSocial(req: Request, res: Response): Promise<void> {
      await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'social', req.body);
      userQueue.addUserJob('updateSocialLinksInDB', {
         key: `${req.currentUser!.userId}`,
         value: req.body
      });
      res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
   }
   public async searchUser(req: Request, res: Response): Promise<void> {
      const regex = new RegExp(Helpers.escapeRegex(req.params.query), 'i');
      const users: ISearchUser[] = await userService.searchUsers(regex) as ISearchUser[];
      res.status(HTTP_STATUS.OK).json({ message: 'Search results', search: users });
   }
   @JoiValidation(notificationSettingsSchema)
   public async updateNotification(req: Request, res: Response): Promise<void> {
     await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'notifications', req.body);
     userQueue.addUserJob('updateNotificationSettings', {
       key: `${req.currentUser!.userId}`,
       value: req.body
     });
     res.status(HTTP_STATUS.OK).json({ message: 'Notification settings updated successfully', settings: req.body });
   }
   private async allUsers({ newSkip, limit, skip, userId }: IUserAll): Promise<IAllUsers> {
      let users;
      let type = '';
      const cachedUsers: IUserDocument[] = (await userCache.getUsersFromCache(newSkip, limit, userId)) as IUserDocument[];
      if (cachedUsers.length) {
         type = 'redis';
         users = cachedUsers;
      } else {
         type = 'mongodb';
         users = await userService.getAllUsers(userId, skip, limit);
      }
      const totalUsers: number = await UserController.prototype.getUsersCount(type);
      return { users, totalUsers };
   }
   public async profileAndPosts(req: Request, res: Response): Promise<void> {
      const { userId, username, uId } = req.params;
      const userName: string = Helpers.firstLetterUppercase(username);
      const cachedUser: IUserDocument = (await userCache.getUserFromCache(userId)) as IUserDocument;
      const cachedUserPosts: IPostDocument[] = await postCache.getUserPostsFromCache('post', parseInt(uId, 10));

      const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(userId) as IUserDocument;
      const userPosts: IPostDocument[] = cachedUserPosts.length
         ? cachedUserPosts
         : await postService.getPosts({ username: userName }, 0, 100, { createdAt: -1 });
      res.status(HTTP_STATUS.OK).json({ message: 'Get user profile and posts', user: existingUser, posts: userPosts });
   }

   private async getUsersCount(type: string): Promise<number> {
      const totalUsers: number = type === 'redis' ? await userCache.getTotalUsersInCache() : await userService.getTotalUsersInDB();
      return totalUsers;
   }

   private async getFollowers(userId: string): Promise<IFollowerData[]> {
      // ? get user followers from cache
      const cachedFollowers: IFollowerData[] = await followerCache.getFollowersFromCache(`followers:${userId}`);
      const result = cachedFollowers.length ? cachedFollowers : await followerService.getFollowerData(new mongoose.Types.ObjectId(userId));
      return result;
   }
}

export const userController = new UserController()