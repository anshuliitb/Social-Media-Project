import express from "express";

import FriendshipController from "./friendship.controller.js";

const friendsRouter = express.Router();
const friendshipController = new FriendshipController();

friendsRouter.get("/get-friends/:userId", (req, res, next) => {
  friendshipController.getFriends(req, res, next);
});

friendsRouter.get("/get-pending-requests", (req, res, next) => {
  friendshipController.getPendingRequests(req, res, next);
});

friendsRouter.post("/toggle-friendship/:friendId", (req, res, next) => {
  friendshipController.toggleFriendship(req, res, next);
});

friendsRouter.post("/response-to-request/:friendId", (req, res, next) => {
  friendshipController.respondToRequest(req, res, next);
});

export default friendsRouter;
