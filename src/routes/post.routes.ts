import { postController } from "@controllers/post.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { Router } from "express";

class PostRouter {
   public router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.get('/image/:page', authMiddleware.checkAuthentication, postController.getPostsWithImage);
      this.router.get('/:page', authMiddleware.checkAuthentication, postController.getPosts);
      this.router.post('/', authMiddleware.checkAuthentication, postController.createPost);
      this.router.post('/image', authMiddleware.checkAuthentication, postController.createPostWithImage);
      this.router.delete('/:postId', authMiddleware.checkAuthentication, postController.deletePosts);
      this.router.patch('/:postId', authMiddleware.checkAuthentication, postController.updatePosts);
      return this.router;
   }

}
export const postRouter = new PostRouter();