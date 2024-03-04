"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const postServer = __importStar(require("../../sockets/post"));
const post_cache_1 = require("../../redis/post.cache");
const post_queue_1 = require("../../queues/post.queue");
const post_controller_1 = require("../../controllers/post.controller");
const post_mock_1 = require("../mock/post.mock");
const auth_mock_1 = require("../mock/auth.mock");
jest.useFakeTimers();
jest.mock('@queues/base.queue');
jest.mock('@root/redis/post.cache');
Object.defineProperties(postServer, {
    socketIOPostObject: {
        value: new socket_io_1.Server(),
        writable: true
    }
});
describe('Delete', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const req = (0, post_mock_1.postMockRequest)(post_mock_1.newPost, auth_mock_1.authUserPayload, { postId: '12345' });
        const res = (0, post_mock_1.postMockResponse)();
        jest.spyOn(postServer.socketIOPostObject, 'emit');
        jest.spyOn(post_cache_1.postCache, 'deletePostFromCache');
        jest.spyOn(post_queue_1.postQueue, 'addQueueJob');
        yield post_controller_1.postController.deletePosts(req, res);
        expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('delete post', req.params.postId);
        expect(post_cache_1.postCache.deletePostFromCache).toHaveBeenCalledWith(req.params.postId, `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`);
        expect(post_queue_1.postQueue.addQueueJob).toHaveBeenCalledWith('deletePostQueueJob', { postId: req.params.postId, userId: (_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.userId });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Post deleted successfully'
        });
    }));
});
//# sourceMappingURL=delete.post.test.js.map