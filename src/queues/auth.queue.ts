import { IAuthJob } from "@interfaces/auth.interface";
import { BaseQueue } from "./base.queue";
import { authWorker } from "@root/workers/auth.worker";

class AuthQueue extends BaseQueue {
   constructor() {
      super('AuthQueue')
      this.processJob('addAuthToDB',5,authWorker.addAuthToDB) 
      // createUser is the value of the name parameter in the addJob method in the AuthController
      // check controller auth to see the createUser value

   }
   public addAuthJob(name: string, data: IAuthJob){
      this.addJob(name, data)
   }
}
export const authQueue = new AuthQueue()