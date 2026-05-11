
const mongoose = require('mongoose');

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
      default: "listingimage",
    },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop", // Default fallback image
    }
  },
    price: {
        type: Number
    },
    location: {
        type: String
    },
    country: {
        type: String
    },
    reviews:[
        {
            type
            :mongoose.Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
});
 listingSchema.post('findOneAndDelete', async function(listing){
    if(listing){
        await mongoose.model("Review").deleteMany({
            _id: { $in: listing.reviews }
        });
    }
 });
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;