import logger from "@config/logger";
import { BaseCache } from "./base.cache";


class RedisConnection extends BaseCache {
   constructor() {
      super('redisConnection')
   }
   async connection() {
      try {
         await this.client.connect().then(() => {
            logger.info("Connected to Redis successfully!")
         });
      } catch (error) {
         logger.error(error)
         this.log.error(error)
      }
   }
}
export const redisConnection = new RedisConnection();