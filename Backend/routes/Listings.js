const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing");

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        throw new ExpressError(401, "You must login to create listing");
    }
    next();
};

// UPDATED: Replaced try/catch with wrapAsync
router.get("/", wrapAsync(async(req,res)=>{
    const alllistigs= await Listing.find({});
    res.json(alllistigs);
}));
router.get("/:id", wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id).populate("reviews");
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.json(listing);
}));
// UPDATED: Added validateListing middleware and wrapAsync
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body);
    await newListing.save();
    res.json(newListing);
}));

// UPDATED: Added validateListing middleware and wrapAsync
router.put("/:id", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    
    // Spread the body to safely update the document, ensuring nested objects like 'image' are handled
    const updated = await Listing.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true, runValidators: true } // Also added runValidators to ensure schema rules are applied on update
    );
    
    if (!updated) {
        throw new ExpressError(404, "Listing not found");
    }
    res.json(updated);
}));

router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const deleted = await Listing.findByIdAndDelete(req.params.id);
    if (!deleted) {
        throw new ExpressError(404, "Listing not found");
    }
    res.json({ message: "Listing deleted!" });
}));

module.exports=router;
