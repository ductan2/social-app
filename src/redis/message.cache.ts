import Logger from "bunyan";
import { BaseCache } from "./base.cache";
import { config } from "@config/config";
import { InternalServerError } from "@interfaces/error.interface";
import { IChatList, IChatUsers, IGetMessageFromCache, IMessageData } from "@interfaces/chat.interface";
import { filter, find, findIndex, remove } from "lodash";
import { Helpers } from "@root/helpers";
import { IReaction } from "@interfaces/reaction.interface";
const log: Logger = config.createLogger('MessageCache')
class MessageCache extends BaseCache {
   constructor() {
      super('MessageCache')
   }
   public async addMessageListToCache(senderId: string, receiverId: string, conversationId: string) {
      try {
         if (!this.client.isOpen) {
            await this.client.connect()
         }
         const userChat = await this.client.LRANGE(`chatList:${senderId}`, 0, -1)
         if (userChat.length === 0) {
            this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
         }
         else {
            const findIndex = userChat.findIndex((chat: string) => {
               return chat.includes(receiverId) // check if receiverId is in the list
            })
            if (findIndex === -1) {
               this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
            }
         }
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error saving message to cache ==>' + error);
      }
   }
   public async addChatMessageToCache(conversationId: string, value: IMessageData): Promise<void> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         await this.client.RPUSH(`messages:${conversationId}`, JSON.stringify(value));
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Error saving message to cache.');
      }
   }
   public async addChatUsersToCache(value: IChatUsers): Promise<IChatUsers[]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const users: IChatUsers[] = await this.getChatUsersList();
         const usersIndex: number = findIndex(users, (listItem: IChatUsers) => JSON.stringify(listItem) === JSON.stringify(value));
         let chatUsers: IChatUsers[] = [];
         if (usersIndex === -1) {
            await this.client.RPUSH('chatUsers', JSON.stringify(value));
            chatUsers = await this.getChatUsersList();
         } else {
            chatUsers = users;
         }
         return chatUsers;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }
   public async getUserConversationList(key: string): Promise<IMessageData[]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const userChatList: string[] = await this.client.LRANGE(`chatList:${key}`, 0, -1);
         const conversationChatList: IMessageData[] = [];
         for (const item of userChatList) {
            const chatItem: IChatList = Helpers.parseJson(item) as IChatList;
            const lastMessage: string = (await this.client.LINDEX(`messages:${chatItem.conversationId}`, -1)) as string;
            // ? -1 is a last index of the list in redis
            conversationChatList.push(Helpers.parseJson(lastMessage));
         }
         return conversationChatList;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }
   public async removeChatUsersFromCache(value: IChatUsers): Promise<IChatUsers[]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const users: IChatUsers[] = await this.getChatUsersList();
         const usersIndex: number = findIndex(users, (listItem: IChatUsers) => JSON.stringify(listItem) === JSON.stringify(value));
         let chatUsers: IChatUsers[] = [];
         if (usersIndex > -1) {
            await this.client.LREM('chatUsers', usersIndex, JSON.stringify(value));
            chatUsers = await this.getChatUsersList();
         } else {
            chatUsers = users;
         }
         return chatUsers;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }
   private async getChatUsersList(): Promise<IChatUsers[]> {
      const chatUsersList: IChatUsers[] = [];
      const chatUsers = await this.client.LRANGE('chatUsers', 0, -1);
      for (const item of chatUsers) {
         const chatUser: IChatUsers = Helpers.parseJson(item) as IChatUsers;
         chatUsersList.push(chatUser);
      }
      return chatUsersList;
   }
   public async getChatMessagesFromCache(senderId: string, receiverId: string): Promise<IMessageData[]> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
         const receiver: string = find(userChatList, (listItem: string) => listItem.includes(receiverId)) as string;
         const parsedReceiver: IChatList = Helpers.parseJson(receiver) as IChatList;
         if (parsedReceiver) {
            const userMessages: string[] = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
            const chatMessages: IMessageData[] = [];
            for (const item of userMessages) {
               const chatItem = Helpers.parseJson(item) as IMessageData;
               chatMessages.push(chatItem);
            }
            return chatMessages;
         } else {
            return [];
         }
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }

   public async markMessageAsDeleted(senderId: string, receiverId: string, messageId: string, type: string): Promise<IMessageData> {
      // TODO: function use to delete message for me or for everyone
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const { index, message, receiver } = await this.getMessage(senderId, receiverId, messageId);
         const chatItem = Helpers.parseJson(message) as IMessageData;
         if (type === 'deleteForMe') {
            chatItem.deleteForMe = true;
         } else {
            chatItem.deleteForMe = true;
            chatItem.deleteForEveryone = true;
         }
         await this.client.LSET(`messages:${receiver.conversationId}`, index, JSON.stringify(chatItem));

         const lastMessage: string = (await this.client.LINDEX(`messages:${receiver.conversationId}`, index)) as string;
         return Helpers.parseJson(lastMessage) as IMessageData;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }

   public async updateChatMessages(senderId: string, receiverId: string): Promise<IMessageData> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
         const receiver: string = find(userChatList, (listItem: string) => listItem.includes(receiverId)) as string;
         const parsedReceiver: IChatList = Helpers.parseJson(receiver) as IChatList;
         const messages: string[] = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
         const unreadMessages: string[] = filter(messages, (listItem: string) => !Helpers.parseJson(listItem).isRead);
         for (const item of unreadMessages) {
            const chatItem = Helpers.parseJson(item) as IMessageData;
            const index = findIndex(messages, (listItem: string) => listItem.includes(`${chatItem._id}`));
            chatItem.isRead = true;
            await this.client.LSET(`messages:${chatItem.conversationId}`, index, JSON.stringify(chatItem));
         }
         const lastMessage: string = (await this.client.LINDEX(`messages:${parsedReceiver.conversationId}`, -1)) as string;
         return Helpers.parseJson(lastMessage) as IMessageData;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }
   public async updateMessageReaction(
      conversationId: string,
      messageId: string,
      reaction: string,
      senderName: string,
      type: 'add' | 'remove'
   ): Promise<IMessageData> {
      try {
         if (!this.client.isOpen) {
            await this.client.connect();
         }
         const messages: string[] = await this.client.LRANGE(`messages:${conversationId}`, 0, -1);
         const messageIndex: number = findIndex(messages, (listItem: string) => listItem.includes(messageId));
         const message: string = (await this.client.LINDEX(`messages:${conversationId}`, messageIndex)) as string;
         const parsedMessage: IMessageData = Helpers.parseJson(message) as IMessageData;
         const reactions: IReaction[] = [];
         if (parsedMessage) {
            remove(parsedMessage.reaction, (reaction: IReaction) => reaction.senderName === senderName);
            if (type === 'add') {
               reactions.push({ senderName, type: reaction });
               parsedMessage.reaction = [...parsedMessage.reaction, ...reactions];
               await this.client.LSET(`messages:${conversationId}`, messageIndex, JSON.stringify(parsedMessage));
            } else {
               await this.client.LSET(`messages:${conversationId}`, messageIndex, JSON.stringify(parsedMessage));
            }
         }
         const updatedMessage: string = (await this.client.LINDEX(`messages:${conversationId}`, messageIndex)) as string;
         return Helpers.parseJson(updatedMessage) as IMessageData;
      } catch (error) {
         log.error(error);
         throw new InternalServerError('Server error. Try again.');
      }
   }
   private async getMessage(senderId: string, receiverId: string, messageId: string): Promise<IGetMessageFromCache> {
      const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      const receiver: string = find(userChatList, (listItem: string) => listItem.includes(receiverId)) as string;
      const parsedReceiver: IChatList = Helpers.parseJson(receiver) as IChatList;
      const messages: string[] = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
      const message: string = find(messages, (listItem: string) => listItem.includes(messageId)) as string;
      const index: number = findIndex(messages, (listItem: string) => listItem.includes(messageId));

      return { index, message, receiver: parsedReceiver };
   }
}
export const messageCache = new MessageCache()