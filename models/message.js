import mongoose from "mongoose";

const msgSchema = new mongoose.Schema(
  {
    content: {
      type: String,
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
    },
    file: {
      type: {type:String},
      url: {type:String},
      name: {type:String},
      size: {type:Number},
      fileType: {type:String},
    }
  },
  { timestamps: true }
);

const Msg = mongoose.model("Msg", msgSchema);
export default Msg
