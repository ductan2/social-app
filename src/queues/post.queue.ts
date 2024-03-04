
import { BaseQueue } from "@queues/base.queue";
import { postWorker } from "@root/workers/post.worker";

class PostQueue extends BaseQueue {
   constructor() {
      super('PostQueue')
      this.processJob('addPostQueueJob', 5, postWorker.addPostToDB)
      this.processJob('deletePostQueueJob', 5, postWorker.deletePostFromDB)
      this.processJob('updatePostQueueJob', 5, postWorker.updatePostInDB)
      // createUser is the value of the name parameter in the addJob method in the UserController
      // check controller user to see the createUser value

   }
   public addQueueJob(name: string, data: any) {
      this.addJob(name, data)
   }
}
export const postQueue = new PostQueue()