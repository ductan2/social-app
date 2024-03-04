"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userQueue = void 0;
const base_queue_1 = require("./base.queue");
const user_worker_1 = require("../workers/user.worker");
class UserQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('UserQueue');
        this.processJob('addUserToDB', 5, user_worker_1.userWorker.addUserToDB);
        // createUser is the value of the name parameter in the addJob method in the UserController
        // check controller user to see the createUser value
    }
    addUserJob(name, data) {
        this.addJob(name, data);
    }
}
exports.userQueue = new UserQueue();
//# sourceMappingURL=user.queue.js.map