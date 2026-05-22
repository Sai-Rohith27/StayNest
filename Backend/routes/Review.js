// const express = require("express");
// const router = express.Router({ mergeParams: true });
// const wrapAsync = require("../utils/wrapAsync");
// const ExpressError = require("../utils/ExpressError");
// const Listing = require("../models/listing");
// const Review = require("../models/review");
// const { reviewSchema } = require("../schema.js");
// const ReviewsController = require("../controllers/Reviews");

// const validateReview = ReviewsController.validateReview;

// const isLoggedIn =ReviewsController.isLoggedIn;

// const isReviewAuthor = wrapAsync(ReviewsController.isReviewAuthorized);

// const findListingWithReview = async (ReviewsController.findListingWithReview);

// router.route("/")
//     .get(wrapAsync(ReviewsController.getreviews))
//     .post(isLoggedIn, validateReview, wrapAsync(ReviewsController.createreview));

// router.route("/:reviewId")
//     .get(wrapAsync(ReviewsController.getreviewbyid))
//     .put(isLoggedIn, isReviewAuthor, validateReview, wrapAsync(ReviewsController.updatereview))
//     .delete(isLoggedIn, isReviewAuthor, wrapAsync(ReviewsController.reviewdelete));

// module.exports = router;
const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ReviewsController = require("../controllers/Reviews");
const multer = require("multer");
const { imageFileFilter, reviewStorage } = require("../cloudConfig");

const upload = multer({
    storage: reviewStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 },
});

// Extract the correctly named middleware from your controller
const { reviewvalidation: validateReview, logined: isLoggedIn } = ReviewsController;
const isReviewAuthor = wrapAsync(ReviewsController.isReviewAuthorized);

// 1. Root Path Group: '/'
router.route("/")
    .get(wrapAsync(ReviewsController.getreviews))
    .post(isLoggedIn, upload.array("photos", 4), validateReview, wrapAsync(ReviewsController.createreview));

// 2. ID-Specific Path Group: '/:reviewId'
router.route("/:reviewId")
    .get(wrapAsync(ReviewsController.getreviewbyid))
    .put(isLoggedIn, isReviewAuthor, upload.array("photos", 4), validateReview, wrapAsync(ReviewsController.updatereview))
    .delete(isLoggedIn, isReviewAuthor, wrapAsync(ReviewsController.reviewdelete));

module.exports = router;
