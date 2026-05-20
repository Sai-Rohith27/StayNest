const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session'); // <-- 1. Imported
const ExpressError = require("./utils/ExpressError");
const listingsroutes = require("./routes/Listings");
const reviewsroutes = require("./routes/Review");
const userroutes=require("./routes/User");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/User");
const app = express();
const mongo_url = "mongodb://127.0.0.1:27017/StayNest";
const port = 3030;

async function main() {
    try {
        await mongoose.connect(mongo_url);
        console.log("Mongo Db connected");
    } catch (err) {
        console.log(err);
    }
}
main();

// --- 1. GENERAL MIDDLEWARE ---
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
})); 
app.use(express.json());
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

// app.get("/demouser",async (req,res)=>{
//     let fakeuser=new User({
//         email:"someone@gmail.com",
//         username:"someone"
//     })
//      const registeredUser = await User.register(fakeuser, "mySuperSecretPassword");
//      res.send(registeredUser);
// })
// --- 3. ROUTES ---
app.use("/", userroutes);
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

app.get("/test", (req, res) => {
    res.send("DONE");
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
    res.status(statusCode).json({ error: message });
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
