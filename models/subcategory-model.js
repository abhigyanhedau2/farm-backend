const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    subCategory: {
        type: String
    }
});

const SubCategory = new mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;