
import { config } from "@config/config";

import { userService } from "@services/user.service";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";

const log: Logger = config.createLogger('userWorker')
class UserWorker {
   async addUserToDB(job: Job, done: DoneCallback) {
      try {
         const { value } = job.data
         await userService.addUserData(value)
         job.progress(100)
         done(null, job.data)
      } catch (error) {
         log.error(error)
         done(error as Error)
      }
   }
   async blockUser(job: Job, done: DoneCallback) {
      try {
         const { userId, blockedId, type } = job.data
         if (type === 'block') {
            await userService.blockUserInDB(userId, blockedId)
         }
         else {
            await userService.unblockUserInDB(userId, blockedId)
         }
         job.progress(100)
         done(null, job.data)
      } catch (error) {
         log.error(error)
         done(error as Error)
      }
   }
   async updateUserInfo(job: Job, done: DoneCallback): Promise<void> {
      try {
         const { key, value } = job.data;
         await userService.updateUserInfo(key, value);
         job.progress(100);
         done(null, job.data);
      } catch (error) {
         log.error(error);
         done(error as Error);
      }
   }

   async updateSocialLinks(job: Job, done: DoneCallback): Promise<void> {
      try {
         const { key, value } = job.data;
         await userService.updateSocialLinks(key, value);
         job.progress(100);
         done(null, job.data);
      } catch (error) {
         log.error(error);
         done(error as Error);
      }
   }
   async updateNotificationSettings(job: Job, done: DoneCallback): Promise<void> {
      try {
         const { key, value } = job.data;
         await userService.updateNotificationSettings(key, value);
         job.progress(100);
         done(null, job.data);
      } catch (error) {
         log.error(error);
         done(error as Error);
      }
   }
}
export const userWorker = new UserWorker()