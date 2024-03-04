import { IPostDocument } from "@interfaces/post.interface";
import { JoiValidation } from "@root/decorators/joi-validation.decorator";
import { postSchema, postWithImageSchema } from "@root/schemes/post.scheme";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import HTTP_STATUS from "http-status-codes";
import { postCache } from "@root/redis/post.cache";
import { socketIOPostObject } from "@root/sockets/post";
import { postQueue } from "@root/queues/post.queue";
import { uploads } from "@utils/cloudinary";
import { BadRequestError } from "@interfaces/error.interface";
import { postService } from "@services/post.service";
import { UploadApiResponse } from "cloudinary";
import { imageQueue } from "@root/queues/image.queue";
const PAGE_SIZE = 10

class PostController {
   @JoiValidation(postSchema)
   async createPost(req: Request, res: Response) {
      const { post, bgColor, feelings, privacy, gifUrl, profilePicture } = req.body;
      const postObjectId = new ObjectId()
      const createdPost: IPostDocument = {
         _id: postObjectId,
         userId: req.currentUser!.userId,
         username: req.currentUser!.username,
         email: req.currentUser!.email,
         avatarColor: req.currentUser!.avatarColor,
         profilePicture,
         post,
         bgColor,
         feelings,
         privacy,
         gifUrl,
         commentsCount: 0,
         imgVersion: '',
         imgId: '',
         videoId: '',
         videoVersion: '',
         createdAt: new Date(),
         reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
      } as IPostDocument;
      socketIOPostObject.emit('add post', createdPost)
      await postCache.savePostToCache({
         key: postObjectId,
         currentUserId: req.currentUser!.userId,
         uId: req.currentUser!.uId,
         createdPost
      })
      postQueue.addQueueJob('addPostQueueJob', { userId: req.currentUser!.userId, value: createdPost })

      res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully', post: createdPost });

   }
   @JoiValidation(postWithImageSchema)
   async createPostWithImage(req: Request, res: Response) {
      const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } = req.body;
      const result = await uploads(image);
      if (!result?.public_id) {
         console.log('Error uploading image' + result?.message)
         throw new BadRequestError('Error uploading image');
      }
      const postObjectId = new ObjectId()
      const createdPost: IPostDocument = {
         _id: postObjectId,
         userId: req.currentUser!.userId,
         username: req.currentUser!.username,
         email: req.currentUser!.email,
         avatarColor: req.currentUser!.avatarColor,
         profilePicture,
         post,
         bgColor,
         feelings,
         privacy,
         gifUrl,
         commentsCount: 0,
         imgVersion: result.version.toString(),
         imgId: result.public_id,
         createdAt: new Date(),
         reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
      } as IPostDocument;
      socketIOPostObject.emit('add post', createdPost)
      await postCache.savePostToCache({
         key: postObjectId,
         currentUserId: req.currentUser!.userId,
         uId: req.currentUser!.uId,
         createdPost
      })
      postQueue.addQueueJob('addPostQueueJob', { userId: req.currentUser!.userId, value: createdPost })
      // call image to database 
      res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with image successfully', post: createdPost });

   }
   async getPosts(req: Request, res: Response) {
      const { page } = req.params;
      const skip = (parseInt(page) - 1) * PAGE_SIZE;
      const limit = PAGE_SIZE * parseInt(page);
      const newSkip = skip === 0 ? skip : skip + 1;
      let posts: IPostDocument[] = [] as IPostDocument[]
      const cachePosts = await postCache.getPostsFromCache('posts', newSkip, limit);
      let totalPosts = 0;
      if (cachePosts.length) {
         posts = cachePosts;
         totalPosts = await postCache.getTotalPostsCount();
      }
      else {
         posts = await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });
         totalPosts = await postService.postsCount();
      }
      res.status(HTTP_STATUS.OK).json({ message: 'Posts fetched successfully', posts, totalPosts });
   }
   public async getPostsWithImage(req: Request, res: Response) {
      const { page } = req.params;
      const skip = (parseInt(page) - 1) * PAGE_SIZE;
      const limit = PAGE_SIZE * parseInt(page);
      const newSkip = skip === 0 ? skip : skip + 1;
      let posts: IPostDocument[] = [] as IPostDocument[]
      const cachePosts = await postCache.getPostsWithImageFromCache('posts', newSkip, limit);
      let totalPosts = 0;
      posts = cachePosts.length ? cachePosts : await postService.getPosts({ imgId: "$ne", gifUrl: "$ne" }, skip, limit, { createdAt: -1 });
      res.status(HTTP_STATUS.OK).json({ message: 'Posts with image fetched successfully', posts, totalPosts });
   }
   public async deletePosts(req: Request, res: Response) {
      socketIOPostObject.emit('delete post', req.params.postId)
      await postCache.deletePostFromCache(req.params.postId, req.currentUser?.userId!);
      postQueue.addQueueJob('deletePostQueueJob', { postId: req.params.postId, userId: req.currentUser?.userId! });
      res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
   }
   @JoiValidation(postSchema)
   public async updatePosts(req: Request, res: Response): Promise<void> {

      const { postId } = req.params;


      const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, req.body);
      socketIOPostObject.emit('update post', postUpdated, 'posts');
      postQueue.addQueueJob('updatePostQueueJob', { postId: postId, value: postUpdated });
      res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
   }
   @JoiValidation(postWithImageSchema)
   public async postWithImage(req: Request, res: Response): Promise<void> {
      const { imgId, imgVersion } = req.body;
      if (imgId && imgVersion) {
         this.handleUpdatePost(req);
      } else {
         const result: UploadApiResponse = await PostController.prototype.addImageToExistingPost(req);
         if (!result.public_id) {
            throw new BadRequestError(result.message);
         }
      }
      res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
   }
   private async handleUpdatePost(req: Request): Promise<void> {
      const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture, videoId, videoVersion } = req.body;
      const { postId } = req.params;
      const updatedPost: IPostDocument = {
         post,
         bgColor,
         privacy,
         feelings,
         gifUrl,
         profilePicture,
         imgId: imgId ? imgId : '',
         imgVersion: imgVersion ? imgVersion : '',
         videoId: videoId ? videoId : '',
         videoVersion: videoVersion ? videoVersion : ''
      } as IPostDocument;

      const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
      socketIOPostObject.emit('update post', postUpdated, 'posts');
      postQueue.addQueueJob('updatePostQueueJob', { postId: postId, value: postUpdated });
   }
   private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
      const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image, video } = req.body;
      const { postId } = req.params;
      const result: UploadApiResponse = image
         ? ((await uploads(image)) as UploadApiResponse)
         : ((await uploads(video)) as UploadApiResponse); // handle upload video
      if (!result?.public_id) {
         return result;
      }
      const updatedPost: IPostDocument = {
         post,
         bgColor,
         privacy,
         feelings,
         gifUrl,
         profilePicture,
         imgId: image ? result.public_id : '',
         imgVersion: image ? result.version.toString() : '',
         videoId: video ? result.public_id : '',
         videoVersion: video ? result.version.toString() : ''
      } as IPostDocument;

      const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
      socketIOPostObject.emit('update post', postUpdated, 'posts');
      postQueue.addQueueJob('updatePostQueueJob', { postId: postId, value: postUpdated });
      if (image) {
         imageQueue.addImageJob('addImageToDB', {
            key: `${req.currentUser!.userId}`,
            imgId: result.public_ida,
            imgVersion: result.version.toString()
         });
      }
      return result;
   }
}
export const postController = new PostController();