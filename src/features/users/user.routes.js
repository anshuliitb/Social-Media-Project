import express from "express";

import UserController from "./user.controller.js";
import jwtAuth from "../../middlewares/jwtAuth.js";

const userController = new UserController();

const userRouter = express.Router();

userRouter
  .route("/signup")
  .post((req, res, next) => userController.signUp(req, res, next));

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

export default userRouter;
