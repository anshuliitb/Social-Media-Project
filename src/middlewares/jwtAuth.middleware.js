import jwt from "jsonwebtoken";
import UserModel from "../features/users/users.model.js";
import TokenModel from "../features/users/users.token.model.js";

export default (req, res, next) => {
  const rawAuthHeader = req.headers.authorization;
  const JWT_SECRET_KEY = process.env.JWT_SECRET;

  const token = rawAuthHeader?.startsWith("Bearer ")
    ? rawAuthHeader.split(" ")[1]
    : rawAuthHeader;

  jwt.verify(token, JWT_SECRET_KEY, async (error, payload) => {
    if (error) {
      console.log(error);

      return res.status(401).send({
        success: false,
        message: "Authorization failed!",
        error: error.message,
      });
    } else {
      const userFromDb = await UserModel.findById(payload._id);
      if (!userFromDb) {
        return res.status(404).send({
          success: false,
          message: "User not found with this token",
        });
      }

      const tokenExists = await TokenModel.findOne({
        userId: payload._id,
        token,
      });

      if (tokenExists) {
        req.user = payload;
        req.user.token = token;
        next();
      } else {
        return res.status(401).send({
          success: false,
          message: "Sign in again. You have already logged out!",
        });
      }
    }
  });
};
