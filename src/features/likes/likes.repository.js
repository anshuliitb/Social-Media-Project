import LikeModel from "./likes.model.js";

export default class LikesRepository {
  async getLikesForItem(id) {
    return await LikeModel.find({ likeable: id }).populate(
      "userId",
      "name email"
    );
  }

  async findLike(userId, likeableId, type) {
    return await LikeModel.findOne({
      userId,
      likeable: likeableId,
      onModel: type,
    });
  }

  async removeLike(likeId) {
    return await LikeModel.findByIdAndDelete(likeId);
  }

  async addLike(userId, likeableId, type) {
    const like = new LikeModel({
      userId,
      likeable: likeableId,
      onModel: type,
    });
    await like.save();
    const populatedLike = await like.populate("userId", "name email");
    return populatedLike;
  }
}
