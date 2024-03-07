import { notificationQueue } from "@root/queues/notification.queue";
import { socketIONotificationObject } from "@root/sockets/notification";
import { notificationService } from "@services/notification.service";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
class NotificationController {
   async getNotifications(req: Request, res: Response) {
      const notifications= await notificationService.getNotifications(req.currentUser!.userId);
      res.status(HTTP_STATUS.OK).json({ message: 'User notifications', notifications });
   }
   async updateNotification(req: Request, res: Response) {
      const { notificationId } = req.params;
      socketIONotificationObject.emit('update notification', notificationId);
      notificationQueue.addNotificationJob('updateNotification', { key: notificationId });
      res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read' });
   }
   async deleteNotification(req: Request, res: Response) {
      const { notificationId } = req.params;
      socketIONotificationObject.emit('delete notification', notificationId);
      notificationQueue.addNotificationJob('deleteNotification', { key: notificationId });
      res.status(HTTP_STATUS.OK).json({ message: 'Notification deleted successfully' });
   }
}
export const notificationController = new NotificationController();