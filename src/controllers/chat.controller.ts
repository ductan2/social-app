import { IMessageData, IMessageNotification } from "@interfaces/chat.interface";
import { BadRequestError } from "@interfaces/error.interface";
import { notificationTemplate } from "@root/emails/templates/notification/notification-template";
import { emailQueue } from "@root/queues/email.queue";
import { userCache } from "@root/redis/user.cache";
import { socketIOChatObject } from "@root/sockets/chat";
import { uploads } from "@utils/cloudinary";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import HTTP_STATUS from "http-status-codes";
import { messageCache } from "@root/redis/message.cache";
import { JoiValidation } from "@root/decorators/joi-validation.decorator";
import { addChatSchema, markChatSchema } from "@root/schemas/chat.schema";
import { chatQueue } from "@root/queues/chat.queue";
import { chatService } from "@services/chat.service";
class ChatController {
   @JoiValidation(addChatSchema)
   public async addChat(req: Request, res: Response) {
      /* 
      TODO: add receiver to list cache , add sender to list cache
      TODO: add message to message cache
      TODO: add message to chat queue 
       */
      let {
         conversationId,
         receiverId,
         receiverUsername,
         receiverAvatarColor,
         receiverProfilePicture,
         body,
         gifUrl,
         isRead,
         selectedImage
      } = req.body;
      let fileUrl = '';
      const messageObjectId: ObjectId = new ObjectId();
      const conversationObjectId = !conversationId ? new ObjectId() : new mongoose.Types.ObjectId(conversationId);
      const sender = await userCache.getUserFromCache(`${req.currentUser?.userId}`)
      if (selectedImage.length) {
         const result = await uploads(req.body.image, req.currentUser?.userId!, true, true)
         if (!result?.public_id) {
            throw new BadRequestError('Error uploading image');
         }
         fileUrl = result.secure_url;
      }
      const messageData: IMessageData = {
         _id: `${messageObjectId}`,
         conversationId: new mongoose.Types.ObjectId(conversationObjectId),
         receiverId,
         receiverAvatarColor,
         receiverProfilePicture,
         receiverUsername,
         senderUsername: `${req.currentUser!.username}`,
         senderId: `${req.currentUser!.userId}`,
         senderAvatarColor: `${req.currentUser!.avatarColor}`,
         senderProfilePicture: `${sender.profilePicture}`,
         body,
         isRead,
         gifUrl,
         selectedImage: fileUrl,
         reaction: [],
         createdAt: new Date(),
         deleteForEveryone: false,
         deleteForMe: false
      };
      ChatController.prototype.emitSocketIOEvent(messageData);
      if (!messageData.isRead) {
         ChatController.prototype.messageNotification({
            currentUser: req.currentUser!,
            message: messageData.body,
            receiverId: messageData.receiverId,
            receiverName: messageData.receiverUsername
         });
      }
      await messageCache.addMessageListToCache(`${req.currentUser!.userId}`, receiverId, `${conversationObjectId}`);
      await messageCache.addMessageListToCache(receiverId, `${req.currentUser!.userId}`, `${conversationObjectId}`);
      await messageCache.addChatMessageToCache(`${conversationObjectId}`, messageData);
      chatQueue.addChatJob('addChatToDB', messageData);
      res.status(HTTP_STATUS.CREATED).json({ message: 'Message sent', conversationId: conversationObjectId });
   }

   public async addChatUsers(req: Request, res: Response) {
      const chatUsers = await messageCache.addChatUsersToCache(req.body);
      socketIOChatObject.emit('add chat users', chatUsers);
      res.status(HTTP_STATUS.OK).json({ message: 'Users added' });
   }

   public async removeChatUsers(req: Request, res: Response) {
      const chatUsers = await messageCache.removeChatUsersFromCache(req.body);
      socketIOChatObject.emit('add chat users', chatUsers);
      res.status(HTTP_STATUS.OK).json({ message: 'Users removed' });
   }

