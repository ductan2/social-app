import Logger from "bunyan";
import { BaseCache } from "./base.cache";
import { config } from "@config/config";
import { ICommentDocument } from "@interfaces/comment.interface";
import { InternalServerError } from "@interfaces/error.interface";
import { Helpers } from "@root/helpers";
import { find } from "lodash";



const log: Logger = config.createLogger('CommentCache');
interface ICommentUsername {
   count: number,
   names: string[]
}
class CommentCache extends BaseCache {
   constructor() {
      super('CommentCache')
   }
   public async saveCommentToCache(postId: string, value: string) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         await this.client.LPUSH(`comments:${postId}`, value);
         const countCommentPost = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
         const count = parseInt(countCommentPost[0]) + 1;
         await this.client.HSET(`posts:${postId}`, 'commentsCount', count.toString());
      } catch (error) {
         log.error(error)
         throw new InternalServerError('Error while saving comment to cache ==>' + error)
      }
   }
   public async getCommentsFromCache(postId: string): Promise<[ICommentDocument[], number]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const commentLength = await this.client.LLEN(`comments:${postId}`);
         const comments = await this.client.LRANGE(`comments:${postId}`, 0, -1);
         const listComments: ICommentDocument[] = [];
         for (const comment of comments) {
            listComments.push(Helpers.parseJson(comment));
         }
         return listComments.length > 0 ? [listComments, commentLength] : [[], 0];
      } catch (error) {
         log.error(error)
         throw new InternalServerError('Error while saving comment to cache ==>' + error)
      }
   }
   public async getCommentsUsernameFromCache(postId: string): Promise<ICommentUsername[]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const commentLength = await this.client.LLEN(`comments:${postId}`);
         const comments = await this.client.LRANGE(`comments:${postId}`, 0, -1);
         const listCommentsUsername: string[] = [];
         console.log("🚀 ~ CommentCache ~ getCommentsUsernameFromCache ~ comments:", comments)
         for (const comment of comments) {
            const commentData: ICommentDocument = Helpers.parseJson(comment) as ICommentDocument;
            listCommentsUsername.push(commentData.username);
         }
         return [{ count: commentLength, names: listCommentsUsername }];
      } catch (error) {
         log.error(error)
         throw new InternalServerError('Error while getting comment username to cache ==>' + error)
      }
   }
   public async getSingleCommentFromCache(postId: string, commentId: string) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const comments = await this.client.LRANGE(`comments:${postId}`, 0, -1);
         const listComments: ICommentDocument[] = [];
         for (const comment of comments) {
            listComments.push(Helpers.parseJson(comment));
         }
         const result = find(listComments, (item) => {
            return item._id === commentId
         })
         return result ? [result] : []
      } catch (error) {
         log.error(error)
         throw new InternalServerError('Error while getting single comment to cache ==>' + error)
      }
   }
}
export const commentCache = new CommentCache()