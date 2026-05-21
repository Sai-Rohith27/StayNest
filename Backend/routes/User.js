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

module.exports = router;