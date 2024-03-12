import Logger from "bunyan";
import { BaseCache } from "./base.cache";
import { config } from "@config/config";
import { IPostDocument, ISavePostToCache } from "@interfaces/post.interface";
import { InternalServerError } from "@interfaces/error.interface";
import { Helpers } from "@root/helpers";
import { IReactions } from "@interfaces/reaction.interface";


const log: Logger = config.createLogger('PostCache');
class PostCache extends BaseCache {
   constructor() {
      super('PostCache')
   }
   public async savePostToCache(data: ISavePostToCache) {
      const { createdPost, currentUserId, key, uId } = data;
      const {
         _id,
         userId,
         username,
         email,
         avatarColor,
         profilePicture,
         post,
         bgColor,
         feelings,
         privacy,
         gifUrl,
         commentsCount,
         imgVersion,
         imgId,
         videoId,
         videoVersion,
         reactions,
         createdAt
      } = createdPost;

      const dataToSave = {
         '_id': `${_id}`,
         'userId': `${userId}`,
         'username': `${username}`,
         'email': `${email}`,
         'avatarColor': `${avatarColor}`,
         'profilePicture': `${profilePicture}`,
         'post': `${post}`,
         'bgColor': `${bgColor}`,
         'feelings': `${feelings}`,
         'privacy': `${privacy}`,
         'gifUrl': `${gifUrl}`,
         'commentsCount': `${commentsCount}`,
         'reactions': JSON.stringify(reactions),
         'imgVersion': `${imgVersion}`,
         'imgId': `${imgId}`,
         'videoId': `${videoId}`,
         'videoVersion': `${videoVersion}`,
         'createdAt': `${createdAt}`
      };
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const postsCount: string[] = await this.client.hGet(`users:${currentUserId}`, 'postsCount') as unknown as string[];// get posts count from user
         const multi = this.client.multi()
         // use multi to execute multiple commands if one fails all fails
         multi.ZADD('posts', { score: parseInt(uId, 10), value: `${key}` });
         multi.HSET(`posts:${key}`, dataToSave);
         const count: number = parseInt(postsCount[0], 10) + 1; // increment posts count by 1
         multi.HSET(`users:${currentUserId}`, { 'postsCount': `${count}` });
         multi.exec();
      } catch (error) {
         log.error(`Error while save post from cache ==> ${error}`)
         throw new InternalServerError(`Error while save post from cache ==> ${error}`)
      }
   }
   public async getPostsFromCache(key: string = 'posts', start: number, end: number) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const posts: string[] = await this.client.zRange(key, start, end) as unknown as string[];

         // get Posts with reverse order from cache (REV:true means reverse order)
         const multi = this.client.multi();
         for (const value of posts) {
            multi.HGETALL(`posts:${value}`);
         }
         const result: any = await multi.exec();
         const postsArray: IPostDocument[] = [];
         for (const res of result as IPostDocument[]) {
            res.commentsCount = Helpers.parseJson(`${res.commentsCount}`) as number;
            res.reactions = Helpers.parseJson(`${res.reactions}`);
            res.createdAt = new Date(Helpers.parseJson(`${res.createdAt}`));
            postsArray.push(res);
         }
         return postsArray;

      } catch (error) {
         log.error(`Error while getting posts from cache ==> ${error}`)
         throw new InternalServerError(`Error while getting posts from cache ==> ${error}`)
      }
   }
   public async getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }

         const reply: string[] = await this.client.ZRANGE(key, uId, uId);
         const multi: ReturnType<typeof this.client.multi> = this.client.multi();
         for (const value of reply) {
            multi.HGETALL(`posts:${value}`);
         }
         const replies: any = (await multi.exec());
         const postReplies: IPostDocument[] = [];
         for (const post of replies as IPostDocument[]) {
            post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
            post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
            post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;
            postReplies.push(post);
         }
         return postReplies;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error while getting user posts from cache ==> ' + error);
      }
   }
   public async getTotalPostsCount(key: string = 'posts') {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const count: number = await this.client.ZCARD(key);
         return count;
      } catch (error) {
         log.error(`Error while getting total posts count from cache ==> ${error}`)
         throw new InternalServerError(`Error while getting total posts count from cache ==> ${error}`)
      }
   }
   public async getPostsWithImageFromCache(key: string = 'posts', start: number, end: number) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const posts: string[] = await this.client.ZRANGE(key, start, end) as unknown as string[]; // auto REV:true means reverse order
         const multi = this.client.multi();

         for (const value of posts) {
            multi.HGETALL(`posts:${value}`);
         }
         const result: any = await multi.exec();
         const postsImageArray: IPostDocument[] = [];
         for (const res of result as IPostDocument[]) {
            if ((res.imgId && res.imgVersion) || res.gifUrl) {
               res.commentsCount = Helpers.parseJson(`${res.commentsCount}`) as number;
               res.reactions = Helpers.parseJson(`${res.reactions}`);
               res.createdAt = new Date(Helpers.parseJson(`${res.createdAt}`));
               postsImageArray.push(res);
            }
         }
         return postsImageArray;

      } catch (error) {
         log.error(`Error while getting posts image from cache ==> ${error}`)
         throw new InternalServerError(`Error while getting posts image from cache ==> ${error}`)
      }
   }
   public async getPostsWithVideoFromCache(key: string = 'posts', start: number, end: number) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const posts: string[] = await this.client.ZRANGE(key, start, end) as unknown as string[]; // auto REV:true means reverse order
         const multi = this.client.multi();

         for (const value of posts) {
            multi.HGETALL(`posts:${value}`);
         }
         const result: any = await multi.exec();
         const postsVideoArray: IPostDocument[] = [];
         for (const res of result as IPostDocument[]) {
            if ((res.videoId && res.videoVersion)) {
               res.commentsCount = Helpers.parseJson(`${res.commentsCount}`) as number;
               res.reactions = Helpers.parseJson(`${res.reactions}`);
               res.createdAt = new Date(Helpers.parseJson(`${res.createdAt}`));
               postsVideoArray.push(res);
            }
         }
         return postsVideoArray;

      } catch (error) {
         log.error(`Error while getting posts image from cache ==> ${error}`)
         throw new InternalServerError(`Error while getting posts image from cache ==> ${error}`)
      }
   }
   public async getTotalUserPostInCache(uId: string) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const result = await this.client.ZCOUNT('posts', uId, uId);
         return result;
      } catch (error) {
         log.error(`Error while getting total user posts count from cache ==> ${error}`)
         throw new InternalServerError(`Error while getting total user posts count from cache ==> ${error}`)
      }
   }
   public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
         const multi: ReturnType<typeof this.client.multi> = this.client.multi();
         multi.ZREM('posts', `${key}`);
         multi.DEL(`posts:${key}`);
         multi.DEL(`comments:${key}`);
         multi.DEL(`reactions:${key}`);
         const count: number = parseInt(postCount[0], 10) - 1;
         multi.HSET(`users:${currentUserId}`, 'postsCount', count);
         await multi.exec();
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error while deleting post from cache ==>' + error);
      }
   }
   public async updatePostInCache(key: string, updatedPost: Partial<IPostDocument>): Promise<IPostDocument> {
      const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, videoId, videoVersion, profilePicture } = updatedPost;
      const dataToSave = {
         'post': `${post}`,
         'bgColor': `${bgColor}`,
         'feelings': `${feelings}`,
         'privacy': `${privacy}`,
         'gifUrl': `${gifUrl}`,
         'videoId': `${videoId}`,
         'videoVersion': `${videoVersion}`,
         'profilePicture': `${profilePicture}`,
         'imgVersion': `${imgVersion}`,
         'imgId': `${imgId}`
      };

      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
            await this.client.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
         }
         const multi: ReturnType<typeof this.client.multi> = this.client.multi();
         multi.HGETALL(`posts:${key}`);
         const reply: any = (await multi.exec());
         const postReply = reply as IPostDocument[];
         postReply[0].commentsCount = Helpers.parseJson(`${postReply[0].commentsCount}`) as number;
         postReply[0].reactions = Helpers.parseJson(`${postReply[0].reactions}`) as IReactions;
         postReply[0].createdAt = new Date(Helpers.parseJson(`${postReply[0].createdAt}`)) as Date;

         return postReply[0];
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error while updating post in cache ==>' + error);
      }
   }
   public async getPostsWithVideosFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }

         const reply: string[] = await this.client.ZRANGE(key, start, end);
         const multi: ReturnType<typeof this.client.multi> = this.client.multi();
         for (const value of reply) {
            multi.HGETALL(`posts:${value}`);
         }
         const replies: any = (await multi.exec());
         const postWithVideos: IPostDocument[] = [];
         for (const post of replies as IPostDocument[]) {
            if (post.videoId && post.videoVersion) {
               post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
               post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
               post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;
               postWithVideos.push(post);
            }
         }
         return postWithVideos;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error when get post video.');
      }
   }
}
export const postCache = new PostCache()