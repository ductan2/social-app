"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postQueue = void 0;
const base_queue_1 = require("./base.queue");
const post_worker_1 = require("../workers/post.worker");
class PostQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('PostQueue');
        this.processJob('addPostQueueJob', 5, post_worker_1.postWorker.addPostToDB);
        this.processJob('deletePostQueueJob', 5, post_worker_1.postWorker.deletePostFromDB);
        this.processJob('updatePostQueueJob', 5, post_worker_1.postWorker.updatePostInDB);
        // createUser is the value of the name parameter in the addJob method in the UserController
        // check controller user to see the createUser value
    }
    addQueueJob(name, data) {
        this.addJob(name, data);
    }
}
exports.postQueue = new PostQueue();
//# sourceMappingURL=post.queue.js.map