
import { config } from "@config/config";
import { postService } from "@services/post.service";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";

const log: Logger = config.createLogger('postWorker')
class PostWorker {
   async addPostToDB(job: Job, done: DoneCallback) {
      try {
         const { value, userId } = job.data
         await postService.createPostToDB(userId, value);
         job.progress(100)
         done(null, job.data)
      } catch (error) {
         log.error(error)
         done(error as Error)
      }
   }
   async deletePostFromDB(job: Job, done: DoneCallback) {
      try {
         const { postId, userId } = job.data;
         await postService.deletePostFromDB(postId, userId);
         job.progress(100)
         done(null, job.data)
      } catch (error) {
         log.error(error)
         done(error as Error)
      }

   }
   async updatePostInDB(job: Job, done: DoneCallback) {
      try {
         const { postId, value } = job.data;
         await postService.updatePostFromDB(postId, value);
         job.progress(100)
         done(null, job.data)
      } catch (error) {
         log.error(error)
         done(error as Error)
      }
   }
}
export const postWorker = new PostWorker()