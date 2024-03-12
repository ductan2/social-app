
import { Server, Socket } from 'socket.io';
import { ISenderReceiver } from '@interfaces/chat.interface';
import { connectedUsersMap } from './user';

export let socketIOChatObject: Server;

export class SocketIOChatHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOChatObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('join room', (data: ISenderReceiver) => {
        const { receiverName, senderName } = data;
        const socketReceiver: string = connectedUsersMap.get(receiverName) as string;
        const socketSender: string = connectedUsersMap.get(senderName) as string;
        socket.join(socketReceiver);
        socket.join(socketSender);
      });
    });
  }
}
