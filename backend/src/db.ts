import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hotel_management";

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://stafarnhacker_db_user:5vjLmYqD8brV85GZ@hotel-cluster.ksljnm0.mongodb.net/?retryWrites=true&w=majority&appName=hotel-cluster");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

export default connectDB;
