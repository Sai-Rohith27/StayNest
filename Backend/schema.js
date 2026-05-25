const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    rating: Joi.number().min(0).max(5),
    reviewsCount: Joi.number().integer().min(0),
    distance: Joi.string().allow("", null),
    dates: Joi.string().allow("", null),
    availabilityStart: Joi.date().allow("", null),
    availabilityEnd: Joi.date().allow("", null),
    maxGuests: Joi.number().integer().min(1).max(30),
    minGuestAge: Joi.number().integer().min(0).max(120),
    allowChildren: Joi.boolean(),
    allowInfants: Joi.boolean(),
    guestFavorite: Joi.boolean(),
    freeCancellation: Joi.boolean(),
    image: Joi.object({
        url: Joi.string().required(),
          filename: Joi.string().allow("", null)
    }).allow(null),
    images: Joi.array().items(
        Joi.object({
            url: Joi.string().required(),
            filename: Joi.string().allow("", null)
        })
    ).max(8),
    coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
    }).allow(null)
});
module.exports.reviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().min(12).max(500).required(),
    photoUrls: Joi.array().items(Joi.string().trim()).max(4).default([])
});
