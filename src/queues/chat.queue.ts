
import { chatWorker } from "@root/workers/chat.worket";
import { BaseQueue } from "./base.queue";
import { IChatJobData, IMessageData } from "@interfaces/chat.interface";



class ChatQueue extends BaseQueue {
   constructor() {
      super('ChatQueue')
      this.processJob('addChatToDB', 5, chatWorker.addChatToDB)
      this.processJob('markMessageAsDeletedInDB', 5, chatWorker.markMessageAsDeleted);
      this.processJob('markMessagesAsReadInDB', 5, chatWorker.markMessagesAsReadInDB);
      this.processJob('updateMessageReaction', 5, chatWorker.updateMessageReaction);
   }
   public addChatJob(name: string, data: IChatJobData | IMessageData) {
      this.addJob(name, data)
   }
}
export const chatQueue = new ChatQueue()