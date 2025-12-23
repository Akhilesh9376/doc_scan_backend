import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ScanDownload";

let mongoConnected = false;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    mongoConnected = true;
    console.log(" MongoDB connected");
  } catch (error) {
    mongoConnected = false;
    console.warn(
      "MongoDB not available – using in-memory fallback"
    );
  }
};

export const isMongoConnected = () => mongoConnected;
