// const getImageFromBucket = require('../utils/getImageFromBucket');
const catchAsync = require('../utils/catchAsync');
const Order = require('../models/order-model');

const getAllOrders = catchAsync(async (req, res, next) => {

    const sellerId = req.user.id;

    // let orders = await Order.find().populate('product', 'name category price image').populate('userId', 'name address number');
    let orders = await Order.find().populate('product', 'name category price image sellerId').populate('userId', 'name address number _id');

    if (!orders)
        return res.status(200).json({
            status: 'success',
            data: null
        });

    orders = orders.filter(order => {
        return order.product.sellerId.toString() === sellerId;
    });

    // Convert the image name stored in the DB to the image url we'll use 
    // to fetch the image
    // for (const order of orders) {
    //     order.product.image = await getImageFromBucket(order.product.image);
    // }

    return res.status(200).json({
        status: 'success',
        data: {
            orders
        }
    });

});

const deleteOrderById = catchAsync(async (req, res, next) => {

    const orderId = req.params.orderId;

    await Order.findByIdAndDelete(orderId);

    return res.status(200).json({
        status: 'success',
        data: null
    });

})

module.exports = { getAllOrders, deleteOrderById };