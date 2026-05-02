const env=require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const methodoverride = require('method-override');
const mongoose = require('mongoose');
const cors = require('cors');
const Listing = require("./models/listing");

// NEW: Importing your Error Handling & Validation Utilities from the utils folder
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const { listingSchema } = require("./schema.js");

const mongo_url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/StayNest";
const port = process.env.PORT || 3030;

async function main() {
    try {
        await mongoose.connect(mongo_url);
        console.log("Mongo Db connected");
    }
    catch (err) {
        console.log(err);
    }
}
main();

app.use(cors()); 
app.use(express.json());

// NEW: Validation Middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

app.get("/", (req, res) => {
    res.send("hi,Welcome to our website");
})

// UPDATED: Replaced try/catch with wrapAsync
app.get("/listings", wrapAsync(async(req,res)=>{
    const alllistigs= await Listing.find({});
    res.json(alllistigs);
}));

app.get("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.json(listing);
}));

// UPDATED: Added validateListing middleware and wrapAsync
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body);
    await newListing.save();
    res.json(newListing);
}));

// UPDATED: Added validateListing middleware and wrapAsync
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
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

app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const deleted = await Listing.findByIdAndDelete(req.params.id);
    if (!deleted) {
        throw new ExpressError(404, "Listing not found");
    }
    res.json({ message: "Listing deleted!" });
}));

// NEW: Catch-all for undefined routes (Fixed for Express 5 compatibility)
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// NEW: Global Error Handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).json({ error: message });
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});