import bcrypt from "bcrypt";

const saltRounds = 12;

export const hashingPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

export const verifyHashedPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
