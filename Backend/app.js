const env=require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const methodoverride = require('method-override');
const mongoose = require('mongoose');
const cors = require('cors');  // ← ADD THIS
const Listing=require("./models/listing");

const mongo_url = process.env.MONGO_URL;

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

app.get("/", (req, res) => {
    res.send("hi,Welcome to our website");
})

app.get("/testListing",async(req,res)=>{
     let samplelisting=new Listing({
         title:"My new Villa",
         description:"By the beach",
         price:1220,
         location:"Calangute , Goa",
         country:"India",
     });
    await  samplelisting.save();
    console.log("Sample was Saved");
    res.send("Successfull testing");
});

app.listen(3030, () => {
    console.log("server is listening on port 3030....");
});