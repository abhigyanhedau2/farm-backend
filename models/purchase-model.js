const mongoose = require('mongoose');

// A duplication of cart-model for users to see their purchases
const purchaseSchema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        },
        totalProductsPrice: {
            type: Number
        },
        totalProductsQuantity: {
            type: Number
        }
    }],
    orderedOn: {
        type: Date,
        default: new Date().toLocaleString()
    },
    totalItems: {
        type: Number
    },
    cartPrice: {
        type: Number
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

const Purchase = new mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;