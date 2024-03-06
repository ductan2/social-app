import { IFollowerJobData } from "@interfaces/follower.interface";
import { BaseQueue } from "./base.queue";
import { followerWorker } from "@root/workers/follower.worker";

class FollowerQueue extends BaseQueue {
   constructor() {
      super('FollowerQueue')
      this.processJob('addFollowerToDB',5,followerWorker.addFollowerToDB) 
      this.processJob('removeFollowerFromDB',5,followerWorker.removeFollowerFromDB)
      // createUser is the value of the name parameter in the addJob method in the FollowerController
      // check controller follower to see the createUser value

   }
   public addFollowerJob(name: string, data: IFollowerJobData){
      this.addJob(name, data)
   }
}
export const followerQueue = new FollowerQueue()