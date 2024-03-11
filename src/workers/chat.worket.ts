import { config } from "@config/config";
import { chatService } from "@services/chat.service";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";

const log: Logger = config.createLogger('chatWorker')
class ChatWorker {
   public async addChatToDB(job: Job, done: DoneCallback) {
      try {
         const { data } = job;
         await chatService.addChatMessageToDB(data);
         job.progress(100);
         done(null, job.data);
      } catch (error) {
         log.error(error);
         done(error as Error);
      }
   }
   async markMessageAsDeleted(jobQueue: Job, done: DoneCallback): Promise<void> {
      try {
        const { messageId, type } = jobQueue.data;
        await chatService.markMessageAsDeleted(messageId, type);
        jobQueue.progress(100);
        done(null, jobQueue.data);
      } catch (error) {
        log.error(error);
        done(error as Error);
      }
    }
  
    async markMessagesAsReadInDB(jobQueue: Job, done: DoneCallback): Promise<void> {
      try {
        const { senderId, receiverId } = jobQueue.data;
        await chatService.markMessagesAsRead(senderId, receiverId);
        jobQueue.progress(100);
        done(null, jobQueue.data);
      } catch (error) {
        log.error(error);
        done(error as Error);
      }
    }
  
    async updateMessageReaction(jobQueue: Job, done: DoneCallback): Promise<void> {
      try {
        const { messageId, senderName, reaction, type } = jobQueue.data;
        await chatService.updateMessageReaction(messageId, senderName, reaction, type);
        jobQueue.progress(100);
        done(null, jobQueue.data);
      } catch (error) {
        log.error(error);
        done(error as Error);
      }
    }
}
export const chatWorker = new ChatWorker()