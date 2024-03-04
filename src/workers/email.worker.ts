import { config } from "@config/config";
import { emailTransport } from "@root/emails/email.transport";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";
const log: Logger = config.createLogger('EmailWorker');
class EmailWorker {
   async addNotificationJob(job: Job, done: DoneCallback) {
      try {
         const { html, to, subject, text } = job.data;
         await emailTransport.sendEmail({ html, to, subject, text });
         job.progress(100); // use this to update the progress of the job 
         done(null, job.data); 
      } catch (error) {
         log.error(error);
         done(error as Error); // use this to send the error to the queue
      }
   }
}
export const emailWorker = new EmailWorker();