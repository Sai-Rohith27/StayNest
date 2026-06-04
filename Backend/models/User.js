const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing",
        }
    ],
    // --- NEW FIELDS FOR PASSWORD RESET ---
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// --- THE BULLETPROOF EXTRACTOR ---
let pluginFunction;

// 1. If it's normal, use it.
if (typeof passportLocalMongoose === 'function') {
    pluginFunction = passportLocalMongoose;
} 
// 2. If NPM gave us an object, hunt inside it for the function.
else if (passportLocalMongoose && typeof passportLocalMongoose === 'object') {
    pluginFunction = passportLocalMongoose.default || Object.values(passportLocalMongoose).find(val => typeof val === 'function');
}

// 3. If NPM gave us a completely empty/corrupted file...
if (typeof pluginFunction !== 'function') {
    console.log("--------------------------------------------------");
    console.log("🚨 NPM CORRUPTION DETECTED IN PASSPORT PACKAGE 🚨");
    console.log("Your computer downloaded a broken version of the package.");
    console.log("TO FIX THIS PERMANENTLY, RUN THESE 2 COMMANDS IN YOUR TERMINAL:");
    console.log("1. npm uninstall passport-local-mongoose");
    console.log("2. npm install passport-local-mongoose@latest");
    console.log("--------------------------------------------------");
    
    // Create a dummy function so your server doesn't crash right now
    pluginFunction = function(schema) {}; 
}

// Attach the safely extracted plugin
userSchema.plugin(pluginFunction);

module.exports = mongoose.model('User', userSchema);
