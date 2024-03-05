import { ICommentJob } from "@interfaces/comment.interface";
import { BaseQueue } from "./base.queue";
import { commentWorker } from "@root/workers/comment.worker";


class CommentQueue extends BaseQueue {
   constructor() {
      super('CommentQueue')
      this.processJob('addCommentToDB',5,commentWorker.addCommentToDB) 
      // createUser is the value of the name parameter in the addJob method in the CommentController
      // check controller comment to see the createUser value

   }
   public addCommentJob(name: string, data: ICommentJob){
      this.addJob(name, data)
   }
}
export const commentQueue = new CommentQueue()