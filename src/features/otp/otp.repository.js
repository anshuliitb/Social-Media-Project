import UserModel from "../users/user.registration.model.js";

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
