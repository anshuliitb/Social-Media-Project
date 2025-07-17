import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import PostsRepository from "./posts.repository.js";
import CustomError from "../../errorHandlers/customErrorClass.js";
import PostsModel from "./posts.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class PostsController {
  constructor() {
    this.postsRepository = new PostsRepository();
  }

  async createPost(req, res, next) {
    try {
      const { title, body } = req.body;

      const imagePath = req.file?.path.replace(/\\/g, "/").replace("src/", "");
      const imageUrl = `${req.protocol}://${req.get("host")}/${imagePath}`;

      const post = await this.postsRepository.createNewPost(
        title,
        body,
        imageUrl,
        req.user._id
      );

      res.status(201).send({
        success: true,
        message: "Post created successfully",
        response: post,
      });
    } catch (error) {
      console.log(error);

      const savedImagePath = req.file?.path;
      if (savedImagePath) {
        try {
          await fs.promises.unlink(savedImagePath);
          console.log("Deleted saved post image file as error occurred!");
        } catch (err) {
          console.error("Error deleting post image after failure:", err);
          throw new Error("Error deleting post image after failure!");
        }
      }

      res.status(400).send({
        success: false,
        message: "Post not created!",
        error: error.message,
      });
    }
  }

  async postById(req, res, next) {
    try {
      const { postId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid post ID!",
        });
      }

      const post = await this.postsRepository.getPostbyId(postId);
      if (post) {
        return res.send({
          success: true,
          message: "Post found successfully",
          response: post,
        });
      } else {
        return res.status(404).send({
          success: false,
          message: "Post not found!",
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

  async AllPosts(req, res, next) {
    try {
      const posts = await this.postsRepository.getAllPosts();
      if (!posts == []) {
        return res.send({
          success: true,
          message: "All posts retrieved successfully",
          response: posts,
        });
      } else {
        return res.status(404).send({
          success: false,
          message: "No post published yet by anyone!",
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

  async userPosts(req, res, next) {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid user ID!",
        });
      }

      const posts = await this.postsRepository.getUserPosts(userId);
      if (!posts == []) {
        return res.send({
          success: true,
          message: "All posts from the user retrieved successfully",
          response: posts,
        });
      } else {
        return res.status(404).send({
          success: false,
          message: "No post published yet by the user!",
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

  async deletePost(req, res, next) {
    try {
      const { postId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid post ID!",
        });
      }

      const deletedPost = await this.postsRepository.deleteUserPost(
        req.user._id,
        postId
      );

      if (deletedPost) {
        const imageUrl = deletedPost.postImage;
        const imageSubPath = imageUrl.split("/uploads/")[1];
        const savedImagePath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          imageSubPath
        );

        if (savedImagePath) {
          try {
            await fs.promises.unlink(savedImagePath);
            console.log("Deleted saved post image file as post was deleted");
          } catch (err) {
            console.error("Error deleting post image after failure:", err);
            throw new Error("Error deleting post image after failure:");
          }
        }

        return res.send({
          success: true,
          message: "Post deleted successfully",
          response: deletedPost,
        });
      } else {
        return res.status(401).send({
          success: false,
          message: "User can only delete his own post!",
        });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) return next(error);

      res.status(500).send({
        success: false,
        message: "Server side error!",
        error: error.message,
      });
    }
  }

  async updatePost(req, res, next) {
    try {
      const { postId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid post ID!",
        });
      }

      let PostUserId = await PostsModel.findById(postId);
      PostUserId = PostUserId.userId;

      if (req.user._id != PostUserId) {
        if (req.file) {
          const savedImagePath = req.file.path;
          if (savedImagePath) {
            fs.unlink(savedImagePath, (err) => {
              if (err)
                console.log(
                  "Error deleting update post image upload tried by another user!",
                  err
                );
              else
                console.log(
                  "Deleted update post image file as update tried by another user!"
                );
            });
          }
        }
        return res.status(401).send({
          success: false,
          message: "User can only update his own post!",
        });
      }

      const imagePath = req.file?.path.replace(/\\/g, "/").replace("src/", "");
      const imageUrl = imagePath
        ? `${req.protocol}://${req.get("host")}/${imagePath}`
        : undefined;

      const updatedPost = await this.postsRepository.updateUserPost(
        req.user._id,
        postId,
        {
          ...req.body,
          ...(imageUrl && { postImage: imageUrl }),
        }
      );

      if (updatedPost) {
        return res.send({
          success: true,
          message: "Post updated successfully",
          response: updatedPost,
        });
      } else {
        return res.status(401).send({
          success: false,
          message: "User can only update his own post!",
        });
      }
    } catch (error) {
      console.log(error);

      if (req.file) {
        const savedImagePath = req.file.path;
        if (savedImagePath) {
          fs.unlink(savedImagePath, (err) => {
            if (err)
              console.log(
                "Error deleting update post image after failure:",
                err
              );
            else
              console.log(
                "Deleted update post image file as error occurred during update!"
              );
          });
        }
      }

      if (error instanceof CustomError) return next(error);

      res.status(500).send({
        success: false,
        message: "Server side error!",
        error: error.message,
      });
    }
  }
}
