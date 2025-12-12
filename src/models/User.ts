// TODO: DATABASE CONFIGURATION
// ==================================================
// Install mongoose: pnpm add mongoose
// Add to .env: MONGODB_URI=mongodb://localhost:27017/ScanDownload
// For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname
// ==================================================

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    uploadCount: {
      type: Number,
      default: 0,
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
