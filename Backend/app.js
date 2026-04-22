const env=require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const methodoverride = require('method-override');
const mongoose = require('mongoose');
const cors = require('cors');  // ← ADD THIS
const Listing=require("./models/listing");

const mongo_url = process.env.MONGO_URL;
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

app.get("/", (req, res) => {
    res.send("hi,Welcome to our website");
})

app.get("/listings",async(req,res)=>{
    try{
        const alllistigs= await  Listing.find({});
    res.json(alllistigs);
    }
    catch(err){
        console.log(err);
    }
});

app.get("/listings/:id",async(req,res)=>{
    try{
        let {id}=req.params;
       const listing= await Listing.findById(id);
       res.json(listing);
    }
    catch(err){
         res.status(500).json({ error: err.message });
    }
});

app.post("/listings", async (req, res) => {
    try {
        const newListing = new Listing(req.body);
        await newListing.save();
        res.json(newListing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put("/listings/:id", async (req, res) => {
    try {
        const updated = await Listing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete("/listings/:id", async (req, res) => {
    try {
        await Listing.findByIdAndDelete(req.params.id);
        res.json({ message: "Listing deleted!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});

