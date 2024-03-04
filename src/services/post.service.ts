import { IGetPostsQuery, IPostDocument } from "@interfaces/post.interface";
import { PostModel } from "@models/post.model";
import { UserModel } from "@models/user.mode";

class PostService {
   async createPostToDB(userId: string, data: IPostDocument) {
      const post = PostModel.create(data);
      const user = UserModel.findOneAndUpdate({ _id: userId }, { $inc: { postsCount: 1 } }, { new: true });
      await Promise.all([post, user]);
   }
   async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>) {
      let postQuery = {};
      if (query?.imgId && query?.gifUrl) {
         postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $net: '' } }] };
      }
      else postQuery = query

      const posts = await PostModel.aggregate([
         { $match: postQuery },
         { $sort: sort },
         { $skip: skip },
         { $limit: limit },
      ])
      return posts;
   }
   public async postsCount() {
      const count = await PostModel.find({}).countDocuments()
      return count;
   }
   public async deletePostFromDB(postId: string, userId: string) {
      const post = PostModel.findByIdAndDelete(postId).lean();
      //decrement posts count
      const user = UserModel.findOneAndUpdate({ _id: userId }, { $inc: { postsCount: -1 } }, { new: true }).lean();
      await Promise.all([post, user]);
   }
   public async updatePostFromDB(postId: string, value: IPostDocument) {
      return PostModel.findByIdAndUpdate(postId, {
         $set: { value }
      }, { new: true }).lean();
   }
}
export const postService = new PostService();