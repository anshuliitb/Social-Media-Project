import jwt from "jsonwebtoken";

import CustomError from "../../errorHandlers/customErrorClass.js";
import { verifyHashedPassword } from "../../utils/user.passwordHashing.js";
import UserModel from "./user.registration.model.js";

export default class UserRepository {
  async registerUser(name, email, password, gender) {
    const newUser = new UserModel({
      name,
      email,
      password,
      gender,
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
          {
            expiresIn: "1h",
          }
        );

        userFromDb.tokens.push(token);
        await userFromDb.save();

        return token;
      } else {
        throw new CustomError("Incorrect password for the entered email", 401);
      }
    } else {
      throw new CustomError("Email not found!", 404);
    }
  }

  async userLogout(id, token) {
    const userFromDb = await UserModel.findById(id);
    userFromDb.tokens = userFromDb.tokens.filter((t) => t !== token);
    await userFromDb.save();
  }

  async userLogoutAllDevices(id) {
    const userFromDb = await UserModel.findById(id);
    userFromDb.tokens = [];
    await userFromDb.save();
  }

  async getUserDetails(id) {
    const userFromDb = await UserModel.findById(id).select("-password");
    return userFromDb;
  }

  async getAllUserDetails() {
    const users = await UserModel.find().select("-password");
    return users;
  }

  async updateUserDetails(id, userData) {
    let userFromDb = await UserModel.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
      projection: "-password -tokens -__v",
    });
    return userFromDb;
  }
}
