import express from "express";
import PostsController from "./post.controller.js";

const postsController = new PostsController();

const postsRouter = express.Router();

postsRouter
  .route("/")
  .post((req, res, next) => postsController.createPost(req, res, next));

postsRouter
  .route("/all")
  .get((req, res, next) => postsController.AllPosts(req, res, next));

postsRouter
  .route("/:postId")
  .get((req, res, next) => postsController.postById(req, res, next))
  .put((req, res, next) => postsController.updatePost(req, res, next))
  .delete((req, res, next) => postsController.deletePost(req, res, next));

postsRouter
  .route("/user/:userId")
  .get((req, res, next) => postsController.userPosts(req, res, next));

export default postsRouter;
