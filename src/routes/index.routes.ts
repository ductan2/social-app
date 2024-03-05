import { Router } from "express";
import { authRouter } from "./auth.routes";
import { serverAdapter } from "@root/queues/base.queue";
import { postRouter } from "./post.routes";
import { authMiddleware } from "@middlewares/auth.middleware";
import { reactionRouter } from "./reaction.routes";
import { commentRouter } from "./comment.routes";

const BASE_URL = '/api/v1'
class RouterMain {
   private router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.use('/queues', serverAdapter.getRouter())
      this.router.use(`${BASE_URL}/auth`, authRouter.routes())
      this.router.use(`${BASE_URL}/posts`, authMiddleware.verifyToken, postRouter.routes())
      this.router.use(`${BASE_URL}/reactions`, authMiddleware.verifyToken, reactionRouter.routes())
      this.router.use(`${BASE_URL}/comments`, authMiddleware.verifyToken, commentRouter.routes())
      return this.router;
   }
}
export const routerMain = new RouterMain();