import { Server } from "socket.io";

export let socketIOPostObject: Server;
export class SocketIOPostHandler {
   private io: Server;
   constructor(io: Server) {
      this.io = io;
      socketIOPostObject = io;
   }
   public listen() {
      this.io.on('connection', (socket) => {
         console.log('a user connected (post socket)');
         // socket.on('disconnect', () => {
         //    console.log('user disconnected');
         // });
      })
   }
}
