const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    // Array of product description, individual product quantity and total price quantity * rate as objects
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

const Cart = new mongoose.model('Cart', cartSchema);

module.exports = Cart;