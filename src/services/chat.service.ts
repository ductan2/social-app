import { IMessageData } from "@interfaces/chat.interface";
import { IConversationDocument } from "@interfaces/conversation.interface";
import { MessageModel } from "@models/chat.mode";
import { ConversationModel } from "@models/conversation.model";
import { ObjectId } from "mongodb";
class ChatService {
   async addChatMessageToDB(data: IMessageData) {
      const conversation: IConversationDocument[] = await ConversationModel.find({ _id: data?.conversationId }).exec();
      if (conversation.length === 0) {
         await ConversationModel.create({
            _id: data?.conversationId,
            senderId: data.senderId,
            receiverId: data.receiverId
         });
      }

      await MessageModel.create({
         _id: data._id,
         conversationId: data.conversationId,
         receiverId: data.receiverId,
         receiverUsername: data.receiverUsername,
         receiverAvatarColor: data.receiverAvatarColor,
         receiverProfilePicture: data.receiverProfilePicture,
         senderUsername: data.senderUsername,
         senderId: data.senderId,
         senderAvatarColor: data.senderAvatarColor,
         senderProfilePicture: data.senderProfilePicture,
         body: data.body,
         isRead: data.isRead,
         gifUrl: data.gifUrl,
         selectedImage: data.selectedImage,
         reaction: data.reaction,
         createdAt: data.createdAt
      });
   }
   public async getUserConversationMessages(userId: ObjectId): Promise<IMessageData[]> {
       
      const messages: IMessageData[] = await MessageModel.aggregate([
         { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
         {
            $group: {
               _id: '$conversationId',
               result: { $last: '$$ROOT' }
            }
         },
         {
            $project: {
               _id: '$result._id',
               conversationId: '$result.conversationId',
               receiverId: '$result.receiverId',
               receiverUsername: '$result.receiverUsername',
               receiverAvatarColor: '$result.receiverAvatarColor',
               receiverProfilePicture: '$result.receiverProfilePicture',
               senderUsername: '$result.senderUsername',
               senderId: '$result.senderId',
               senderAvatarColor: '$result.senderAvatarColor',
               senderProfilePicture: '$result.senderProfilePicture',
               body: '$result.body',
               isRead: '$result.isRead',
               gifUrl: '$result.gifUrl',
               selectedImage: '$result.selectedImage',
               reaction: '$result.reaction',
               createdAt: '$result.createdAt'
            }
         },
         { $sort: { createdAt: 1 } }
      ]);
      return messages;
   }
   public async getMessages(senderId: ObjectId, receiverId: ObjectId, sort: Record<string, 1 | -1>): Promise<IMessageData[]> {
      const query = {
         $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
         ]
      };
      const messages: IMessageData[] = await MessageModel.aggregate([{ $match: query }, { $sort: sort }]);
      return messages;
   }

   public async markMessageAsDeleted(messageId: string, type: 'deleteForMe' | 'deleteForEveryOne'): Promise<void> {
      // delete for me or for everyone
      if (type === 'deleteForMe') {
         await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true } }).lean();
      } else {
         await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true, deleteForEveryone: true } }).lean();
      }
   }
 
   public async markMessagesAsRead(senderId: ObjectId, receiverId: ObjectId): Promise<void> {
      const query = {
         $or: [
            { senderId, receiverId, isRead: false },
            { senderId: receiverId, receiverId: senderId, isRead: false }
         ]
      };
      await MessageModel.updateMany(query, { $set: { isRead: true } }).lean();
   }
   public async updateMessageReaction(messageId: ObjectId, senderName: string, reaction: string, type: 'add' | 'remove'): Promise<void> {
      console.log("🚀 ~ ChatService ~ updateMessageReaction ~ messageId:", messageId)
      if (type === 'add') {
         await MessageModel.updateOne({ _id: messageId }, { $push: { reaction: { senderName, type: reaction } } }).exec();
      } else {
         await MessageModel.updateOne({ _id: messageId }, { $pull: { reaction: { senderName } } }).exec();
      }
   }
}
export const chatService = new ChatService();