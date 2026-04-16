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
        console.log(err);
    }
});


app.listen(3030, () => {
    console.log("server is listening on port 3030....");
});