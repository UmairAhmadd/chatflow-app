import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // roomId points to a Conversation (dm) or Group (group)
    roomId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    roomType: { type: String, enum: ["dm", "group"], required: true },
    content: { type: String, default: "" },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
