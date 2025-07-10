import mongoose from "mongoose";

export default async () => {
  try {
    const url = process.env.MONGODB_URI;
    await mongoose.connect(url);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error", error);
    throw new Error("❌ MongoDB connection error");
  }
};
