import { hashingPassword } from "../../utils/users.passwordHashing.js";
import OtpRepository from "./otp.repository.js";
import {
  generateOtp,
  storeOtp,
  verifyStoredOtp,
} from "./utils/otpGenerator.util.js";
import { sendOtpToEmail } from "./utils/otpMailer.util.js";

export default class OtpController {
  constructor() {
    this.otpRepository = new OtpRepository();
  }

  async sendOtp(req, res) {
    try {
      const { email } = req.body;
      const user = await this.otpRepository.findUserByEmail(email);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "Email not found!" });

      const otp = generateOtp();
      storeOtp(email, otp);

      await sendOtpToEmail(email, otp);

      res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
      console.log(error);

      res.status(500).send({
        success: false,
        message: "Server side error!",
        error: error.message,
      });
    }
  }

  async verifyOtp(req, res) {
    const { email, otp } = req.body;
    const isValid = verifyStoredOtp(email, otp);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP!" });
    } else res.json({ success: true, message: "OTP verified successfully" });
  }

  async OtpResetPassword(req, res) {
    const { email, otp, newPassword } = req.body;
    const isValid = verifyStoredOtp(email, otp);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP!" });
    }

    const hashedPassword = await hashingPassword(newPassword);
    await this.otpRepository.updateUserPassword(email, hashedPassword);
    res.json({
      success: true,
      message: "Password updated successfully after Otp verification",
    });
  }
}
