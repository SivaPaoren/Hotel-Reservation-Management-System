import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hotel_management";

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://root:kaung4241@cluster-1.meb6uox.mongodb.net/");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

export default connectDB;
