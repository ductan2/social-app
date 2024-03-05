import { reactionController } from "@controllers/reaction.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { Router } from "express";

class ReactionRouter {
   public router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.post('/post', authMiddleware.checkAuthentication, reactionController.createReaction);
      this.router.get('/post/:postId', reactionController.getReaction);
      this.router.get('/user/:username', reactionController.getSingleReactionsByUsername);
      this.router.get('/post/:postId/:username', reactionController.getReactionByUsername);
      this.router.delete('/post/:postId/:previousReaction/:postReactions', authMiddleware.checkAuthentication, reactionController.removeReaction);
      return this.router;
   }

}
export const reactionRouter = new ReactionRouter();