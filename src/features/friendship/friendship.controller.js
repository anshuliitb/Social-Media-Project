import FriendshipRepository from "./friendship.repository.js";

export default class FriendshipController {
  constructor() {
    this.friendshipRepository = new FriendshipRepository();
  }

  async getFriends(req, res) {
    try {
      const { userId } = req.params;

      const friends = await this.friendshipRepository.getUserFriends(userId);

      const result = friends.map((friend) => {
        const friendUser =
          friend.fromUser._id.toString() === userId
            ? friend.toUser
            : friend.fromUser;
        return friendUser;
      });

      res.json({ success: true, friends: result });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching friends",
          error: error.message,
        });
    }
  }

  async getPendingRequests(req, res) {
    try {
      const userId = req.user._id;

      const requests = await this.friendshipRepository.getPendingRequests(
        userId
      );

      res.json({ success: true, requests });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching pending requests",
          error: error.message,
        });
    }
  }

  async toggleFriendship(req, res) {
    try {
      const userId = req.user._id;
      const { friendId } = req.params;

      const existing = await this.friendshipRepository.getExistingFriendship(
        userId,
        friendId
      );

      if (existing) {
        await this.friendshipRepository.deleteFriendship(existing);
        return res.json({
          success: true,
          message: "Friendship removed or pending request canceled",
        });
      }

      await this.friendshipRepository.createFriendRequest(userId, friendId);
      res.json({ success: true, message: "Friend request sent" });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error toggling friendship",
          error: error.message,
        });
    }
  }

  async respondToRequest(req, res) {
    try {
      const userId = req.user._id;
      const { friendId } = req.params;
      const { action } = req.body; // 'accept' or 'reject'

      const request = await this.friendshipRepository.getFriendRequestToRespond(
        friendId,
        userId
      );

      if (!request) {
        return res
          .status(404)
          .json({ success: false, message: "Request not found" });
      }

      if (action === "accept" || action === "reject") {
        await this.friendshipRepository.updateFriendRequestStatus(
          request,
          action === "accept" ? "accepted" : "rejected"
        );
        return res.json({
          success: true,
          message: `Friend request ${action}ed`,
        });
      }

      res.status(400).json({ success: false, message: "Invalid action" });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error responding to request",
          error: error.message,
        });
    }
  }
}
