import { ICommentDocument } from "@interfaces/comment.interface";
import { IReaction } from "@interfaces/reaction.interface";
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
         socket.on('reaction', (reaction: IReaction) => {
            this.io.emit('update like', reaction);
         })
         socket.on('comment', (comment: ICommentDocument) => {
            this.io.emit('update comment', comment);
         })
      })
   }
}
