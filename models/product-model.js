const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please specify the product name']
    },
    category: {
        type: String,
        required: [true, 'Please specify the product category']
    },
    subCategory: {
        type: String,
        default: null
    },
    price: {
        type: Number,
        required: [true, 'Please specify the product price']
    },
    quantityPerBox: {
        type: String,
        required: [true, 'Please specify the number of products in a box']
    },
    calories: {
        type: Number,
        required: [true, 'Please specify the number of calories for the product']
    },
    veg: {
        type: String,
        required: [true, 'Please specify whether the product is veg, non-veg or egg'],
        enum: ['veg', 'nonveg', 'egg']
    },
    description: {
        type: String,
        required: [true, 'Please specify the description for the product']
    },
    icon: {
        type: String,
        required: [true, 'Please provide an icon for the product']
    },
    image: {
        type: String,
        required: [true, 'Please provide an image for the product']
    },
    sellerId: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'Please provide the seller ID for the product'],
        ref: 'User'
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating for the product']
    }
});

const Product = new mongoose.model('Product', productSchema);

module.exports = Product;