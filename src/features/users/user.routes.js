import express from "express";

import UserController from "./user.controller.js";
import jwtAuth from "../../middlewares/jwtAuth.js";
import { uploadAvatar } from "../../middlewares/fileUpload.middleware.js";

const userController = new UserController();

const userRouter = express.Router();

userRouter
  .route("/signup")
  .post(uploadAvatar.single("avatarImage"), (req, res, next) =>
    userController.signUp(req, res, next)
  );

userRouter
  .route("/signin")
  .post((req, res, next) => userController.signIn(req, res, next));

userRouter
  .route("/logout")
  .post(jwtAuth, (req, res, next) => userController.logout(req, res, next));

userRouter
  .route("/logout-all-devices")
  .post(jwtAuth, (req, res, next) =>
    userController.logoutAllDevices(req, res, next)
  );

userRouter
  .route("/get-details/:userId")
  .get(jwtAuth, (req, res, next) => userController.getDetails(req, res, next));

userRouter
  .route("/get-all-details")
  .get(jwtAuth, (req, res, next) =>
    userController.getAllDetails(req, res, next)
  );

userRouter
  .route("/update-details/:userId")
  .put(jwtAuth, (req, res, next) =>
    userController.updateDetails(req, res, next)
  );

export default userRouter;
