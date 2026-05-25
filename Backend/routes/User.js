const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync"); // Added wrapAsync utility
const UserController = require("../controllers/User");

// 1. Group /signup route
router.route("/signup")
    .post(wrapAsync(UserController.usersignup)); // Fixed function name and wrapAsync syntax

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

module.exports = router;
