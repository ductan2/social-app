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
exports.userCache = exports.UserCache = void 0;
const base_cache_1 = require("./base.cache");
const helpers_1 = require("../helpers");
const error_interface_1 = require("../interfaces/error.interface");
class UserCache extends base_cache_1.BaseCache {
    constructor() {
        super('userCache');
    }
    saveUserToCache(key, userUID, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdAt = new Date();
            const { _id, uId, username, email, avatarColor, blocked, blockedBy, postsCount, profilePicture, followersCount, followingCount, notifications, work, location, school, quote, bgImageId, bgImageVersion, social } = user;
            const dataToSave = {
                '_id': `${_id}`,
                'uId': `${uId}`,
                'username': `${username}`,
                'email': `${email}`,
                'avatarColor': `${avatarColor}`,
                'createdAt': `${createdAt}`,
                'postsCount': `${postsCount}`,
                'blocked': JSON.stringify(blocked),
                'blockedBy': JSON.stringify(blockedBy),
                'profilePicture': `${profilePicture}`,
                'followersCount': `${followersCount}`,
                'followingCount': `${followingCount}`,
                'notifications': JSON.stringify(notifications),
                'social': JSON.stringify(social),
                'work': `${work}`,
                'location': `${location}`,
                'school': `${school}`,
                'quote': `${quote}`,
                'bgImageVersion': `${bgImageVersion}`,
                'bgImageId': `${bgImageId}`
            };
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                yield this.client.ZADD('user', { score: parseInt(userUID, 10), value: `${key}` });
                yield this.client.HSET(`users:${key}`, dataToSave);
            }
            catch (error) {
                throw new error_interface_1.InternalServerError('Error while saving user to cache');
            }
        });
    }
    getUserFromaCache(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🚀 ~ UserCache ~ getUserFromaCache ~ userId:", userId);
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const user = yield this.client.HGETALL(`users:${userId}`);
                user.createdAt = new Date(helpers_1.Helpers.parseJson(`${user.createdAt}`));
                user.postsCount = helpers_1.Helpers.parseJson(`${user.postsCount}`);
                user.blocked = helpers_1.Helpers.parseJson(`${user.blocked}`);
                user.blockedBy = helpers_1.Helpers.parseJson(`${user.blockedBy}`);
                user.notifications = helpers_1.Helpers.parseJson(`${user.notifications}`);
                user.social = helpers_1.Helpers.parseJson(`${user.social}`);
                user.followersCount = helpers_1.Helpers.parseJson(`${user.followersCount}`);
                user.followingCount = helpers_1.Helpers.parseJson(`${user.followingCount}`);
                user.bgImageId = helpers_1.Helpers.parseJson(`${user.bgImageId}`);
                user.bgImageVersion = helpers_1.Helpers.parseJson(`${user.bgImageVersion}`);
                user.profilePicture = helpers_1.Helpers.parseJson(`${user.profilePicture}`);
                user.work = helpers_1.Helpers.parseJson(`${user.work}`);
                user.school = helpers_1.Helpers.parseJson(`${user.school}`);
                user.location = helpers_1.Helpers.parseJson(`${user.location}`);
                user.quote = helpers_1.Helpers.parseJson(`${user.quote}`);
                return user;
            }
            catch (error) {
                throw new error_interface_1.InternalServerError('Error while getting user from cache');
            }
        });
    }
}
exports.UserCache = UserCache;
exports.userCache = new UserCache();
//# sourceMappingURL=user.cache.js.map