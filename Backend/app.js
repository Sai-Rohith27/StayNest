require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const methodoverride = require('method-override');
const mongoose = require('mongoose');
const cors = require('cors');  // ← ADD THIS

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

app.listen(3030, () => {
    console.log("server is listening on port 3030....");
});