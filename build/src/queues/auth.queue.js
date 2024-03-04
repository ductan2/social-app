"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authQueue = void 0;
const base_queue_1 = require("./base.queue");
const auth_worker_1 = require("../workers/auth.worker");
class AuthQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('AuthQueue');
        this.processJob('addAuthToDB', 5, auth_worker_1.authWorker.addAuthToDB);
        // createUser is the value of the name parameter in the addJob method in the AuthController
        // check controller auth to see the createUser value
    }
    addAuthJob(name, data) {
        this.addJob(name, data);
    }
}
exports.authQueue = new AuthQueue();
//# sourceMappingURL=auth.queue.js.map