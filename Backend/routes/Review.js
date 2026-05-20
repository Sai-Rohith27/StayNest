const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { reviewSchema } = require("../schema.js");

const validateReview = (req, res, next) => {
    const { error, value } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    req.body = value;
    next();
};

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        throw new ExpressError(401, "You must login first");
    }

    next();
};

const isReviewAuthor = wrapAsync(async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new ExpressError(404, "Review not found");
    }

    if (!review.author || !review.author.equals(req.user._id)) {
        throw new ExpressError(403, "You are not allowed to modify this review");
    }

    next();
});

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

router.get("/", wrapAsync(async (req, res) => {
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
}));

router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const review = new Review(req.body);
    review.author = req.user._id;
    await review.save();

    listing.reviews.push(review._id);
    await listing.save();

    await review.populate("author", "username");
    res.status(201).json(review);
}));

router.get("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await findListingWithReview(id, reviewId);

    const review = await Review.findById(reviewId).populate("author", "username");
    if (!review) {
        throw new ExpressError(404, "Review not found");
    }

    res.json(review);
}));

router.put("/:reviewId", isLoggedIn, isReviewAuthor, validateReview, wrapAsync(async (req, res) => {
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
}));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
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
}));

module.exports = router;
