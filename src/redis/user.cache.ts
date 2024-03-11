
import { INotificationSettings, ISocialLinks, IUserDocument } from "@interfaces/user.interface";
import { BaseCache } from "./base.cache";
import { IAuthDocument } from "@interfaces/auth.interface";
import { Helpers } from "@root/helpers";
import { InternalServerError } from "@interfaces/error.interface";
import Logger from "bunyan";
import { config } from "@config/config";
import { findIndex, indexOf } from "lodash";
type UserItem = string | ISocialLinks | INotificationSettings
const log: Logger = config.createLogger('userCache')
export class UserCache extends BaseCache {
   constructor() {
      super('userCache')
   }
   public async saveUserToCache(key: string, userUID: string, user: IUserDocument) {
      const createdAt = new Date();
      const {
         _id,
         uId,
         username,
         email,
         avatarColor,
         blocked,
         blockedBy,
         postsCount,
         profilePicture,
         followersCount,
         followingCount,
         notifications,
         work,
         location,
         school,
         quote,
         bgImageId,
         bgImageVersion,
         social
      } = user;
      const dataToSave = {
         '_id': `${_id}`,
         'uId': `${uId}`,
         'username': `${username}`,
         'email': `${email}`,
         'avatarColor': `${avatarColor}`,
         'createdAt': `${createdAt}`,
         'postsCount': `${postsCount}`,
         'blocked': JSON.stringify(blocked),
         'blockedBy': JSON.stringify(blockedBy),
         'profilePicture': `${profilePicture}`,
         'followersCount': `${followersCount}`,
         'followingCount': `${followingCount}`,
         'notifications': JSON.stringify(notifications),
         'social': JSON.stringify(social),
         'work': `${work}`,
         'location': `${location}`,
         'school': `${school}`,
         'quote': `${quote}`,
         'bgImageVersion': `${bgImageVersion}`,
         'bgImageId': `${bgImageId}`
      };
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         await this.client.ZADD('user', { score: parseInt(userUID, 10), value: `${key}` });
         await this.client.HSET(`users:${key}`, dataToSave);
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error while saving user to cache')
      }
   }
   public async getUserFromCache(userId: string) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const user: IUserDocument = await this.client.HGETALL(`users:${userId}`) as unknown as IUserDocument;
         user.createdAt = new Date(Helpers.parseJson(`${user.createdAt}`));
         user.postsCount = Helpers.parseJson(`${user.postsCount}`);
         user.blocked = Helpers.parseJson(`${user.blocked}`);
         user.blockedBy = Helpers.parseJson(`${user.blockedBy}`);
         user.notifications = Helpers.parseJson(`${user.notifications}`);
         user.social = Helpers.parseJson(`${user.social}`);
         user.followersCount = Helpers.parseJson(`${user.followersCount}`);
         user.followingCount = Helpers.parseJson(`${user.followingCount}`);
         user.bgImageId = Helpers.parseJson(`${user.bgImageId}`);
         user.bgImageVersion = Helpers.parseJson(`${user.bgImageVersion}`);
         user.profilePicture = Helpers.parseJson(`${user.profilePicture}`);
         user.work = Helpers.parseJson(`${user.work}`);
         user.school = Helpers.parseJson(`${user.school}`);
         user.location = Helpers.parseJson(`${user.location}`);
         user.quote = Helpers.parseJson(`${user.quote}`);

         return user;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error while getting user from cache')
      }
   }
   public async getUsersFromCache(start: number, end: number, excludedUserKey: string): Promise<IUserDocument[]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const response: string[] = await this.client.ZRANGE('user', start, end);
         const multi: ReturnType<typeof this.client.multi> = this.client.multi();
         for (const key of response) { 
            if (key !== excludedUserKey) {
               multi.HGETALL(`users:${key}`);
            }
         }
         const replies: any = (await multi.exec());
         const userReplies: IUserDocument[] = [];
         for (const reply of replies as IUserDocument[]) {
            reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
            reply.postsCount = Helpers.parseJson(`${reply.postsCount}`);
            reply.blocked = Helpers.parseJson(`${reply.blocked}`);
            reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`);
            reply.notifications = Helpers.parseJson(`${reply.notifications}`);
            reply.social = Helpers.parseJson(`${reply.social}`);
            reply.followersCount = Helpers.parseJson(`${reply.followersCount}`);
            reply.followingCount = Helpers.parseJson(`${reply.followingCount}`);
            reply.bgImageId = Helpers.parseJson(`${reply.bgImageId}`);
            reply.bgImageVersion = Helpers.parseJson(`${reply.bgImageVersion}`);
            reply.profilePicture = Helpers.parseJson(`${reply.profilePicture}`);
            reply.work = Helpers.parseJson(`${reply.work}`);
            reply.school = Helpers.parseJson(`${reply.school}`);
            reply.location = Helpers.parseJson(`${reply.location}`);
            reply.quote = Helpers.parseJson(`${reply.quote}`);

            userReplies.push(reply);
         }
         return userReplies;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error while getting users from cache');
      }
   }
   
   public async updateSingleUserItemInCache(userId: string, prop: string, value: UserItem) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect()
         }
         await this.client.HSET(`users:${userId}`, `${prop}`, JSON.stringify(value));
         const response: IUserDocument = (await this.getUserFromCache(userId)) as IUserDocument;
         return response;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error while updating user item in cache')
      }
   }
   public async getRandomUsersFromCache(userId: string, excludedUsername: string): Promise<IUserDocument[]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const replies: IUserDocument[] = [];
         const followers: string[] = await this.client.LRANGE(`followers:${userId}`, 0, -1);
         const users: string[] = await this.client.ZRANGE('user', 0, -1);
         const randomUsers: string[] = Helpers.shuffle(users).slice(0, 10);
         for (const key of randomUsers) {
            const followerIndex = indexOf(followers, key);
            if (followerIndex < 0) {
               const userHash: IUserDocument = (await this.client.HGETALL(`users:${key}`)) as unknown as IUserDocument;
               replies.push(userHash);
            }
         }
         const excludedUsernameIndex: number = findIndex(replies, ['username', excludedUsername]);
         replies.splice(excludedUsernameIndex, 1);
         for (const reply of replies) {
            reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
            reply.postsCount = Helpers.parseJson(`${reply.postsCount}`);
            reply.blocked = Helpers.parseJson(`${reply.blocked}`);
            reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`);
            reply.notifications = Helpers.parseJson(`${reply.notifications}`);
            reply.social = Helpers.parseJson(`${reply.social}`);
            reply.followersCount = Helpers.parseJson(`${reply.followersCount}`);
            reply.followingCount = Helpers.parseJson(`${reply.followingCount}`);
            reply.bgImageId = Helpers.parseJson(`${reply.bgImageId}`);
            reply.bgImageVersion = Helpers.parseJson(`${reply.bgImageVersion}`);
            reply.profilePicture = Helpers.parseJson(`${reply.profilePicture}`);
            reply.work = Helpers.parseJson(`${reply.work}`);
            reply.school = Helpers.parseJson(`${reply.school}`);
            reply.location = Helpers.parseJson(`${reply.location}`);
            reply.quote = Helpers.parseJson(`${reply.quote}`);
         }
         return replies;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }
   public async getTotalUsersInCache() {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const usersLength = await this.client.ZCARD('user'); // zcard returns the number of elements in a sorted set
         return usersLength;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error while getting total users in cache')
      }
   }
}
export const userCache = new UserCache();