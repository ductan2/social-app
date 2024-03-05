
import { IReactionJob } from "@interfaces/reaction.interface";
import { BaseQueue } from "@queues/base.queue";
import { reactionWorker } from "@root/workers/reaction.worker";

class ReactionQueue extends BaseQueue {
   constructor() {
      super('ReactionQueue')
      this.processJob('addReactionToDB',5,reactionWorker.addReactionToDB)
      this.processJob('removeReactionFromDB',5,reactionWorker.removeReactionFromDB)
      // createReaction is the value of the name parameter in the addJob method in the ReactionController
      // check controller reaction to see the createReaction value

   }
   public addReactionJob(name: string, data: IReactionJob){
      this.addJob(name, data)
   }
}
export const reactionQueue = new ReactionQueue()