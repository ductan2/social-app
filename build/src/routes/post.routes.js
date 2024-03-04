"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = void 0;
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_1 = require("express");
class PostRouter {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.get('/image/:page', auth_middleware_1.authMiddleware.checkAuthentication, post_controller_1.postController.getPostsWithImage);
        this.router.get('/:page', auth_middleware_1.authMiddleware.checkAuthentication, post_controller_1.postController.getPosts);
        this.router.post('/', auth_middleware_1.authMiddleware.checkAuthentication, post_controller_1.postController.createPost);
        this.router.post('/image', auth_middleware_1.authMiddleware.checkAuthentication, post_controller_1.postController.createPostWithImage);
        this.router.delete('/:postId', auth_middleware_1.authMiddleware.checkAuthentication, post_controller_1.postController.deletePosts);
        this.router.patch('/:postId', auth_middleware_1.authMiddleware.checkAuthentication, post_controller_1.postController.updatePosts);
        return this.router;
    }
}
exports.postRouter = new PostRouter();
//# sourceMappingURL=post.routes.js.map