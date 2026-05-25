
const mongoose = require('mongoose');
require("./review");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true 
    },
    description: {
        type: String
    },
     image: {
    filename: {
      type: String,
      default: "listingimagea",
    },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop", // Default fallback image
    }
  },
    images: [
        {
            filename: {
                type: String,
                default: "listing-gallery-image",
            },
            url: {
                type: String,
                trim: true,
            },
        }
    ],
    price: {
        type: Number
    },
    rating: {
        type: Number
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
    distance: {
        type: String
    },
    dates: {
        type: String
    },
    availabilityStart: {
        type: Date
    },
    availabilityEnd: {
        type: Date
    },
    maxGuests: {
        type: Number,
        default: 4
    },
    minGuestAge: {
        type: Number,
        default: 0
    },
    allowChildren: {
        type: Boolean,
        default: true
    },
    allowInfants: {
        type: Boolean,
        default: true
    },
    guestFavorite: {
        type: Boolean,
        default: false
    },
    freeCancellation: {
        type: Boolean,
        default: false
    },
    location: {
        type: String
    },
    country: {
        type: String
    },
    coordinates: {
        lat: Number,
        lng: Number
    },
    reviews:[
        {
            type
            :mongoose.Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});
 listingSchema.post('findOneAndDelete', async function(listing){
    if(listing){
        await mongoose.model("Review").deleteMany({
            _id: { $in: listing.reviews }
        });
    }
 });
// This checks if the model already exists before trying to compile it again
const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
module.exports = Listing;


