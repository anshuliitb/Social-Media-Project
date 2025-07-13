import CustomError from "../../errorHandlers/customErrorClass.js";
import CommentsModel from "../comments/comments.model.js";
import LikeModel from "../likes/likes.model.js";
import PostsModel from "./posts.model.js";

export default class PostsRepository {
  async createNewPost(title, body, imageUrl, userId) {
    const post = new PostsModel({ title, body, imageUrl, userId });
    return await post.save();
  }

  async getAllPosts() {
    const posts = await PostsModel.find().populate("userId", "name email");
    return posts;
  }

  async getPostbyId(id) {
    const postFromDb = await PostsModel.findById(id).populate(
      "userId",
      "name email"
    );

    const likeCount = await LikeModel.countDocuments({
      likeable: id,
      onModel: "Post",
    });
    const commentCount = await CommentsModel.countDocuments({ postId: id });

    const postWithCounts = {
      ...postFromDb.toObject(),
      likeCount,
      commentCount,
    };
    return postWithCounts;
  }

  async getUserPosts(id) {
    const posts = await PostsModel.find({ userId: id }).populate(
      "userId",
      "name email"
    );

    return posts;
  }

  async deleteUserPost(userId, postId) {
    if (!(await PostsModel.findById(postId)))
      throw new CustomError("Post not found!", 404);

    const deletedPost = await PostsModel.findOneAndDelete({
      userId,
      _id: postId,
    });
    return deletedPost;
  }

  async updateUserPost(userId, postId, newData) {
    if (!(await PostsModel.findById(postId)))
      throw new CustomError("Post not found!", 404);

    const updatedPost = await PostsModel.findOneAndUpdate(
      {
        userId,
        _id: postId,
      },
      newData,
      { new: true, runValidators: true }
    );

    return updatedPost;
  }
}
