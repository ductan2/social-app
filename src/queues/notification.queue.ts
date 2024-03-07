import { INotificationJobData } from "@interfaces/notification.interface";
import { BaseQueue } from "./base.queue";
import { notificationWorker } from "@root/workers/notification.worker";

class NotificationQueue extends BaseQueue {
   constructor() {
      super('NotificationQueue')
      this.processJob('updateNotification', 5, notificationWorker.updateNotification);
      this.processJob('deleteNotification', 5, notificationWorker.deleteNotification);

   }
   async addNotificationJob(name: string, data: INotificationJobData) {
      this.addJob(name, data)
   }
}
export const notificationQueue = new NotificationQueue()