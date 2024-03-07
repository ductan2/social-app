
import { notificationController } from "@controllers/notification.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { Router } from "express";

class NotificationRouter {
   public router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.get("", authMiddleware.checkAuthentication, notificationController.getNotifications);
      this.router.put('/update/:notificationId', authMiddleware.checkAuthentication, notificationController.updateNotification);
      this.router.delete('/delete/:notificationId', authMiddleware.checkAuthentication, notificationController.deleteNotification);
      return this.router;
   }

}
export const notificationRouter = new NotificationRouter();