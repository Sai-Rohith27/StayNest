const User=require("../models/User");
const passport = require("passport");
const Listing = require("../models/listing");
const Booking = require("../models/Booking");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { createAuthToken } = require("../utils/tokenAuth");

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function getFrontendUrl() {
    return (process.env.FRONTEND_URL || process.env.CLIENT_URL || "https://stay-nest-phi.vercel.app").replace(/\/+$/, "");
}

function createTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

function requireLogin(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: "Please login first" });
    }

    next();
}

module.exports.requireLogin = requireLogin;

module.exports.usersignup=async(req,res)=>{
    let{username,email,password}=req.body;
    try{
        if (!username || !email || !password) {
            return res.status(400).json({error:"Username, email, and password are required"});
        }

        const  newUser=new User({email,username});
        const registeredUser = await User.register(newUser, password);
        res.status(201).json({
            message:"User registered successfully. Please login to continue.",
            user: registeredUser.username
        });
    }catch(err){
        console.log(err);
        const statusCode = err.name === "UserExistsError" ? 409 : 500;
        res.status(statusCode).json({error:err.message || "An error occurred during registration"});
    }
};

module.exports.userlogin=(req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                error: info?.message || "Invalid username or password"
            });
        }

        req.login(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }

            res.json({
                message:"Logged in successfully",
                user:req.user.username,
                userId:req.user._id,
                token: createAuthToken(req.user)
            });
        });
    })(req, res, next);
};

module.exports.forgotPassword = async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ message: "If an account exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + RESET_TOKEN_TTL_MS;
    await user.save();

    const resetUrl = `${getFrontendUrl()}/reset-password/${resetToken}`;
    const transporter = createTransporter();

    if (!transporter) {
        console.log(`Password reset link for ${user.email}: ${resetUrl}`);
        return res.json({ message: "Reset link generated. Check backend logs for the link." });
    }

    await transporter.sendMail({
        from: `"StayNest" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Reset your StayNest password",
        text: `Use this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
        html: `<p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
    });

    res.json({ message: "If an account exists, a reset link has been sent." });
};

module.exports.resetPassword = async (req, res) => {
    const password = String(req.body.password || "");

    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token || "").digest("hex");
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    await user.setPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
};

module.exports.userlogout=(req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.json({message:"Logged out successfully"});
    });
};

module.exports.userme= (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({error:"Not logged in"});
    }

    res.json({user:req.user.username, userId:req.user._id});
};

module.exports.profile = async (req, res) => {
    const [user, listingsCount, bookingsCount] = await Promise.all([
        User.findById(req.user._id).select("username email createdAt wishlist").populate("wishlist"),
        Listing.countDocuments({ owner: req.user._id }),
        Booking.countDocuments({ user: req.user._id }),
    ]);

    res.json({
        user,
        stats: {
            listings: listingsCount,
            bookings: bookingsCount,
            wishlist: user?.wishlist?.length || 0,
        },
    });
};

module.exports.hostListings = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
};

module.exports.getWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user?.wishlist || []);
};

module.exports.toggleWishlist = async (req, res) => {
    const { listingId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user.wishlist) {
        user.wishlist = [];
    }
    const exists = user.wishlist.some((id) => id.equals(listingId));

    if (exists) {
        user.wishlist.pull(listingId);
    } else {
        user.wishlist.addToSet(listingId);
    }

    await user.save();
    await user.populate("wishlist");

    res.json({
        saved: !exists,
        wishlist: user.wishlist,
    });
};
