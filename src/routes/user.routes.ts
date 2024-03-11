
import { userController } from "@controllers/user.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { Router } from "express";

class UserRouter {
   public router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.get('/suggestions', authMiddleware.checkAuthentication, userController.randomUserSuggestions);
      this.router.get('/profile', authMiddleware.checkAuthentication, userController.getProfile);
      this.router.get("/all/:page", authMiddleware.checkAuthentication, userController.getAllUsers);
      this.router.get('/profile/:userId', authMiddleware.checkAuthentication, userController.getProfileById);
      this.router.get('/profile/posts/:userId/:username/:uId', authMiddleware.checkAuthentication, userController.profileAndPosts);
      this.router.put('/profile/update/change-password', authMiddleware.checkAuthentication, userController.changePassword);
      this.router.put('/profile/update/info', authMiddleware.checkAuthentication, userController.updateInfo);
      this.router.put('/profile/update/social', authMiddleware.checkAuthentication, userController.updateSocial);
      this.router.put('/profile/update/settings', authMiddleware.checkAuthentication, userController.updateNotification);
      return this.router;
   }

}
export const userRouter = new UserRouter();