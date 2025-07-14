import LikeModel from "../likes/likes.model.js";
import CommentsModel from "./comments.model.js";

export default class CommentsRepository {
  async addNewComment(comment) {
    const newComment = new CommentsModel(comment);
    return await newComment.save();
  }

  async getPostComments(postId) {
    const comments = await CommentsModel.find({ postId }).populate(
      "userId",
      "name email"
    );

    const commentsWithLikes = await Promise.all(
      comments.map(async (comment) => {
        const likeCount = await LikeModel.countDocuments({
          likeable: comment._id,
        });

        return {
          ...comment.toObject(),
          likeCount,
        };
      })
    );

    return commentsWithLikes;
  }

  async deleteOneComment(commentId) {
    const deletedComment = await CommentsModel.findByIdAndDelete({
      _id: commentId,
    });
    return deletedComment;
  }

  async updateOneComment(commentId, update) {
    const updatedComment = await CommentsModel.findByIdAndUpdate(
      commentId,
      { ...update },
      { new: true, runValidators: true }
    );
    return updatedComment;
  }
}
