import { IEmailOptions } from "@interfaces/user.interface";
import { BaseQueue } from "./base.queue";
import { emailWorker } from "@root/workers/email.worker";

class EmailQueue extends BaseQueue {
   constructor() {
      super('EmailQueue')
      this.processJob('forgotPassword', 5, emailWorker.addNotificationJob)
   }
   async addEmailJob(name: string, data: IEmailOptions) {
      this.addJob(name, data)
   }
}
export const emailQueue = new EmailQueue()