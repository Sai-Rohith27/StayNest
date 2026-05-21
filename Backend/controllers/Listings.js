const Listing = require("../models/Listing");
const ExpressError = require("../utils/ExpressError"); // Added missing import
const { listingSchema } = require("../schema.js");    // Added missing import

module.exports.index = async (req, res) => {
    const alllistigs = await Listing.find({});
    res.json(alllistigs);
};

module.exports.newlisting = async (req, res) => {
    const newListing = new Listing(req.body);
    newListing.owner = req.user._id;
    await newListing.save();
    res.json(newListing);
};

module.exports.getlisting = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                select: "username",
            },
        })
        .populate("owner");
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.json(listing);
};

module.exports.updatelisting = async (req, res) => {
    const { id } = req.params;
    const updated = await Listing.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true, runValidators: true }
    );
    
    if (!updated) {
        throw new ExpressError(404, "Listing not found");
    }
    res.json(updated);
};

module.exports.deletelisting = async (req, res) => {
    const deleted = await Listing.findByIdAndDelete(req.params.id);
    if (!deleted) {
        throw new ExpressError(404, "Listing not found");
    }
    res.json({ message: "Listing deleted.....!" });
};

module.exports.owner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        throw new ExpressError(403, "You are not allowed to do that");
    }

    next();
};

// RENAMED: Changed from Listingvalidation to validateListing to match your router
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

// RENAMED: Changed from loginlisting to isLoggedIn to match your router
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        throw new ExpressError(401, "Please login first");
    }
    next();
};