const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing");
const listingsController = require("../controllers/Listings");
const multer = require("multer");
const { imageFileFilter, listingStorage } = require("../cloudConfig");

const upload = multer({
    storage: listingStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 },
});

const validateListing = listingsController.validateListing;
const isLoggedIn = listingsController.isLoggedIn;
const isOwner = wrapAsync(listingsController.owner);
// UPDATED: Replaced try/catch with wrapAsync
router.route("/")
    .get(wrapAsync(listingsController.index))
    .post(isLoggedIn, upload.single("image"), validateListing, wrapAsync(listingsController.newlisting));

// Keep this path as an alias in case older frontend code still posts here.
router.route("/new")
    .post(isLoggedIn, upload.single("image"), validateListing, wrapAsync(listingsController.newlisting));
// UPDATED: Added validateListing middleware and wrapAsync
router.route("/:id")
    .get(wrapAsync(listingsController.getlisting))
    .put(isLoggedIn, isOwner, upload.single("image"), validateListing, wrapAsync(listingsController.updatelisting))
    .delete(isLoggedIn, isOwner, wrapAsync(listingsController.deletelisting));

module.exports=router;
