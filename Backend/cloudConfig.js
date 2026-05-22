const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require("dotenv").config(); // CRITICAL: Ensure dotenv loads before Cloudinary connects

// 1. Authenticate with Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
});

// 2. Setup Storage for Listings
const listingStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Staynedt_Listings', // Folder name in your Cloudinary media library
        allowedFormats: ['png', 'jpg', 'jpeg', 'webp']
    },
});

// 3. Setup Storage for Reviews
const reviewStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Staynedt_Reviews',
        allowedFormats: ['png', 'jpg', 'jpeg', 'webp']
    },
});

// 4. Validate that the uploaded file is actually an image (Security feature)
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

module.exports = {
    cloudinary,
    listingStorage,
    reviewStorage,
    imageFileFilter
};