import mongoose from "mongoose";

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

  async getDetails(req, res, next) {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid user ID!",
        });
      }

      const userFromDb = await this.userRepository.getUserDetails(userId);
      if (userFromDb) {
        return res.send({
          success: true,
          message: "Requested user details returned successfully",
          response: userFromDb,
        });
      } else {
        return res.status(404).send({
          success: false,
          message: "User details not found",
        });
      }
    } catch (error) {
      console.log(error);

      res.status(500).send({
        success: false,
        message: "Server side error occurred!",
        error: error.message,
      });
    }
  }

  async getAllDetails(req, res, next) {
    try {
      const users = await this.userRepository.getAllUserDetails();
      return res.send({
        success: true,
        message: "All user details returned successfully",
        response: users,
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

  async updateDetails(req, res, next) {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid user ID!",
        });
      }

      const password = await hashingPassword(req.body.password);
      const userUpdated = await this.userRepository.updateUserDetails(userId, {
        ...req.body,
        password,
      });

      if (!userUpdated) {
        return res.status(404).send({
          success: false,
          message: "User not found with this ID!",
        });
      }

      return res.send({
        success: true,
        message: "User details updated successfully",
        response: userUpdated,
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
