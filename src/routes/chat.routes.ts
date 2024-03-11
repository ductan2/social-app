

import { chatController } from "@controllers/chat.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { Router } from "express";

class ChatRouter {
   public router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.get("/message/conversations", authMiddleware.checkAuthentication, chatController.getConversationList)
      this.router.get('/message/:receiverId', authMiddleware.checkAuthentication, chatController.getMessages)
      this.router.post('/message', authMiddleware.checkAuthentication, chatController.addChat)
      this.router.post('/message/add-user', authMiddleware.checkAuthentication, chatController.addChatUsers)
      this.router.post('/message/remove-user', authMiddleware.checkAuthentication, chatController.removeChatUsers)
      this.router.put('/message/mark-as-read', authMiddleware.checkAuthentication, chatController.updateMessage)
      this.router.post('/message/reaction', authMiddleware.checkAuthentication, chatController.addMessageReaction)
      this.router.delete(
         '/message/mark-as-deleted/:messageId/:senderId/:receiverId/:type',
         authMiddleware.checkAuthentication, chatController.deleteMarkMessageAsDeleted
      );
      return this.router;
   }

}
export const chatRouter = new ChatRouter();