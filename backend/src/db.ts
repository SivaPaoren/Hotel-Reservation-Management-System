import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hotel_management";

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://kelvingao884_db_user:621TIdltAfW3dbKJ@hotelmanagement.qjibbl3.mongodb.net/hotelDB?retryWrites=true&w=majority");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

export default connectDB;
