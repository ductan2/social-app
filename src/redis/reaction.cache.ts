import Logger from "bunyan";
import { BaseCache } from "./base.cache";
import { config } from "@config/config";
import { IReaction, IReactionDocument } from "@interfaces/reaction.interface";
import { InternalServerError } from "@interfaces/error.interface";
import { find } from "lodash";
import { Helpers } from "@root/helpers";



const log: Logger = config.createLogger('ReactionCache');
class ReactionCache extends BaseCache {
   constructor() {
      super('ReactionCache')
   }
   public async saveReactionToCache(key: string, reaction: IReactionDocument, postReactions: IReaction, type: string, previousReaction: string) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         if (previousReaction) {
            // remove previous reaction
            this.removeReactionFromCache(key, reaction.username, postReactions);
         }
         await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
         const reactionsPost = ['reactions', JSON.stringify(postReactions)];
         await this.client.HSET(`posts:${key}`, reactionsPost);
      } catch (error) {
         log.error(error)
         throw new InternalServerError('Error while saving reaction to cache ==>' + error)
      }
   }
   public async removeReactionFromCache(key: string, username: string, postReactions: IReaction) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const reactions = await this.client.LRANGE(`reactions:${key}`, 0, -1); // get all reactions
         const multi = this.client.multi();
         const previousReaction = await this.getPreviousReaction(reactions, username);
         await this.client.LREM(`reactions:${key}`, 1, JSON.stringify(previousReaction)); // remove reaction from list
         await multi.exec();
         //set reactions to post
         await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
      } catch (error) {
         log.error(error)
         throw new InternalServerError('Error while removing reaction from cache ==>' + error)
      }
   }
   public async getReactionsFromCache(postId: string): Promise<[IReactionDocument[], number]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const reactionLength = await this.client.LLEN(`reactions:${postId}`);
         const reactions = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
         const listReactions: IReactionDocument[] = [];
         for (const reaction of reactions) {
            listReactions.push(Helpers.parseJson(reaction));
         }
         return reactionLength > 0 ? [listReactions, reactionLength] : [[], 0];
      } catch (error) {
         log.error(error)
         throw new InternalServerError('Error while getting reactions from cache ==>' + error)
      }
   }

   public async getReactionByUsername(postId: string, username: string) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const reactions = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
         const listReactions: IReactionDocument[] = [];
         for (const reaction of reactions) {
            listReactions.push(Helpers.parseJson(reaction));
         }
         const result = listReactions.find((reaction) => reaction.username === username && reaction.postId === postId);
         return result ? result : null;
      } catch (error) {
         log.error(error)
         throw new InternalServerError('Error while getting reactions username from cache ==>' + error)
      }
   }
   private async getPreviousReaction(reactions: string[], username: string) {
      const list: IReactionDocument[] = [];
      for (const reaction of reactions) {
         list.push(JSON.parse(reaction));
      }
      return find(list, (listItem) => {
         return listItem.username === username;
      })

   }
}
export const reactionCache = new ReactionCache()


