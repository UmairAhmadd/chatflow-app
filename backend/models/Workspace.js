import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    inviteCode: { type: String, required: true, unique: true, uppercase: true },
  },
  { timestamps: true }
);

const Workspace =
  mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);
export default Workspace;
