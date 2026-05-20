const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data");

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/StayNest";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
    await initDB();
  } catch (err) {
    console.log("DB connection error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

async function initDB() {
  await Listing.deleteMany({});
 initData.data=initData.data.map((obj)>{
    ...obj,owner:"64a1c8e5f0b9c2a1b2c3d4e" // Replace with an actual user ID from your database
  });
  await Listing.insertMany(initData.data);
  
  console.log("Database initialized with sample listings");
}
main();