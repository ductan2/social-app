"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedPostWithImage = exports.updatedPost = exports.postMockData = exports.newPost = exports.postMockResponse = exports.postMockRequest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_mock_1 = require("./user.mock");
const postMockRequest = (body, currentUser, params) => ({
    body,
    params,
    currentUser
});
exports.postMockRequest = postMockRequest;
const postMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
exports.postMockResponse = postMockResponse;
exports.newPost = {
    bgColor: '#f44336',
    post: 'how are you?',
    gifUrl: '',
    imgId: '',
    imgVersion: '',
    image: '',
    privacy: 'Public',
    profilePicture: 'http://place-hold.it/500x500',
    feelings: 'happy'
};
exports.postMockData = {
    _id: new mongoose_1.default.Types.ObjectId('6027f77087c9d9ccb1555268'),
    userId: user_mock_1.existingUser._id,
    username: user_mock_1.existingUser.username,
    email: user_mock_1.existingUser.email,
    avatarColor: user_mock_1.existingUser.avatarColor,
    profilePicture: user_mock_1.existingUser.profilePicture,
    post: 'how are you?',
    bgColor: '#f44336',
    imgId: '',
    imgVersion: '',
    feelings: 'happy',
    gifUrl: '',
    privacy: 'Public',
    commentsCount: 0,
    createdAt: new Date(),
    reactions: {
        like: 0,
        love: 0,
        happy: 0,
        wow: 0,
        sad: 0,
        angry: 0
    }
};
exports.updatedPost = {
    profilePicture: exports.postMockData.profilePicture,
    post: exports.postMockData.post,
    bgColor: exports.postMockData.bgColor,
    feelings: 'wow',
    privacy: 'Private',
    gifUrl: '',
    imgId: '',
    imgVersion: ''
};
exports.updatedPostWithImage = {
    profilePicture: exports.postMockData.profilePicture,
    post: 'Wonderful',
    bgColor: exports.postMockData.bgColor,
    feelings: 'wow',
    privacy: 'Private',
    gifUrl: '',
    imgId: '',
    imgVersion: '',
    image: ''
};
//# sourceMappingURL=post.mock.js.map