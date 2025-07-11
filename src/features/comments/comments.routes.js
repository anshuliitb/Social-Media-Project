import express from "express";

import CommentsController from "./comments.controller.js";

const commentsController = new CommentsController();

const commentsRouter = express.Router();

commentsRouter
  .route("/:postId")
  .post((req, res, next) => commentsController.createComment(req, res, next))
  .get((req, res, next) => commentsController.getComments(req, res, next));

commentsRouter
  .route("/:commentId")
  .put((req, res, next) => commentsController.updateComment(req, res, next))
  .delete((req, res, next) => commentsController.deleteComment(req, res, next));

export default commentsRouter;
