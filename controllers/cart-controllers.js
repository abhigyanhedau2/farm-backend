const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const getImageFromBucket = require('../utils/getImageFromBucket');
const Cart = require('../models/cart-model');
const Order = require('../models/order-model');
const Purchase = require('../models/purchase-model');

// GET the cart products
const getCart = catchAsync(async (req, res, next) => {

    const userId = req.params.userId;

    // Verify the user
    if (req.user.id !== userId)
        return next(new AppError(403, 'Forbidden. You do not have access.'));

    const cart = await Cart.findOne({ userId }).populate('products.product', 'name category price quantityPerBox veg icon image description');

    // for (const product of cart.products) {
    //     product.product.image = await getImageFromBucket(product.product.image);
    // }

    // If no cart is found, send null
    if (!cart)
        return res.status(204).json({
            status: 'success',
            data: null
        });

    // Else send success
    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });

});

// GET the unpopulated cart products for updation
const getUnpopulatedCart = catchAsync(async (req, res, next) => {

    const userId = req.params.userId;

    // Verify the user
    if (req.user.id !== userId)
        return next(new AppError(403, 'Forbidden. You do not have access.'));

    const cart = await Cart.findOne({ userId });

    // If no cart is found, send null
    if (!cart)
        return res.status(200).json({
            status: 'success',
            data: {
                cart: {
                    products: [],
                    totalItems: 0,
                    cartPrice: 0
                }
            }
        });

    // Else send success
    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });

});

// POST the cart - Place the Order
// Add Products in order collection --> Add Cart in Purchases collection --> 
// Delete Cart since it is now moved to collection --> return the Purchase
const postCart = catchAsync(async (req, res, next) => {

    const userId = req.params.userId;

    // Verify the user
    if (req.user.id !== userId)
        return next(new AppError(403, 'Forbidden. You do not have access.'));

    const { products, totalItems, cartPrice } = req.body;

    // Add products in order collection for sellers to see
    products.forEach(async orderItem => {
        await Order.create({
            product: orderItem.product,
            totalProductsPrice: orderItem.totalProductsPrice,
            totalProductsQuantity: orderItem.totalProductsQuantity,
            userId: req.user.id,
            sellerId: orderItem.product.sellerId
        });
    });

    // Add this purchase in the purchase collection for users to see placed orders
    const newPurchase = await Purchase.create({
        products: products,
        totalItems: totalItems,
        cartPrice: cartPrice,
        userId: req.user.id
    });

    // Delete cart since order is placed and moved to Purchase collection
    await Cart.deleteOne({ userId });

    // Return the new purchase
    res.status(200).json({
        status: 'success',
        data: {
            purchase: newPurchase
        }
    });

});

// UPDATE the cart for every adding and removing of product
const updateCart = catchAsync(async (req, res, next) => {

    const userId = req.params.userId;

    // Verify the user
    if (req.user.id !== userId)
        return next(new AppError(403, 'Forbidden. You do not have access.'));

    const { products, totalItems, cartPrice } = req.body;

    const cart = await Cart.findOne({ userId });

    // If no cart is found, create one
    if (!cart) {

        const newCart = await Cart.create({ products, totalItems, cartPrice, userId });

        return res.status(200).json({
            status: 'success',
            data: {
                cart: newCart
            }
        });

    }

    // If cart is found, update cart
    await Cart.updateOne({ userId }, { products, totalItems, cartPrice }, { new: true });

    // Send the updated cart
    const updatedCart = await Cart.findOne({ userId });

    res.status(200).json({
        status: 'success',
        data: {
            cart: updatedCart
        }
    });

});

// DELETE the cart
const deleteCart = catchAsync(async (req, res, next) => {

    const userId = req.params.userId;

    // Verify the user
    if (req.user.id !== userId)
        return next(new AppError(403, 'Forbidden. You do not have access.'));

    // Delete cart
    await Cart.deleteOne({ userId });

    res.send(204).json({
        status: 'success',
        data: null
    });
});

module.exports = { getCart, postCart, updateCart, deleteCart, getUnpopulatedCart };