"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOPostHandler = exports.socketIOPostObject = void 0;
class SocketIOPostHandler {
    constructor(io) {
        this.io = io;
        exports.socketIOPostObject = io;
    }
    listen() {
        this.io.on('connection', (socket) => {
            console.log('a user connected (post socket)');
            // socket.on('disconnect', () => {
            //    console.log('user disconnected');
            // });
        });
    }
}
exports.SocketIOPostHandler = SocketIOPostHandler;
//# sourceMappingURL=post.js.map