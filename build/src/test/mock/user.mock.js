"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userJwt = exports.searchedUserMock = exports.mergedAuthAndUserData = exports.existingUserTwo = exports.existingUser = exports.mockExistingUser = void 0;
exports.mockExistingUser = {
    notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
    },
    social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
    },
    blocked: [],
    blockedBy: [],
    followersCount: 1,
    followingCount: 2,
    postsCount: 2,
    bgImageVersion: '',
    bgImageId: '',
    profilePicture: 'http://place-hold.it/500x500',
    _id: '60263f14648fed5246e322d9',
    work: 'KickChat Inc.',
    school: 'University of Benin',
    location: 'Dusseldorf, Germany',
    quote: 'Sky is my limit',
    createdAt: new Date()
};
exports.existingUser = {
    notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
    },
    social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
    },
    blocked: [],
    blockedBy: [],
    followersCount: 1,
    followingCount: 2,
    postsCount: 2,
    bgImageVersion: '',
    bgImageId: '',
    profilePicture: 'http://place-hold.it/500x500',
    _id: '60263f14648fed5246e322d9',
    uId: '1621613119252066',
    username: 'Manny',
    email: 'manny@me.com',
    avatarColor: 'red',
    work: 'KickChat Inc.',
    school: 'University of Benin',
    location: 'Dusseldorf, Germany',
    quote: 'Sky is my limit',
    createdAt: new Date()
};
exports.existingUserTwo = {
    notifications: {
        messages: false,
        reactions: true,
        comments: true,
        follows: false
    },
    social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
    },
    blocked: [],
    blockedBy: [],
    followersCount: 1,
    followingCount: 2,
    postsCount: 2,
    bgImageVersion: '',
    bgImageId: '',
    profilePicture: 'http://place-hold.it/500x500',
    _id: '60263f14648fed5246e322d8',
    uId: '1621613119252065',
    username: 'Danny',
    email: 'danny@me.com',
    avatarColor: '#9c27b1',
    work: 'KickChat Inc.',
    school: 'University of Benin',
    location: 'Dusseldorf, Germany',
    quote: 'Sky is my limit',
    createdAt: new Date()
};
exports.mergedAuthAndUserData = {
    notifications: {
        messages: false,
        reactions: true,
        comments: true,
        follows: false
    },
    social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
    },
    blocked: [],
    blockedBy: [],
    followersCount: 1,
    followingCount: 2,
    postsCount: 2,
    bgImageVersion: '',
    bgImageId: '',
    profilePicture: 'http://place-hold.it/500x500',
    _id: '60263f14648fed5246e322d8',
    authId: '60263f14648fed5246e322d3',
    uId: '1621613119252066',
    username: 'Manny',
    email: 'manny@me.com',
    avatarColor: '#9c27b0',
    work: 'KickChat Inc.',
    school: 'University of Benin',
    location: 'Dusseldorf, Germany',
    quote: 'Sky is my limit',
    createdAt: '2022-08-31T07:42:24.451Z'
};
exports.searchedUserMock = {
    profilePicture: 'http://place-hold.it/500x500',
    _id: '60263f14648fed5246e322d5',
    uId: '1621613119252062',
    username: 'Kenny',
    email: 'ken@me.com',
    avatarColor: '#9c27b1'
};
exports.userJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
//# sourceMappingURL=user.mock.js.map