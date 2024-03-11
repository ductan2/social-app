
import { ISocketData } from '@interfaces/user.interface';
import { Server, Socket } from 'socket.io';

export let socketIOUserObject: Server;
export const connectedUsersMap: Map<string, string> = new Map();
export let users: string[] = []
export class SocketIOUserHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOUserObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('setup', (userId: string) => {
        this.addClientToMap(userId, socket.id);
        this.addUserToRoom(userId);
      })
      socket.on('block user', (data: ISocketData) => {
        this.io.emit('blocked user id', data);
      });

      socket.on('unblock user', (data: ISocketData) => {
        this.io.emit('unblocked user id', data);
      });
      socket.on('disconnect', () => {
        this.removeClientToMap(socket.id);
      })

    });
  }
  private addClientToMap(userId: string, socketId: string) {
    if (!connectedUsersMap.has(userId)) {
      connectedUsersMap.set(userId, socketId);
    }
  }
  private removeClientToMap(socketId: string) {
    if (Array.from(connectedUsersMap.keys()).includes(socketId)) {
      const disconnectedUser: [string, string] = [...connectedUsersMap].find((user) => user[1] === socketId) as [string, string];
      connectedUsersMap.delete(disconnectedUser[0]);
    }
  }
  private addUserToRoom(userId: string) {
    users.push(userId)
    users = [...new Set(users)]
  }
  private removeUserFromRoom(userId: string) {
    users = users.filter((name) => name !== userId)
  }
}
