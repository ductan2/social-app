"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postController = void 0;
const joi_validation_decorator_1 = require("../decorators/joi-validation.decorator");
const post_scheme_1 = require("../schemes/post.scheme");
const mongodb_1 = require("mongodb");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const post_cache_1 = require("../redis/post.cache");
const post_1 = require("../sockets/post");
const post_queue_1 = require("../queues/post.queue");
const cloudinary_1 = require("../utils/cloudinary");
const error_interface_1 = require("../interfaces/error.interface");
const post_service_1 = require("../services/post.service");
const PAGE_SIZE = 10;
class PostController {
    createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { post, bgColor, feelings, privacy, gifUrl, profilePicture } = req.body;
            const postObjectId = new mongodb_1.ObjectId();
            const createdPost = {
                _id: postObjectId,
                userId: req.currentUser.userId,
                username: req.currentUser.username,
                email: req.currentUser.email,
                avatarColor: req.currentUser.avatarColor,
                profilePicture,
                post,
                bgColor,
                feelings,
                privacy,
                gifUrl,
                commentsCount: 0,
                imgVersion: '',
                imgId: '',
                videoId: '',
                videoVersion: '',
                createdAt: new Date(),
                reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
            };
            post_1.socketIOPostObject.emit('add post', createdPost);
            yield post_cache_1.postCache.savePostToCache({
                key: postObjectId,
                currentUserId: req.currentUser.userId,
                uId: req.currentUser.uId,
                createdPost
            });
            post_queue_1.postQueue.addQueueJob('addPostQueueJob', { userId: req.currentUser.userId, value: createdPost });
            res.status(http_status_codes_1.default.CREATED).json({ message: 'Post created successfully', post: createdPost });
        });
    }
    createPostWithImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } = req.body;
            const result = yield (0, cloudinary_1.uploads)(image);
            if (!(result === null || result === void 0 ? void 0 : result.public_id)) {
                console.log('Error uploading image' + (result === null || result === void 0 ? void 0 : result.message));
                throw new error_interface_1.BadRequestError('Error uploading image');
            }
            const postObjectId = new mongodb_1.ObjectId();
            const createdPost = {
                _id: postObjectId,
                userId: req.currentUser.userId,
                username: req.currentUser.username,
                email: req.currentUser.email,
                avatarColor: req.currentUser.avatarColor,
                profilePicture,
                post,
                bgColor,
                feelings,
                privacy,
                gifUrl,
                commentsCount: 0,
                imgVersion: result.version.toString(),
                imgId: result.public_id,
                createdAt: new Date(),
                reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
            };
            post_1.socketIOPostObject.emit('add post', createdPost);
            yield post_cache_1.postCache.savePostToCache({
                key: postObjectId,
                currentUserId: req.currentUser.userId,
                uId: req.currentUser.uId,
                createdPost
            });
            post_queue_1.postQueue.addQueueJob('addPostQueueJob', { userId: req.currentUser.userId, value: createdPost });
            // call image to database 
            res.status(http_status_codes_1.default.CREATED).json({ message: 'Post created with image successfully', post: createdPost });
        });
    }
    getPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page } = req.params;
            const skip = (parseInt(page) - 1) * PAGE_SIZE;
            const limit = PAGE_SIZE * parseInt(page);
            const newSkip = skip === 0 ? skip : skip + 1;
            let posts = [];
            const cachePosts = yield post_cache_1.postCache.getPostsFromCache('posts', newSkip, limit);
            let totalPosts = 0;
            if (cachePosts.length) {
                posts = cachePosts;
                totalPosts = yield post_cache_1.postCache.getTotalPostsCount();
            }
            else {
                posts = yield post_service_1.postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });
                totalPosts = yield post_service_1.postService.postsCount();
            }
            res.status(http_status_codes_1.default.OK).json({ message: 'Posts fetched successfully', posts, totalPosts });
        });
    }
    getPostsWithImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page } = req.params;
            const skip = (parseInt(page) - 1) * PAGE_SIZE;
            const limit = PAGE_SIZE * parseInt(page);
            const newSkip = skip === 0 ? skip : skip + 1;
            let posts = [];
            const cachePosts = yield post_cache_1.postCache.getPostsWithImageFromCache('posts', newSkip, limit);
            let totalPosts = 0;
            posts = cachePosts.length ? cachePosts : yield post_service_1.postService.getPosts({ imgId: "$ne", gifUrl: "$ne" }, skip, limit, { createdAt: -1 });
            res.status(http_status_codes_1.default.OK).json({ message: 'Posts with image fetched successfully', posts, totalPosts });
        });
    }
    deletePosts(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            post_1.socketIOPostObject.emit('delete post', req.params.postId);
            yield post_cache_1.postCache.deletePostFromCache(req.params.postId, (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId);
            post_queue_1.postQueue.addQueueJob('deletePostQueueJob', { postId: req.params.postId, userId: (_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.userId });
            res.status(http_status_codes_1.default.OK).json({ message: 'Post deleted successfully' });
        });
    }
    updatePosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId } = req.params;
            const postUpdated = yield post_cache_1.postCache.updatePostInCache(postId, req.body);
            post_1.socketIOPostObject.emit('update post', postUpdated, 'posts');
            post_queue_1.postQueue.addQueueJob('updatePostInDB', { postId: postId, value: postUpdated });
            res.status(http_status_codes_1.default.OK).json({ message: 'Post updated successfully' });
        });
    }
}
__decorate([
    (0, joi_validation_decorator_1.JoiValidation)(post_scheme_1.postSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createPost", null);
__decorate([
    (0, joi_validation_decorator_1.JoiValidation)(post_scheme_1.postWithImageSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createPostWithImage", null);
__decorate([
    (0, joi_validation_decorator_1.JoiValidation)(post_scheme_1.postSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updatePosts", null);
exports.postController = new PostController();
//# sourceMappingURL=post.controller.js.map