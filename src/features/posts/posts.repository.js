import path from "path";
import fs from "fs";

import CustomError from "../../errorHandlers/customErrorClass.js";
import CommentsModel from "../comments/comments.model.js";
import LikeModel from "../likes/likes.model.js";
import PostsModel from "./posts.model.js";

export default class PostsRepository {
  async createNewPost(title, body, postImage, userId) {
    const post = new PostsModel({ title, body, postImage, userId });
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

    let postUrlPrev = await PostsModel.findById(postId);
    postUrlPrev = postUrlPrev.postImage;

    if (newData.title || newData.body || newData.postImage) {
      var updatedPost = await PostsModel.findOneAndUpdate(
        {
          userId,
          _id: postId,
        },
        newData,
        { new: true, runValidators: true }
      );
    } else {
      throw new CustomError("Send required data!", 404);
    }

    if (newData.postImage) {
      const relativePath = postUrlPrev.split("/uploads")[1];
      const deletePath = path.resolve("src/uploads" + relativePath);

      fs.unlink(deletePath, (err) => {
        if (err)
          console.log(
            "Error deleting previous avatar after updating it with new one",
            err
          );
        else console.log("Deleted previous avatar after saving new one");
      });
    }

    return updatedPost;
  }
}
