import jwt from "jsonwebtoken";

import CustomError from "../../errorHandlers/customErrorClass.js";
import { verifyHashedPassword } from "../../utils/users.passwordHashing.js";
import UserModel from "./users.model.js";

import LikeModel from "../likes/likes.model.js";
import TokenModel from "./users.token.model.js";
import FriendshipModel from "../friendship/friendship.model.js";

export default class UserRepository {
  async registerUser(name, email, password, gender, avatarUrl) {
    const newUser = new UserModel({
      name,
      email,
      password,
      gender,
      avatarUrl,
    });

    return await newUser.save();
  }

  async userSignIn(email, password) {
    const userFromDb = await UserModel.findOne({ email });
    if (userFromDb) {
      const hashedPassword = userFromDb.password;
      const verified = await verifyHashedPassword(password, hashedPassword);
      if (verified) {
        const JWT_SECRET_KEY = process.env.JWT_SECRET;
        const token = jwt.sign(
          { email, _id: userFromDb._id, role: "user" },
          JWT_SECRET_KEY,
          { expiresIn: "1h" }
        );

        await TokenModel.create({ userId: userFromDb._id, token });

        return token;
      } else {
        throw new CustomError("Incorrect password for the entered email", 401);
      }
    } else {
      throw new CustomError("Email not found!", 404);
    }
  }

  async userLogout(id, token) {
    await TokenModel.deleteOne({ userId: id, token });
  }

  async userLogoutAllDevices(id) {
    await TokenModel.deleteMany({ userId: id });
  }

  async getUserDetails(id) {
    const userFromDb = await UserModel.findById(id).select("-password");

    const likeCount = await LikeModel.countDocuments({ userId: id });

    const pendingFriendRequests = await FriendshipModel.countDocuments({
      toUser: id,
      status: "pending",
    });

    const friends = await FriendshipModel.find({
      $or: [
        { fromUser: id, status: "accepted" },
        { toUser: id, status: "accepted" },
      ],
    });

    const userWithLikeCount = {
      ...userFromDb.toObject(),
      likeCount,
      pendingFriendRequests,
      friends,
    };
    return userWithLikeCount;
  }

  async getAllUserDetails() {
    const users = await UserModel.find().select("-password");
    return users;
  }

  async updateUserDetails(id, userData) {
    const userFromDb = await UserModel.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
      projection: "-password -__v",
    });
    return userFromDb;
  }
}
