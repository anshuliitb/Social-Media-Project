import FriendshipModel from "./friendship.model.js";

export default class FriendshipRepository {
  async getUserFriends(userId) {
    return await FriendshipModel.find({
      $or: [
        { fromUser: userId, status: "accepted" },
        { toUser: userId, status: "accepted" },
      ],
    }).populate("fromUser toUser", "name email");
  }

  async getPendingRequests(userId) {
    return await FriendshipModel.find({
      toUser: userId,
      status: "pending",
    }).populate("fromUser", "name email");
  }

  async getExistingFriendship(userId, friendId) {
    return await FriendshipModel.findOne({
      $or: [
        { fromUser: userId, toUser: friendId },
        { fromUser: friendId, toUser: userId },
      ],
    });
  }

  async createFriendRequest(fromUser, toUser) {
    return await FriendshipModel.create({
      fromUser,
      toUser,
      status: "pending",
    });
  }

  async deleteFriendship(friendship) {
    return await friendship.deleteOne();
  }

  async getFriendRequestToRespond(fromUser, toUser) {
    return await FriendshipModel.findOne({
      fromUser,
      toUser,
      status: "pending",
    });
  }

  async updateFriendRequestStatus(friendship, status) {
    friendship.status = status;
    return await friendship.save();
  }
}
