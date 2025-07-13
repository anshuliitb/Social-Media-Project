import express from "express";

import LikesController from "./likes.controller.js";

const likesController = new LikesController();
const likesRouter = express.Router();

likesRouter.get("/:id", (req, res, next) => {
  likesController.getLikes(req, res, next);
});

likesRouter.post("/toggle/:id", (req, res, next) => {
  likesController.toggleLike(req, res, next);
});

export default likesRouter;
