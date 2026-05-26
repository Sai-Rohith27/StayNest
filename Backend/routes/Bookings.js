const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const BookingController = require("../controllers/Bookings");

router.use(BookingController.isLoggedIn);

router.route("/")
    .get(wrapAsync(BookingController.getMyBookings))
    .post(wrapAsync(BookingController.createBooking));

router.route("/host")
    .get(wrapAsync(BookingController.getHostBookings));

router.route("/:bookingId")
    .get(wrapAsync(BookingController.getBooking));

router.route("/:bookingId/cancel")
    .patch(wrapAsync(BookingController.cancelBooking));

module.exports = router;
