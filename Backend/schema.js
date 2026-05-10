const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.object({
        url: Joi.string().allow("", null),
        filename: Joi.string().allow("", null)
    }).required()
});

module.exports.reviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().min(12).max(500).required(),
    photoUrls: Joi.array().items(Joi.string().uri()).max(4).default([])
});
