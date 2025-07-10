import UserRepository from "./user.repository.js";
import { hashingPassword } from "../../utils/user.passwordHashing.js";
import CustomError from "../../errorHandlers/customErrorClass.js";

export default class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async signUp(req, res) {
    try {
      const { name, email, password, gender } = req.body;
      const hashedPassword = await hashingPassword(password);

      const response = await this.userRepository.registerUser(
        name,
        email,
        hashedPassword,
        gender
      );

      res.send({
        success: true,
        message: "User registered successfully",
        response,
      });
    } catch (error) {
      console.log(error);

      res.status(400).send({
        success: false,
        message: "User registration failed!",
        error: error.message,
      });
    }
  }

  async signIn(req, res, next) {
    try {
      const { email, password } = req.body;
      const token = await this.userRepository.userSignIn(email, password);

      return res.send({
        success: true,
        message: "User logged in successfully",
        token,
      });
    } catch (error) {
      console.log(error);

      if (error instanceof CustomError) next(error);
      else {
        res.status(500).send({
          success: false,
          message: "Server side error occurred!",
          error: error.message,
        });
      }
    }
  }

  async logout(req, res, next) {
    try {
      const id = req.user._id;
      const token = req.user.token;
      await this.userRepository.userLogout(id, token);
      res.send({
        success: true,
        message: "User logged out successfully",
        deletedToken: token,
      });
    } catch (error) {
      console.log(error);

      res.status(500).send({
        success: false,
        message: "Server side error occurred!",
        error: error.message,
      });
    }
  }

  async logoutAllDevices(req, res, next) {
    try {
      const id = req.user._id;
      await this.userRepository.userLogoutAllDevices(id);
      res.send({
        success: true,
        message: "User logged out successfully from all devices",
      });
    } catch (error) {
      console.log(error);

      res.status(500).send({
        success: false,
        message: "Server side error occurred!",
        error: error.message,
      });
    }
  }
}
