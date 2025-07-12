import express from "express";
import OtpController from "./otp.controller.js";

const otpRouter = express.Router();
const otpController = new OtpController();

otpRouter.post("/send", (req, res, next) => {
  otpController.sendOtp(req, res, next);
});

otpRouter.post("/verify", (req, res, next) => {
  otpController.verifyOtp(req, res, next);
});

otpRouter.post("/reset-password", (req, res, next) => {
  otpController.OtpResetPassword(req, res, next);
});

export default otpRouter;
