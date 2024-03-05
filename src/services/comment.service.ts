import { ICommentJob, IQueryComment } from "@interfaces/comment.interface";
import { CommentsModel } from "@models/comment.model";
import { PostModel } from "@models/post.model";
import { userCache } from "@root/redis/user.cache";

class CommentService {
   public async addCommentToDB(data: ICommentJob) {
      const { comment, postId, userTo } = data;
      const [comments, post, user] = await Promise.all([
         CommentsModel.create(comment),
         PostModel.findByIdAndUpdate(postId, {
            $inc: { commentsCount: 1 }
         }, { new: true }),
         userCache.getUserFromaCache(userTo)
      ])

      //send notification to user
   }
   public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>) {
      return CommentsModel.aggregate([
         { $match: query },
         { $sort: sort }
      ])
   }
   public async getUserPostComments(query: IQueryComment, sort: Record<string, 1 | -1>) {
      return CommentsModel.aggregate([
         { $match: query },
         { $sort: sort },
         {
            $group: {
               _id: null,
               names: {
                  $addToSet: '$username'
               },
               count: {
                  $sum: 1
               }
            }
         },
         {
            $project: { _id: 0 }
         }
      ])
   }
}
export const commentService = new CommentService();