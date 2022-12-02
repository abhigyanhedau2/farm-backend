// const getImageFromBucket = require('../utils/getImageFromBucket');
const Purchase = require("../models/purchase-model");
const catchAsync = require("../utils/catchAsync");

const getMyPurchases = catchAsync(async (req, res, next) => {

    const userId = req.user.id;

    // const purchases = await Purchase.find({ userId });
    const purchases = await Purchase.find({ userId }).sort({ orderedOn: -1 }).populate('products.product', 'name category price quantityPerBox veg icon image');

    // Convert the image name stored in the DB to the image url we'll use 
    // to fetch the image
    // for (const purchase of purchases) {

    //     for (const products of purchase.products) {
    //         products.product.image = await getImageFromBucket(products.product.image);
    //     }

    // }

    if (!purchases)
        return res.status(200).json({
            status: 'success',
            data: null
        });

    res.status(200).json({
        status: 'success',
        data: {
            purchases
        }
    });

});

module.exports = { getMyPurchases };