   public async addMessageReaction(req: Request, res: Response) {
      const { conversationId, messageId, reaction, type } = req.body;
      console.log(req.currentUser?.username)
      const updatedMessage: IMessageData = await messageCache.updateMessageReaction(
         `${conversationId}`,
         `${messageId}`,
         `${reaction}`,
         `${req.currentUser!.username}`,
         type
      );
      socketIOChatObject.emit('message reaction', updatedMessage);
      chatQueue.addChatJob('updateMessageReaction', {
         messageId: new mongoose.Types.ObjectId(messageId),
         senderName: req.currentUser!.username,
         reaction,
         type
      });
      res.status(HTTP_STATUS.OK).json({ message: 'Message reaction added' });
   }
   public async deleteMarkMessageAsDeleted(req: Request, res: Response): Promise<void> {
      const { senderId, receiverId, messageId, type } = req.params;
      const updatedMessage: IMessageData = await messageCache.markMessageAsDeleted(`${senderId}`, `${receiverId}`, `${messageId}`, type);
      socketIOChatObject.emit('message read', updatedMessage);
      socketIOChatObject.emit('chat list', updatedMessage);
      chatQueue.addChatJob('markMessageAsDeletedInDB', {
         messageId: new mongoose.Types.ObjectId(messageId),
         type
      });

      res.status(HTTP_STATUS.OK).json({ message: 'Message marked as deleted' });
   }


   private emitSocketIOEvent(data: IMessageData): void {
      socketIOChatObject.emit('message received', data);
      socketIOChatObject.emit('chat list', data);
   }
   private async messageNotification(messageData: Omit<IMessageNotification, 'messageData'>) {
      const { currentUser, message, receiverId } = messageData;
      const cacheUser = await userCache.getUserFromCache(`${receiverId}`)
      if (cacheUser) {
         const dataNotificatino = {
            username: currentUser.username,
            header: 'New Message',
            message,
         }
         const template: string = notificationTemplate.notificationMessageTemplate(dataNotificatino);
         emailQueue.addEmailJob('directMessageEmail', {
            to: cacheUser.email!,
            html: template,
            subject: `Messages from ${currentUser.username}`,
            text: `You've received messages from ${currentUser.username}`
         });
      }
   }
   public async getMessages(req: Request, res: Response): Promise<void> {
      const { receiverId } = req.params;

      let messages: IMessageData[] = [];
      const cachedMessages: IMessageData[] = await messageCache.getChatMessagesFromCache(`${req.currentUser!.userId}`, `${receiverId}`);
      if (cachedMessages.length) {
         messages = cachedMessages;
      } else {
         messages = await chatService.getMessages(
            new mongoose.Types.ObjectId(req.currentUser!.userId),
            new mongoose.Types.ObjectId(receiverId),
            { createdAt: 1 }
         );
      }

      res.status(HTTP_STATUS.OK).json({ message: 'User chat messages', messages });
   }
   public async getConversationList(req: Request, res: Response): Promise<void> {
      console.log(req.currentUser!.userId)
      const cachedList: IMessageData[] = await messageCache.getUserConversationList(`${req.currentUser!.userId}`);
      const listConversation = cachedList.length ? cachedList : await chatService.getUserConversationMessages(new mongoose.Types.ObjectId(req.currentUser!.userId));
      console.log("🚀 ~ ChatController ~ getConversationList ~ cachedList:", cachedList)

      res.status(HTTP_STATUS.OK).json({ message: 'User conversation list', conversations: listConversation });
   }
   @JoiValidation(markChatSchema)
   public async updateMessage(req: Request, res: Response): Promise<void> {
      const { senderId, receiverId } = req.body;
      const updatedMessage: IMessageData = await messageCache.updateChatMessages(`${senderId}`, `${receiverId}`);
      socketIOChatObject.emit('message read', updatedMessage);
      socketIOChatObject.emit('chat list', updatedMessage);
      chatQueue.addChatJob('markMessagesAsReadInDB', {
         senderId: new mongoose.Types.ObjectId(senderId),
         receiverId: new mongoose.Types.ObjectId(receiverId)
      });
      res.status(HTTP_STATUS.OK).json({ message: 'Message marked as read' });
   }
}

export const chatController = new ChatController()