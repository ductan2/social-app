import { IEmailJob } from "@interfaces/user.interface";
import { BaseQueue } from "./base.queue";
import { emailWorker } from "@root/workers/email.worker";

class EmailQueue extends BaseQueue {
   constructor() {
      super('EmailQueue')
      this.processJob('forgotPassword', 5, emailWorker.addNotificationEmail)
      this.processJob('commentsEmail', 5, emailWorker.addNotificationEmail);
      this.processJob('followersEmail', 5, emailWorker.addNotificationEmail);
      this.processJob('directMessageEmail',5,emailWorker.addNotificationEmail)
   }
   async addEmailJob(name: string, data: IEmailJob) {
      this.addJob(name, data)
   }
}
export const emailQueue = new EmailQueue()