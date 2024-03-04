"use strict";
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
exports.postCache = void 0;
const base_cache_1 = require("./base.cache");
const config_1 = require("../configs/config");
const error_interface_1 = require("../interfaces/error.interface");
const helpers_1 = require("../helpers");
const log = config_1.config.createLogger('PostCache');
class PostCache extends base_cache_1.BaseCache {
    constructor() {
        super('PostCache');
    }
    savePostToCache(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { createdPost, currentUserId, key, uId } = data;
            const { _id, userId, username, email, avatarColor, profilePicture, post, bgColor, feelings, privacy, gifUrl, commentsCount, imgVersion, imgId, videoId, videoVersion, reactions, createdAt } = createdPost;
            const dataToSave = {
                '_id': `${_id}`,
                'userId': `${userId}`,
                'username': `${username}`,
                'email': `${email}`,
                'avatarColor': `${avatarColor}`,
                'profilePicture': `${profilePicture}`,
                'post': `${post}`,
                'bgColor': `${bgColor}`,
                'feelings': `${feelings}`,
                'privacy': `${privacy}`,
                'gifUrl': `${gifUrl}`,
                'commentsCount': `${commentsCount}`,
                'reactions': JSON.stringify(reactions),
                'imgVersion': `${imgVersion}`,
                'imgId': `${imgId}`,
                'videoId': `${videoId}`,
                'videoVersion': `${videoVersion}`,
                'createdAt': `${createdAt}`
            };
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const postsCount = yield this.client.hGet(`users:${currentUserId}`, 'postsCount'); // get posts count from user
                const multi = this.client.multi();
                // use multi to execute multiple commands if one fails all fails
                multi.ZADD('posts', { score: parseInt(uId, 10), value: `${key}` });
                multi.HSET(`posts:${key}`, dataToSave);
                const count = parseInt(postsCount[0], 10) + 1; // increment posts count by 1
                multi.HSET(`users:${currentUserId}`, { 'postsCount': `${count}` });
                multi.exec();
            }
            catch (error) {
                log.error(`Error while save post from cache ==> ${error}`);
                throw new error_interface_1.InternalServerError(`Error while save post from cache ==> ${error}`);
            }
        });
    }
    getPostsFromCache(key = 'posts', start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const posts = yield this.client.zRange(key, start, end);
                // get Posts with reverse order from cache (REV:true means reverse order)
                const multi = this.client.multi();
                for (const value of posts) {
                    multi.HGETALL(`posts:${value}`);
                }
                const result = yield multi.exec();
                const postsArray = [];
                for (const res of result) {
                    res.commentsCount = helpers_1.Helpers.parseJson(`${res.commentsCount}`);
                    res.reactions = helpers_1.Helpers.parseJson(`${res.reactions}`);
                    res.createdAt = new Date(helpers_1.Helpers.parseJson(`${res.createdAt}`));
                    postsArray.push(res);
                }
                return postsArray;
            }
            catch (error) {
                log.error(`Error while getting posts from cache ==> ${error}`);
                throw new error_interface_1.InternalServerError(`Error while getting posts from cache ==> ${error}`);
            }
        });
    }
    getTotalPostsCount(key = 'posts') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const count = yield this.client.ZCARD(key);
                return count;
            }
            catch (error) {
                log.error(`Error while getting total posts count from cache ==> ${error}`);
                throw new error_interface_1.InternalServerError(`Error while getting total posts count from cache ==> ${error}`);
            }
        });
    }
    getPostsWithImageFromCache(key = 'posts', start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const posts = yield this.client.ZRANGE(key, start, end); // auto REV:true means reverse order
                const multi = this.client.multi();
                for (const value of posts) {
                    multi.HGETALL(`posts:${value}`);
                }
                const result = yield multi.exec();
                const postsImageArray = [];
                for (const res of result) {
                    if ((res.imgId && res.imgVersion) || res.gifUrl) {
                        res.commentsCount = helpers_1.Helpers.parseJson(`${res.commentsCount}`);
                        res.reactions = helpers_1.Helpers.parseJson(`${res.reactions}`);
                        res.createdAt = new Date(helpers_1.Helpers.parseJson(`${res.createdAt}`));
                        postsImageArray.push(res);
                    }
                }
                return postsImageArray;
            }
            catch (error) {
                log.error(`Error while getting posts image from cache ==> ${error}`);
                throw new error_interface_1.InternalServerError(`Error while getting posts image from cache ==> ${error}`);
            }
        });
    }
    getTotalUserPostInCache(uId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const result = yield this.client.ZCOUNT('posts', uId, uId);
                return result;
            }
            catch (error) {
                log.error(`Error while getting total user posts count from cache ==> ${error}`);
                throw new error_interface_1.InternalServerError(`Error while getting total user posts count from cache ==> ${error}`);
            }
        });
    }
    deletePostFromCache(key, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const postCount = yield this.client.HMGET(`users:${currentUserId}`, 'postsCount');
                const multi = this.client.multi();
                multi.ZREM('posts', `${key}`);
                multi.DEL(`posts:${key}`);
                multi.DEL(`comments:${key}`);
                multi.DEL(`reactions:${key}`);
                const count = parseInt(postCount[0], 10) - 1;
                multi.HSET(`users:${currentUserId}`, 'postsCount', count);
                yield multi.exec();
            }
            catch (error) {
                log.error(error);
                throw new error_interface_1.InternalServerError('Error while deleting post from cache ==>' + error);
            }
        });
    }
    updatePostInCache(key, updatedPost) {
        return __awaiter(this, void 0, void 0, function* () {
            const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, videoId, videoVersion, profilePicture } = updatedPost;
            const dataToSave = {
                'post': `${post}`,
                'bgColor': `${bgColor}`,
                'feelings': `${feelings}`,
                'privacy': `${privacy}`,
                'gifUrl': `${gifUrl}`,
                'videoId': `${videoId}`,
                'videoVersion': `${videoVersion}`,
                'profilePicture': `${profilePicture}`,
                'imgVersion': `${imgVersion}`,
                'imgId': `${imgId}`
            };
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
                    yield this.client.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
                }
                const multi = this.client.multi();
                multi.HGETALL(`posts:${key}`);
                const reply = (yield multi.exec());
                const postReply = reply;
                postReply[0].commentsCount = helpers_1.Helpers.parseJson(`${postReply[0].commentsCount}`);
                postReply[0].reactions = helpers_1.Helpers.parseJson(`${postReply[0].reactions}`);
                postReply[0].createdAt = new Date(helpers_1.Helpers.parseJson(`${postReply[0].createdAt}`));
                return postReply[0];
            }
            catch (error) {
                log.error(error);
                throw new error_interface_1.InternalServerError('Error while updating post in cache ==>' + error);
            }
        });
    }
}
exports.postCache = new PostCache();
//# sourceMappingURL=post.cache.js.map