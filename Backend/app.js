const express = require('express');
require("dotenv").config();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session'); // <-- 1. Imported
const ExpressError = require("./utils/ExpressError");
const listingsroutes = require("./routes/Listings");
const reviewsroutes = require("./routes/Review");
const userroutes=require("./routes/User");
const bookingroutes = require("./routes/Bookings");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/User");
const app = express();
const cleanEnv = (value) => String(value || "").trim().replace(/;+$/, "");
const db_url = cleanEnv(process.env.ATLAS_URL) || "mongodb://127.0.0.1:27017/StayNest";
const port = Number(cleanEnv(process.env.PORT)) || 3030;

async function main() {
    try {
        await mongoose.connect(db_url);
        console.log("Mongo Db connected");
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        if (/bad auth|authentication failed/i.test(err.message)) {
            console.error("Check Backend/.env ATLAS_URL username/password against your MongoDB Atlas Database Access user.");
        } else if (/querySrv|ENOTFOUND/i.test(err.message)) {
            console.error("Check that ATLAS_URL contains the full Atlas host, like cluster0.xxxxx.mongodb.net, and URL-encode special password characters.");
        }
    }
}
main();

// --- 1. GENERAL MIDDLEWARE ---
app.use(cors({
    origin: [
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// --- 2. SESSION CONFIGURATION ---
// MUST be placed here, before your routes!
const sessionOptions = {
    secret: "staynedt_super_secret_code", 
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true // Secures cookie from malicious JavaScript
    }
};
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// --- 3. ROUTES ---
app.use("/", userroutes);
app.use("/bookings", bookingroutes);
app.use("/listings/:id/reviews", reviewsroutes);
app.use("/listings", listingsroutes);

// Test Route to verify your server's memory is working
app.get("/count", (req, res) => {
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send(`Your session count is ${req.session.count}`);
});

app.get("/", (req, res) => {
    console.dir(req.cookies);
    res.send("Hi, Welcome to the Staynedt API");
});

// --- 4. ERROR HANDLING ---
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;

    if (
        err?.name === "MulterError" ||
        /invalid signature/i.test(message) ||
        /cloudinary/i.test(message)
    ) {
        statusCode = 400;
        message = /invalid signature/i.test(message)
            ? "Image upload failed. Please check your Cloudinary API secret in Backend/.env."
            : "Image upload failed. Please choose a valid image and try again.";
    }

    res.status(statusCode).json({ error: message });
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
