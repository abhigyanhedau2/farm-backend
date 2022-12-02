const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, 'Please specify the category name.']
    },
    description: {
        type: String,
        required: [true, 'Please specify the category description.']
    },
    image: {
        type: String,
        required: [true, 'Please specify the category image.']
    }
});

const Category = new mongoose.model('Category', categorySchema);

module.exports = Category;