import mongoose from "mongoose";

import CommentsModel from "../comments/comments.model.js";
import PostsModel from "../posts/posts.model.js";
import LikesRepository from "./likes.repository.js";

export default class LikesController {
  constructor() {
    this.likesRepository = new LikesRepository();
  }

  async getLikes(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
          success: false,
          message: "Invalid post / comment ID!",
        });
      }

      if (
        !(await PostsModel.findById(id)) &&
        !(await CommentsModel.findById(id))
      ) {
        return res.status(400).send({
          success: false,
          message: "Post / comment not found!",
        });
      }

      const likes = await this.likesRepository.getLikesForItem(id);

      return res.json({ success: true, likes });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async toggleLike(req, res) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const { type } = req.query;

      if (!["Post", "Comment"].includes(type)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid type" });
      }

      const Model = type === "Post" ? PostsModel : CommentsModel;
      const item = await Model.findById(id);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: `${type} not found` });
      }

      const existingLike = await this.likesRepository.findLike(
        userId,
        id,
        type
      );

      if (existingLike) {
        await this.likesRepository.removeLike(existingLike._id);
        return res.status(200).json({ success: true, message: "Like removed" });
      } else {
        const newLike = await this.likesRepository.addLike(userId, id, type);
        return res
          .status(201)
          .json({ success: true, message: "Liked", like: newLike });
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
