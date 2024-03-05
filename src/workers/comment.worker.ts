
import { config } from "@config/config";
import { authService } from "@services/auth.service";
import { commentService } from "@services/comment.service";

import { DoneCallback, Job } from "bull";
import Logger from "bunyan";

const log: Logger = config.createLogger('commentWorker')
class CommentWorker {
   async addCommentToDB(job: Job, done: DoneCallback) {
      try {
         const { data } = job
         await commentService.addCommentToDB(data)
         job.progress(100)
         done(null, data);
      } catch (error) {
         log.error(error)
         done(error as Error)
      }
   }
}
export const commentWorker = new CommentWorker()