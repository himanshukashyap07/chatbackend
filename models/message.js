import mongoose from "mongoose";

const msgSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [1, "Content must be at least 1 character long"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reciver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    isSeen:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

const Msg = mongoose.model("Msg", msgSchema);
export default Msg
