import { IFollowerData } from "@interfaces/follower.interface";
import { IUserDocument } from "@interfaces/user.interface";
import { followerCache } from "@root/redis/follower.cache";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { userCache } from "@root/redis/user.cache";
import { socketIOFollowerObject } from "@root/sockets/follower";
import HTTP_STATUS from "http-status-codes";
import { BadRequestError } from "@interfaces/error.interface";
import { followerQueue } from "@root/queues/follower.queue";
import { followerService } from "@services/follower.service";
import { userWorker } from "@root/workers/user.worker";
import { userQueue } from "@root/queues/user.queue";
class FollowerController {
   async addFollower(req: Request, res: Response) {
      const { followerId } = req.params;
      console.log(req.currentUser)
      if (followerId === req.currentUser?.userId) {
         throw new BadRequestError('You cannot follow yourself');
      }
      const cacheFollowers = userCache.getUserFromCache(followerId);
      const cacheFollowing = userCache.getUserFromCache(req.currentUser?.userId!);
      const response: [IUserDocument, IUserDocument] = await Promise.all([cacheFollowers, cacheFollowing]);
      if (!response[0]._id || !response[1]._id) {
         throw new BadRequestError('User not found');
      }
      const followersCount = followerCache.updateFollowersCountInCache(followerId, 'followersCount', 1);
      const followingCount = followerCache.updateFollowersCountInCache(req.currentUser?.userId!, 'followingCount', 1);
      Promise.all([followersCount, followingCount]);

      const followerObjectId: ObjectId = new ObjectId();
      const addFolloweeData: IFollowerData = FollowerController.prototype.userData(response[0]);
      socketIOFollowerObject.emit('add follower', addFolloweeData);

      const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(`following:${req.currentUser!.userId}`, `${followerId}`);
      const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(`followers:${followerId}`, `${req.currentUser!.userId}`);
      await Promise.all([addFollowerToCache, addFolloweeToCache]);
      followerQueue.addFollowerJob('addFollowerToDB', {
         followerId: req.currentUser!.userId,
         followingId: `${followerId}`,
         username: req.currentUser!.username,
         followerDocumentId: followerObjectId
      })
      res.status(HTTP_STATUS.OK).json({ message: 'Follower added successfully' });
   }
   async removeFollower(req: Request, res: Response) {
      const { followerId, followingId } = req.params;
      if (followerId === followingId) {
         throw new BadRequestError('You cannot remove yourself as a follower');
      }
      const cacheFollowers = await userCache.getUserFromCache(followerId);
      const cacheFollowing = await userCache.getUserFromCache(followingId);
      if (!cacheFollowers._id || !cacheFollowing._id) {
         throw new BadRequestError('User not found');
      }
      const removeFollowerCache = followerCache.removeFollowerFromCache(`followers:${followerId}`, `${followingId}`);
      const removeFollowingCache = followerCache.removeFollowerFromCache(`following:${followingId}`, `${followerId}`);
      const updateFollowerCount = followerCache.updateFollowersCountInCache(followerId, 'followersCount', -1);
      const updateFollowingCount = followerCache.updateFollowersCountInCache(followingId, 'followingCount', -1);

      const response = await Promise.all([removeFollowerCache, removeFollowingCache, updateFollowerCount, updateFollowingCount]);
      followerQueue.addFollowerJob('removeFollowerFromDB', {
         followerId: followerId,
         followingId: `${followingId}`,
      })
      res.status(HTTP_STATUS.OK).json({ message: 'Follower removed successfully' });
   }
   async getUserFollowers(req: Request, res: Response) {
      const { followerId } = req.params;
      const followerCacheData = await followerCache.getFollowersFromCache(`followers:${followerId}`);
      const result = followerCacheData.length ? followerCacheData : await followerService.getFollowerData(new ObjectId(followerId));
      res.status(HTTP_STATUS.OK).json({ message: 'User followers fetched successfully', followers: result });
   }
   async getUserFollowing(req: Request, res: Response) {
      const followingCacheData = await followerCache.getFollowersFromCache(`following:${req.currentUser?.userId}`);
      const result = followingCacheData.length ? followingCacheData : await followerService.getFollowingData(new ObjectId(req.currentUser?.userId));
      res.status(HTTP_STATUS.OK).json({ message: 'User following fetched successfully', following: result });
   }

   async blockUser(req: Request, res: Response) {
      const { userBlockId } = req.params;
      if (userBlockId === req.currentUser?.userId) {
         throw new BadRequestError('You cannot block yourself');
      }
      await FollowerController.prototype.updateBlockedUser(userBlockId, req.currentUser?.userId!, 'block');

      userQueue.addUserJob('blockUserInDB', {
         userId: req.currentUser?.userId, blockedId: userBlockId, type: 'block'
      })
      res.status(HTTP_STATUS.OK).json({ message: 'User blocked successfully' });
   }
   async unBlockUser(req: Request, res: Response) {
      const { userBlockId } = req.params;
      if (userBlockId === req.currentUser?.userId) {
         throw new BadRequestError('You cannot unblock yourself');
      }
      await FollowerController.prototype.updateBlockedUser(userBlockId, req.currentUser?.userId!, 'unblock');
      userQueue.addUserJob('blockUserInDB', {
         userId: req.currentUser?.userId, blockedId: userBlockId, type: 'unblock'
      })
      res.status(HTTP_STATUS.OK).json({ message: 'User blocked successfully' });
   }
   private async updateBlockedUser(blockedId: string, userId: string, type: 'block' | 'unblock'): Promise<void> {
      const blocked: Promise<void> = followerCache.updateBlockedUserPropInCache({
         key: `${userId}`,
         field: 'blocked',
         value: blockedId,
         type: type
      });
      const blockedBy: Promise<void> = followerCache.updateBlockedUserPropInCache({
         key: `${blockedId}`,
         field: 'blockedBy',
         value: userId,
         type: type
      });
      await Promise.all([blocked, blockedBy]);
   }
   private userData(user: IUserDocument): IFollowerData {
      return {
         _id: new mongoose.Types.ObjectId(user._id),
         username: user.username!,
         avatarColor: user.avatarColor!,
         postCount: user.postsCount,
         followersCount: user.followersCount,
         followingCount: user.followingCount,
         profilePicture: user.profilePicture,
         uId: user.uId!,
         userProfile: user
      };
   }
}
export const followerController = new FollowerController();