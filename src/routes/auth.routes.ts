import { authController } from "@controllers/auth.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { Router } from "express";

class AuthRouter {
   public router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.post('/register', authController.register);
      this.router.post('/login', authController.login);
      this.router.get('/logout', authController.logout);
      this.router.get('/me', authMiddleware.verifyToken, authMiddleware.checkAuthentication, authController.currentUser)
      return this.router;
   }
}
export const authRouter = new AuthRouter();