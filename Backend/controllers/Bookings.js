const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const ExpressError = require("../utils/ExpressError");

function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        throw new ExpressError(401, "Please login first");
    }

    next();
}

function getNightCount(checkIn, checkOut) {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff || 1);
}

module.exports.isLoggedIn = isLoggedIn;

module.exports.createBooking = async (req, res) => {
    const { listingId, checkIn, checkOut, guests } = req.body;

    if (!listingId || !checkIn || !checkOut || !guests) {
        throw new ExpressError(400, "Listing, dates, and guests are required");
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
        throw new ExpressError(400, "Please choose valid check-in and check-out dates");
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const nightCount = getNightCount(startDate, endDate);
    const baseTotal = Number(listing.price || 0) * nightCount;
    const serviceFee = Math.round(baseTotal * 0.12);

    const booking = await Booking.create({
        user: req.user._id,
        listing: listing._id,
        checkIn: startDate,
        checkOut: endDate,
        guests: Number(guests),
        totalPrice: baseTotal + serviceFee,
    });

    await booking.populate("listing");
    res.status(201).json(booking);
};

module.exports.getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate("listing");

    res.json(bookings);
};

module.exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findOneAndUpdate(
        { _id: req.params.bookingId, user: req.user._id },
        { status: "cancelled" },
        { new: true }
    ).populate("listing");

    if (!booking) {
        throw new ExpressError(404, "Booking not found");
    }

    res.json(booking);
};
