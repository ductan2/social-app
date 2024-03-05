
import { config } from "@config/config";
import { reactionService } from "@services/reaction.service";
import { DoneCallback, Job } from "bull";

import Logger from "bunyan";

const log: Logger = config.createLogger('reactionWorker')
class ReactionWorker {
   async addReactionToDB(job: Job, done: DoneCallback) {
      try {
         const { data } = job;
         await reactionService.addReactionFromDB(data);
         job.progress(100)
         done(null, data)
      } catch (error) {
         log.error(error)
         done(error as Error)
      }
   }
   async removeReactionFromDB(job: Job, done: DoneCallback) {
      try {
         const { data } = job;
         await reactionService.removeReactionFromDB(data);
         job.progress(100)
         done(null, data)
      } catch (error) {
         log.error(error)
         done(error as Error)
      }
   }
}
export const reactionWorker = new ReactionWorker()