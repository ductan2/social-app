
import { config } from "@config/config";
import { followerCache } from "@root/redis/follower.cache";
import { authService } from "@services/auth.service";
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
            await userService.blockUserToDB(userId, blockedId)
         }
         else {
            await userService.unBlockUserToDB(userId, blockedId)
         }
         job.progress(100)
         done(null, job.data)
      } catch (error) {
         log.error(error)
         done(error as Error)
      }
   }
}
export const userWorker = new UserWorker()