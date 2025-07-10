import jwt from "jsonwebtoken";
import UserModel from "../features/users/user.registration.model.js";

export default (req, res, next) => {
  const token = req.headers.authorization;
  const JWT_SECRET_KEY = process.env.JWT_SECRET;

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

      if (!userFromDb)
        return res.status(404).send({
          success: false,
          message: "User not found with this token",
        });

      if (userFromDb.tokens.includes(token)) {
        req.user = payload;
        req.user.token = token;
        next();
      } else {
        console.log("This user has already logged out!");

        return res.status(401).send({
          success: false,
          message: "Sign in again. You have already logged out!",
        });
      }
    }
  });
};
