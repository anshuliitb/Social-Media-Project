import NodeCache from "node-cache";
import otpGenerator from "otp-generator";

export const generateOtp = () =>
  otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    specialChars: false,
    alphabets: false,
  });

const otpCache = new NodeCache({ stdTTL: 300 });

export const storeOtp = (email, otp) => {
  otpCache.set(email, otp);
};

export const verifyStoredOtp = (email, enteredOtp) => {
  const saved = otpCache.get(email);
  const isValid = saved && saved === enteredOtp;
  if (isValid) otpCache.del(email);
  return isValid;
};
