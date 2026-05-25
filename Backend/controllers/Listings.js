const Listing = require("../models/Listing");
const ExpressError = require("../utils/ExpressError"); // Added missing import
const { listingSchema } = require("../schema.js");    // Added missing import

const monthLookup = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
};

function parseListingDateRange(dates, year) {
    const match = String(dates || "").match(/(\d{1,2})\s*-\s*(\d{1,2})\s*([A-Za-z]{3,})/);
    if (!match) {
        return null;
    }

    const month = monthLookup[match[3].slice(0, 3).toLowerCase()];
    if (month === undefined) {
        return null;
    }

    return {
        start: new Date(year, month, Number(match[1])),
        end: new Date(year, month, Number(match[2])),
    };
}

function listingMatchesDateRange(listing, startDate, endDate) {
    if (!startDate || !endDate) {
        return true;
    }

    if (listing.availabilityStart && listing.availabilityEnd) {
        return listing.availabilityStart <= startDate && listing.availabilityEnd >= endDate;
    }

    const parsedDates = parseListingDateRange(listing.dates, startDate.getFullYear());
    if (!parsedDates) {
        return true;
    }

    return parsedDates.start <= startDate && parsedDates.end >= endDate;
}

module.exports.index = async (req, res) => {
    const {
        destination,
        checkIn,
        checkOut,
        adults = 0,
        children = 0,
        infants = 0,
        childAges = "",
    } = req.query;

    const filters = {};
    const trimmedDestination = String(destination || "").trim();
    const requestedGuests = Number(adults || 0) + Number(children || 0);
    const requestedInfants = Number(infants || 0);
    const parsedChildAges = String(childAges || "")
        .split(",")
        .map((age) => Number(age))
        .filter((age) => Number.isFinite(age));
    const youngestChildAge = parsedChildAges.length ? Math.min(...parsedChildAges) : null;
    const startDate = checkIn ? new Date(checkIn) : null;
    const endDate = checkOut ? new Date(checkOut) : null;

    if (trimmedDestination) {
        const destinationRegex = new RegExp(trimmedDestination.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filters.$or = [
            { title: destinationRegex },
            { location: destinationRegex },
            { country: destinationRegex },
        ];
    }

    if (requestedGuests > 0) {
        filters.$and = [
            ...(filters.$and || []),
            {
                $or: [
                    { maxGuests: { $exists: false } },
                    { maxGuests: { $gte: requestedGuests } },
                ],
            },
        ];
    }

    if (requestedInfants > 0) {
        filters.$and = [
            ...(filters.$and || []),
            {
                $or: [
                    { allowInfants: { $exists: false } },
                    { allowInfants: true },
                ],
            },
        ];
    }

    if (Number(children) > 0) {
        filters.$and = [
            ...(filters.$and || []),
            {
                $or: [
                    { allowChildren: { $exists: false } },
                    { allowChildren: true },
                ],
            },
        ];
    }

    if (youngestChildAge !== null) {
        filters.$and = [
            ...(filters.$and || []),
            {
                $or: [
                    { minGuestAge: { $exists: false } },
                    { minGuestAge: { $lte: youngestChildAge } },
                ],
            },
        ];
    }

    if (startDate instanceof Date && !Number.isNaN(startDate.getTime()) && endDate instanceof Date && !Number.isNaN(endDate.getTime())) {
        filters.$and = [
            ...(filters.$and || []),
            {
                $or: [
                    { availabilityStart: { $exists: false } },
                    { availabilityEnd: { $exists: false } },
                    {
                        availabilityStart: { $lte: startDate },
                        availabilityEnd: { $gte: endDate },
                    },
                ],
            },
        ];
    }

    let alllistigs = await Listing.find(filters);

    if (startDate instanceof Date && !Number.isNaN(startDate.getTime()) && endDate instanceof Date && !Number.isNaN(endDate.getTime())) {
        alllistigs = alllistigs.filter((listing) => listingMatchesDateRange(listing, startDate, endDate));
    }

    res.json(alllistigs);
};

module.exports.newlisting = async (req, res) => {
      
    const listingData = { ...req.body };

    if (req.file) {
        listingData.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    } else if (req.body.imageUrl) {
        listingData.image = {
            url: req.body.imageUrl,
            filename: req.body.imageFilename || "listingimage",
        };
    }

    delete listingData.imageUrl;
    delete listingData.imageFilename;

    const newListing = new Listing(listingData);
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
    const listingData = { ...req.body };

    if (req.file) {
        listingData.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    } else if (req.body.imageUrl) {
        listingData.image = {
            url: req.body.imageUrl,
            filename: req.body.imageFilename || "listingimage",
        };
    }

    delete listingData.imageUrl;
    delete listingData.imageFilename;

    const updated = await Listing.findByIdAndUpdate(
        id,
        listingData,
        { new: true, runValidators: true }
    );
    
    if (!updated) {
        throw new ExpressError(404, "Listing not found");
    }
    res.json(updated);
};

module.exports.updateCoordinates = async (req, res) => {
    const { id } = req.params;
    const lat = Number(req.body?.lat);
    const lng = Number(req.body?.lng);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
        throw new ExpressError(400, "Valid latitude and longitude are required");
    }

    const updated = await Listing.findByIdAndUpdate(
        id,
        { coordinates: { lat, lng } },
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
    const { imageUrl, imageFilename, ...body } = req.body;
    const listingData = {
        ...body,
        image: req.file
            ? {
                url: req.file.path,
                filename: req.file.filename,
            }
            : {
                url: imageUrl,
                filename: imageFilename || "listingimage",
            },
    };
    const { error } = listingSchema.validate(listingData);
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
