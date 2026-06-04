const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync"); 
const UserController = require("../controllers/User");

// --- NEW IMPORTS FOR FORGOT PASSWORD ---
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User'); 
// ---------------------------------------

// 1. Group /signup route
router.route("/signup")
    .post(wrapAsync(UserController.usersignup)); 

// 2. Group /login route
router.route("/login")
    .post(UserController.userlogin);

// 3. Group /logout route
router.route("/logout")
    .post(UserController.userlogout);

// 4. Group /me route
router.route("/me")
    .get(UserController.userme);

router.route("/profile")
    .get(UserController.requireLogin, wrapAsync(UserController.profile));

router.route("/host/listings")
    .get(UserController.requireLogin, wrapAsync(UserController.hostListings));

router.route("/wishlist")
    .get(UserController.requireLogin, wrapAsync(UserController.getWishlist));

router.route("/wishlist/:listingId")
    .post(UserController.requireLogin, wrapAsync(UserController.toggleWishlist));

// ==========================================
// 5. FORGOT PASSWORD ROUTE (Sends the Email)
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ error: "No account with that email address exists." });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetUrl = `https://stay-nest-phi.vercel.app/reset-password/${token}`;

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'StayNest Password Reset',
            text: `You are receiving this because you requested the reset of the password for your account.\n\n` +
                  `Please click on the following link, or paste it into your browser to complete the process:\n\n` +
                  `${resetUrl}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "An email has been sent to " + user.email + " with further instructions." });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error sending reset email. Make sure your App Password is correct." });
    }
});

// ==========================================
// 6. RESET PASSWORD ROUTE (Saves New Password)
// ==========================================
router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({ 
            resetPasswordToken: req.params.token, 
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ error: "Password reset token is invalid or has expired." });
        }

        await user.setPassword(req.body.password);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Success! Your password has been changed." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error resetting password." });
    }
});

module.exports = router;