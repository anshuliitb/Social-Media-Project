import mongoose from "mongoose";

import CommentsRepository from "./comments.repository.js";
import CommentsModel from "./comments.model.js";
import PostsModel from "../posts/posts.model.js";

export default class CommentsController {
  constructor() {
    this.commentsRepository = new CommentsRepository();
  }

  async createComment(req, res, next) {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid post ID!",
        });
      }

      const comment = await this.commentsRepository.addNewComment({
        postId,
        content,
        userId,
      });

      res.status(201).send({
        success: true,
        message: "Comment created successfully",
        response: comment,
      });
    } catch (error) {
      console.log(error);

      res.status(400).send({
        success: false,
        message: "Comment not created!",
        error: error.message,
      });
    }
  }

  async getComments(req, res, next) {
    try {
      const { postId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid post ID!",
        });
      }

      const comments = await this.commentsRepository.getPostComments(postId);

      if (!comments == []) {
        res.send({
          success: true,
          message: "Comment to the post retrieved successfully",
          response: comments,
        });
      } else {
        res.send({
          success: true,
          message: "No comments made to the post yet!",
        });
      }
    } catch (error) {
      console.log(error);

      res.status(500).send({
        success: false,
        message: "Server side error!",
        error: error.message,
      });
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { commentId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid comment ID!",
        });
      }

      const comment = await CommentsModel.findById(commentId);

      if (!comment)
        return res.status(404).send({
          success: false,
          message: "Comment not found!",
        });

      const post = await PostsModel.findById(comment.postId);

      if (!post)
        return res.status(404).send({
          success: false,
          message: "Post not found!",
        });

      const isCommentator = comment.userId == req.user._id ? true : false;
      const isPostOwner = post.userId == req.user._id ? true : false;

      if (isCommentator || isPostOwner) {
        const deletedComment = await this.commentsRepository.deleteOneComment(
          commentId
        );

        res.send({
          success: true,
          message: "Comment deleted successfully",
          response: deletedComment,
        });
      } else {
        res.status(401).send({
          success: false,
          message:
            "You must be the owner of post or owner of comment to delete it!",
        });
      }
    } catch (error) {
      console.log(error);

      res.status(500).send({
        success: false,
        message: "Server side error!",
        error: error.message,
      });
    }
  }

  async updateComment(req, res, next) {
    try {
      const { commentId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid comment ID!",
        });
      }

      const comment = await CommentsModel.findById(commentId);

      if (!comment)
        return res.status(404).send({
          success: false,
          message: "Comment not found!",
        });

      const post = await PostsModel.findById(comment.postId);

      if (!post)
        return res.status(404).send({
          success: false,
          message: "Post not found!",
        });

      const isCommentator = comment.userId == req.user._id ? true : false;
      const isPostOwner = post.userId == req.user._id ? true : false;

      if (isCommentator || isPostOwner) {
        const updatedComment = await this.commentsRepository.updateOneComment(
          commentId,
          req.body
        );

        res.send({
          success: true,
          message: "Comment updated successfully",
          response: updatedComment,
        });
      } else {
        res.status(401).send({
          success: false,
          message:
            "You must be the owner of post or owner of comment to update it!",
        });
      }
    } catch (error) {
      console.log(error);

      res.status(500).send({
        success: false,
        message: "Server side error!",
        error: error.message,
      });
    }
  }
}
