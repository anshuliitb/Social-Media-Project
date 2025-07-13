import UserModel from "../users/users.model.js";

export default class OtpRepository {
  async findUserByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async updateUserPassword(email, hashedPassword) {
    return await UserModel.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );
  }
}
