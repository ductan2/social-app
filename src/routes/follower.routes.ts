
import { followerController } from "@controllers/follower.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { Router } from "express";

class FollowerRouter {
   public router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.put('/follow/user/:followerId', authMiddleware.checkAuthentication, followerController.addFollower);
      this.router.put('/unfollow/user/:followerId/:followingId', authMiddleware.checkAuthentication, followerController.removeFollower);
      this.router.get('/followers/user/:followerId', authMiddleware.checkAuthentication, followerController.getUserFollowers);
      this.router.get('/following/user', authMiddleware.checkAuthentication, followerController.getUserFollowing);
      this.router.put('/block/user/:userBlockId', authMiddleware.checkAuthentication, followerController.blockUser);
      this.router.put('/unblock/user/:userBlockId', authMiddleware.checkAuthentication, followerController.unBlockUser)

      return this.router;
   }

}
export const followerRouter = new FollowerRouter();