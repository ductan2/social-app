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
exports.postService = void 0;
const post_model_1 = require("../models/post.model");
const user_mode_1 = require("../models/user.mode");
class PostService {
    createPostToDB(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = post_model_1.PostModel.create(data);
            const user = user_mode_1.UserModel.findOneAndUpdate({ _id: userId }, { $inc: { postsCount: 1 } }, { new: true });
            yield Promise.all([post, user]);
        });
    }
    getPosts(query, skip = 0, limit = 0, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            let postQuery = {};
            if ((query === null || query === void 0 ? void 0 : query.imgId) && (query === null || query === void 0 ? void 0 : query.gifUrl)) {
                postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $net: '' } }] };
            }
            else
                postQuery = query;
            const posts = yield post_model_1.PostModel.aggregate([
                { $match: postQuery },
                { $sort: sort },
                { $skip: skip },
                { $limit: limit },
            ]);
            return posts;
        });
    }
    postsCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield post_model_1.PostModel.find({}).countDocuments();
            return count;
        });
    }
    deletePostFromDB(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = post_model_1.PostModel.findByIdAndDelete(postId).lean();
            //decrement posts count
            const user = user_mode_1.UserModel.findOneAndUpdate({ _id: userId }, { $inc: { postsCount: -1 } }, { new: true }).lean();
            yield Promise.all([post, user]);
        });
    }
    updatePostFromDB(postId, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return post_model_1.PostModel.findByIdAndUpdate(postId, {
                $set: { value }
            }, { new: true }).lean();
        });
    }
}
exports.postService = new PostService();
//# sourceMappingURL=post.service.js.map