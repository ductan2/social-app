
import { IUserDocument } from "@interfaces/user.interface";
import { BaseCache } from "./base.cache";
import { IAuthDocument } from "@interfaces/auth.interface";
import { Helpers } from "@root/helpers";
import { InternalServerError } from "@interfaces/error.interface";

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
         throw new InternalServerError('Error while saving user to cache')
      }
   }
   public async getUserFromaCache(userId: string) {
      console.log("🚀 ~ UserCache ~ getUserFromaCache ~ userId:", userId)
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
         throw new InternalServerError('Error while getting user from cache')
      }
   }
}
export const userCache = new UserCache();