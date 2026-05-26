const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Booking = require("../models/Booking.js");
const Review = require("../models/review.js");
const User = require("../models/User.js");
const initData = require("./data");

dotenv.config();

const cleanEnv = (value) => String(value || "").trim().replace(/;+$/, "");
const MONGO_URL = cleanEnv(process.env.ATLAS_URL) || "mongodb://127.0.0.1:27017/StayNest";

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
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await User.updateMany({}, { $set: { wishlist: [] } });
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  
  console.log("Database initialized with sample listings");
}
main();
