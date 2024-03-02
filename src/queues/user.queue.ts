

import { BaseQueue } from "./base.queue";
import { userWorker } from "@root/workers/user.worker";

class UserQueue extends BaseQueue {
   constructor() {
      super('UserQueue')
      this.processJob('addUserToDB',5,userWorker.addUserToDB) 
      // createUser is the value of the name parameter in the addJob method in the UserController
      // check controller user to see the createUser value

   }
   public addUserJob(name: string, data: any){
      this.addJob(name, data)
   }
}
export const userQueue = new UserQueue()