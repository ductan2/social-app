import { InternalServerError } from "@interfaces/error.interface";
import { BaseCache } from "./base.cache";
import Logger from "bunyan";
import { config } from "@config/config";
import { remove } from "lodash";
import { Helpers } from "@root/helpers";
import { IFollowerData } from "@interfaces/follower.interface";
import { IUserDocument } from "@interfaces/user.interface";
import { userCache } from "./user.cache";
import mongoose from "mongoose";
const log: Logger = config.createLogger('FollowerCache');
class FollowerCache extends BaseCache {
   constructor() {
      super('FollowerCache');
   }
   async saveFollowerToCache(key: string, value: string) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         await this.client.LPUSH(`follower:${key}`, value);
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error saving follower to cache ==>' + error);
      }
   }
   public async removeFollowerFromCache(key: string, value: string): Promise<void> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         await this.client.LREM(key, 1, value);
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }

   public async updateFollowersCountInCache(userId: string, prop: string, value: number): Promise<void> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         await this.client.HINCRBY(`users:${userId}`, prop, value);
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }
   public async getFollowersFromCache(key: string): Promise<IFollowerData[]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const response: string[] = await this.client.LRANGE(key, 0, -1);
         const list: IFollowerData[] = [];
         for (const item of response) {
            const user: IUserDocument = (await userCache.getUserFromaCache(item)) as IUserDocument;
            const data: IFollowerData = {
               _id: new mongoose.Types.ObjectId(user._id),
               username: user.username!,
               avatarColor: user.avatarColor!,
               postCount: user.postsCount,
               followersCount: user.followersCount,
               followingCount: user.followingCount,
               profilePicture: user.profilePicture,
               uId: user.uId!,
               userProfile: user
            };
            list.push(data);
         }
         return list;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }

   public async updateBlockedUserPropInCache({
      key,
      field,
      value,
      type
   }: { key: string, field: string, value: string, type: 'block' | 'unblock' }): Promise<void> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const response: string = (await this.client.HGET(`users:${key}`, field)) as string; // get blocked field

         const multi: ReturnType<typeof this.client.multi> = this.client.multi();
         let blocked: string[] = Helpers.parseJson(response) as string[];
         const isBlock = blocked.find((id: string) => id === value);
         if (isBlock && type === 'block') {
            return;
         }
         
         if (type === 'block') {
            blocked = [...blocked, value];
         } else {
            remove(blocked, (id: string) => id === value);
            blocked = [...blocked];

         }
         multi.HSET(`users:${key}`, `${field}`, JSON.stringify(blocked));
         await multi.exec();
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }
}
export const followerCache = new FollowerCache();