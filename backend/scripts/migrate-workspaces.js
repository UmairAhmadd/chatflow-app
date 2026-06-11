/**
 * One-time migration: put every pre-existing user, conversation and group into
 * a single "Default Workspace" so the workspace feature works with old data.
 *
 * Safe to re-run (idempotent): it only touches documents that still have no
 * workspace, and users who already created/joined their own workspace are left
 * untouched.
 *
 * Run from the backend/ directory:  node scripts/migrate-workspaces.js
 */
import "dotenv/config";
import crypto from "crypto";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Conversation from "../models/Conversation.js";
import Group from "../models/Group.js";

const DEFAULT_NAME = "Default Workspace";
const DEFAULT_SLUG = "default-workspace";

const noWorkspace = { $or: [{ workspace: { $exists: false } }, { workspace: null }] };

async function run() {
  await connectDB();

  const orphanUsers = await User.countDocuments(noWorkspace);
  if (orphanUsers === 0) {
    console.log("✅ No users without a workspace — nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  // Find or create the default workspace.
  let ws = await Workspace.findOne({ slug: DEFAULT_SLUG });
  if (!ws) {
    const firstUser = await User.findOne().sort({ createdAt: 1 });
    if (!firstUser) {
      console.log("No users found at all — nothing to migrate.");
      await mongoose.disconnect();
      return;
    }
    ws = await Workspace.create({
      name: DEFAULT_NAME,
      slug: DEFAULT_SLUG,
      owner: firstUser._id,
      members: [],
      inviteCode: crypto.randomBytes(4).toString("hex").toUpperCase(),
    });
    console.log(`Created "${DEFAULT_NAME}" (invite code: ${ws.inviteCode})`);
  }

  // 1) Assign users that still have no workspace.
  const usersRes = await User.updateMany(noWorkspace, {
    $set: { workspace: ws._id },
  });

  // 2) Make sure every user in this workspace is listed as a member.
  const memberIds = await User.find({ workspace: ws._id }).distinct("_id");
  await Workspace.findByIdAndUpdate(ws._id, {
    $addToSet: { members: { $each: memberIds } },
  });

  // 3) Assign conversations + groups that still have no workspace.
  const convRes = await Conversation.updateMany(noWorkspace, {
    $set: { workspace: ws._id },
  });
  const groupRes = await Group.updateMany(noWorkspace, {
    $set: { workspace: ws._id },
  });

  console.log("— Migration summary —");
  console.log(`Users assigned:         ${usersRes.modifiedCount}`);
  console.log(`Workspace members:      ${memberIds.length}`);
  console.log(`Conversations assigned: ${convRes.modifiedCount}`);
  console.log(`Groups assigned:        ${groupRes.modifiedCount}`);
  console.log(`Invite code:            ${ws.inviteCode}`);

  await mongoose.disconnect();
  console.log("✅ Migration complete.");
}

run().catch(async (err) => {
  console.error("❌ Migration failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
