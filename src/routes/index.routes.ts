import { Router } from "express";
import { authRouter } from "./auth.routes";
import { serverAdapter } from "@root/queues/base.queue";
import { postRouter } from "./post.routes";
import { authMiddleware } from "@middlewares/auth.middleware";
import { reactionRouter } from "./reaction.routes";
import { commentRouter } from "./comment.routes";
import { followerRouter } from "./follower.routes";
import { notificationRouter } from "./notification.routes";
import { imageRouter } from "./image.routes";
import { chatRouter } from "./chat.routes";
import { userRouter } from "./user.routes";
import { healthRoutes } from "./healthy.routes";

const BASE_URL = '/api/v1'
class RouterMain {
   private router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.use('', healthRoutes.health());
      this.router.use('', healthRoutes.env());
      this.router.use('', healthRoutes.instance());
      this.router.use('', healthRoutes.fiboRoutes());
      this.router.use('/queues', serverAdapter.getRouter())
      this.router.use(`${BASE_URL}/auth`, authRouter.routes())
      this.router.use(`${BASE_URL}/posts`, authMiddleware.verifyToken, postRouter.routes())
      this.router.use(`${BASE_URL}/reactions`, authMiddleware.verifyToken, reactionRouter.routes())
      this.router.use(`${BASE_URL}/comments`, authMiddleware.verifyToken, commentRouter.routes())
      this.router.use(`${BASE_URL}`, authMiddleware.verifyToken, followerRouter.routes())
      this.router.use(`${BASE_URL}/notification`, authMiddleware.verifyToken, notificationRouter.routes())
      this.router.use(`${BASE_URL}/image`, authMiddleware.verifyToken, imageRouter.routes())
      this.router.use(`${BASE_URL}/chat`, authMiddleware.verifyToken, chatRouter.routes())
      this.router.use(`${BASE_URL}/user`, userRouter.routes())
      return this.router;
   }
}
export const routerMain = new RouterMain();