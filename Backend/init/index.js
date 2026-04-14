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
  await Listing.insertMany(initData.data);
  
  console.log("Database initialized with sample listings");
}
main();