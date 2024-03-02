import { config } from "@config/config";
import { authService } from "@services/auth.service";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";

const log: Logger = config.createLogger('authWorker')
class AuthWorker {
   async addAuthToDB(job: Job, done: DoneCallback){
      try {
         const { value } = job.data
         await authService.createAuthUser(value)
         job.progress(100)
         done(null, job.data)
      } catch (error) {
         log.error(error)
         done(error as Error)
      }
   }
}
export const authWorker = new AuthWorker()