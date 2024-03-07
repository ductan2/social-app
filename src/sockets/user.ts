
import { ISocketData } from '@interfaces/user.interface';
import { Server, Socket } from 'socket.io';

export let socketIOUserObject: Server;
export const connectedUsersMap: Map<string, string> = new Map();

export class SocketIOUserHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOUserObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {

      socket.on('block user', (data: ISocketData) => {
        this.io.emit('blocked user id', data);
      });

      socket.on('unblock user', (data: ISocketData) => {
        this.io.emit('unblocked user id', data);
      });

    });
  }

}