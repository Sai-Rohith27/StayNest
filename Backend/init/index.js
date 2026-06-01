const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path"); // <-- Added this to safely find .env

const Listing = require("../models/listing.js");
const Booking = require("../models/Booking.js");
const Review = require("../models/review.js");
const User = require("../models/User.js");
const initData = require("./data");

// 🚨 Safely locate the .env file no matter where the terminal is running from
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const cleanEnv = (value) => String(value || "").trim().replace(/;+$/, "");
const MONGO_URL = cleanEnv(process.env.ATLAS_URL) || "mongodb://127.0.0.1:27017/StayNest";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("🌐 Connected to MongoDB Atlas Cloud");
    await initDB();
  } catch (err) {
    console.log("❌ DB connection error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection done! closed");
  }
}

async function initDB() {
  // Clear out old relational data to prevent errors
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await User.updateMany({}, { $set: { wishlist: [] } });
  
  // Reset the listings
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  
  console.log("✅ Database initialized with 50 sample stays!");
}

main();