import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    likeable: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "onModel",
    },

    onModel: {
      type: String,
      required: true,
      enum: ["Post", "Comment"],
    },
  },
  { timestamps: true }
);

const LikeModel = mongoose.model("Like", likeSchema);
export default LikeModel;
