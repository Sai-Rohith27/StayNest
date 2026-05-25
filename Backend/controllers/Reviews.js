const Review = require("../models/review"); // Fixed variable name to Review
const Listing = require("../models/Listing"); // Added missing Listing model import
const Booking = require("../models/Booking");
const ExpressError = require("../utils/ExpressError"); // Added missing import
const { reviewSchema } = require("../schema.js"); // Added missing import

// Internal helper function (or wrapper) to search database safely
const findListingWithReview = async (listingId, reviewId) => {
    const listing = await Listing.findOne({
        _id: listingId,
        reviews: reviewId,
    });

    if (!listing) {
        throw new ExpressError(404, "Review not found for this listing");
    }

    return listing;
};
// Export it in case it's needed elsewhere
module.exports.findListingWithReview = findListingWithReview;

module.exports.updatereview = async (req, res) => {
    const { id, reviewId } = req.params;

    await findListingWithReview(id, reviewId);
    const review = await Review.findByIdAndUpdate(
        reviewId,
        req.body,
        { new: true, runValidators: true }
    );

    if (!review) {
        throw new ExpressError(404, "Review not found");
    }

    res.json(review);
};

module.exports.reviewdelete = async (req, res) => {
    const { id, reviewId } = req.params;

    await findListingWithReview(id, reviewId);

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
        throw new ExpressError(404, "Review not found");
    }

    res.json({ message: "Review deleted!" });
};

module.exports.getreviewbyid = async (req, res) => {
    const { id, reviewId } = req.params;

    await findListingWithReview(id, reviewId);

    const review = await Review.findById(reviewId).populate("author", "username");
    if (!review) {
        throw new ExpressError(404, "Review not found");
    }

    res.json(review);
};

module.exports.createreview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const booking = await Booking.findOne({
        user: req.user._id,
        listing: id,
        status: "reserved",
    });

    if (!booking) {
        throw new ExpressError(403, "Only guests who booked this stay can review it");
    }

    const review = new Review(req.body);
    review.author = req.user._id;
    await review.save();

    listing.reviews.push(review._id);
    await listing.save();

    await review.populate("author", "username");
    res.status(201).json(review);
};

module.exports.getreviews = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
            select: "username",
        },
    });

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.json(listing.reviews);
};

module.exports.isReviewAuthorized = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new ExpressError(404, "Review not found");
    }

    if (!review.author || !review.author.equals(req.user._id)) {
        throw new ExpressError(403, "You are not allowed to modify this review");
    }

    next();
};

module.exports.logined = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        throw new ExpressError(401, "You must login first");
    }

    next();
};

module.exports.reviewvalidation = (req, res, next) => {
    const existingPhotoUrls = Array.isArray(req.body.photoUrls)
        ? req.body.photoUrls
        : req.body.photoUrls
            ? [req.body.photoUrls]
            : [];
    const uploadedPhotoUrls = Array.isArray(req.files)
        ? req.files.map((file) => file.path)
        : [];
    const { error, value } = reviewSchema.validate({
        ...req.body,
        photoUrls: [...uploadedPhotoUrls, ...existingPhotoUrls].slice(0, 4),
    });

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    req.body = value;
    next();
};
