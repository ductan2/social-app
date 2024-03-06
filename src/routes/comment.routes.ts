import { commentController } from "@controllers/comment.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { Router } from "express";

class CommentRouter {
   public router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.post('/', authMiddleware.checkAuthentication, commentController.createComment);

      this.router.get('/:postId', authMiddleware.checkAuthentication, commentController.getComments);
      this.router.get('/names/:postId', authMiddleware.checkAuthentication, commentController.getCommentsNames);
      this.router.get('/single/:postId/:commentId', authMiddleware.checkAuthentication, commentController.getSingleComment);
      return this.router;
   }

}
export const commentRouter = new CommentRouter();