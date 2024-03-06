import {  IFollowers } from "@interfaces/follower.interface";
import { Server } from "socket.io";

export let socketIOFollowerObject: Server;
export class SocketIOFollowerObject {
   private io: Server;
   constructor(io: Server) {
      this.io = io;
      socketIOFollowerObject = io;
   }
   public listen() {
      this.io.on('connection', (socket) => {
         socket.emit('unfollow user', (data: IFollowers) => {
            this.io.emit('remove follower', data);
         })
      })
   }
}
