// const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const crypto = require('crypto');
const validator = require('validator');
const cloudinary = require('../utils/cloudinary');

const Product = require('../models/product-model');
const SubCategory = require('../models/subcategory-model');
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
// const getImageFromBucket = require('../utils/getImageFromBucket');

// Fn to generate random image name
// const randomImageName = () => {
//     return crypto.randomBytes(32).toString('hex');
// };

// // Creating a S3 client
// const s3 = new S3Client({
//     credentials: {
//         accessKeyId: process.env.BUCKET_ACCESS_KEY,
//         secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
//     },
//     region: process.env.BUCKET_REGION
// });

// GET All the products stored in the DB
const getAllProducts = catchAsync(async (req, res, next) => {

    // Get the products from the DB
    const products = await Product.find();

    if (!products)
        return res.status(204).json({
            status: 'success',
            data: null
        });

    // // Convert the image name stored in the DB to the image url we'll use 
    // // to fetch the image
    // for (const product of products) {
    //     product.image = await getImageFromBucket(product.image);
    // }

    res.json({
        status: 'success',
        results: products.length,
        data: {
            products
        }
    })

});

// GET a product from product id
const getProductFromId = catchAsync(async (req, res, next) => {

    const productId = req.params.productId;

    // Search for the required product
    const product = await Product.findById(productId);

    // If product does not exists, send an error
    if (!product)
        return next(new AppError(404, `No product found with product id ${productId}`));

    // product.image = await getImageFromBucket(product.image);

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });

});

// GET products by category
const getProductsByCategory = catchAsync(async (req, res, next) => {

    const category = req.params.category.toString();

    // const products = await Product.find({ category: category });

    const products = await Product.aggregate([
        {
            $match: {
                category: category
            }
        },
        {
            $sort: {
                price: 1
            }
        }
    ]);

    if (!products) {
        next();
    }

    // Convert the image name stored in the DB to the image url we'll use 
    // to fetch the image
    // for (const product of products) {

    //     // Set params before sending the request
    //     const getObjParams = {
    //         Bucket: process.env.BUCKET_NAME,
    //         Key: product.image,
    //     }

    //     // Send a get request for the image
    //     const getObjCommand = new GetObjectCommand(getObjParams);
    //     const url = await getSignedUrl(s3, getObjCommand, { expiresIn: 3600 });

    //     // Set the fetch url to the image
    //     product.image = url;
    // }

    res.status(200).json({
        status: 'success',
        results: products.length,
        products
    });

});

const getProductsBySellerId = catchAsync(async (req, res, next) => {

    const sellerId = req.params.sellerId;

    // console.log(sellerId);
    // console.log(req.user._id);

    if (sellerId !== req.user._id.toString())
        return next(new AppError(401, 'Unauthorized access'));

    const products = await Product.find();

    if (!products)
        return res.status(204).json({
            status: 'success',
            data: null
        });

    const currSellerProducts = products.filter(product => product.sellerId.toString() === sellerId);

    // for (const product of currSellerProducts) {
    //     product.image = await getImageFromBucket(product.image);
    // }

    res.json({
        status: 'success',
        results: currSellerProducts.length,
        data: {
            products: currSellerProducts
        }
    });

});

// POST A new product by the seller
const postAProduct = catchAsync(async (req, res, next) => {

    // Extract the required data from req.body
    const { name, category, subCategory, price, quantityPerBox, calories, veg, description, icon, rating } = req.body;

    if (validator.isEmpty(name) ||
        validator.isEmpty(category) ||
        validator.isEmpty(price) ||
        validator.isEmpty(quantityPerBox) ||
        validator.isEmpty(calories) ||
        validator.isEmpty(veg) ||
        validator.isEmpty(description) ||
        validator.isEmpty(icon) ||
        validator.isEmpty(rating))
        return next(new AppError(400, 'Please add complete and correct details for product addition'));

    const result = await cloudinary.uploader.upload(req.file.path);

    let productSubCategory = subCategory === "null" ? null : subCategory;

    // Create a new document to be stored in the DB
    const newProduct = await Product.create({
        name,
        category,
        subCategory: productSubCategory,
        price,
        quantityPerBox,
        calories,
        veg,
        description,
        icon,
        image: result.secure_url,
        sellerId: req.user._id,
        rating
    });

    res.status(201).json({
        status: 'success',
        data: {
            product: newProduct
        }
    });

});

// UPDATE a product from product id
const updateProductById = catchAsync(async (req, res, next) => {

    const productId = req.params.productId;
    const userId = req.user._id.toString();

    // Search the required product 
    const product = await Product.findById(productId);

    // If product does not exists, send an error
    if (!product)
        return next(new AppError(404, `No product found with product id ${productId}`));

    if (product.sellerId.toString() !== userId)
        return next(new AppError(401, `You cannot update the product since, you have not created it`));

    // Extract the required data from req.body
    const { name, category, subCategory, price, quantityPerBox, calories, veg, description, icon, rating } = req.body;

    // All textual data comes in req.body
    // All image data comes in req.file
    // Actual image = req.file.buffer

    let result;

    if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
    }

    // Create a new document to be stored in the DB
    const updatedProduct = await Product.findByIdAndUpdate(productId, {
        name,
        category,
        subCategory,
        price,
        quantityPerBox,
        calories,
        veg,
        description,
        icon,
        image: result ? result.secure_url : undefined,
        sellerId: req.user._id,
        rating
    }, { new: true });

    res.status(201).json({
        status: 'success',
        data: {
            product: updatedProduct
        }
    });


});

// DELETE A product by the seller
const deleteAProduct = catchAsync(async (req, res, next) => {

    const productId = req.params.productId;
    const userId = req.user._id.toString();

    // Search the required product 
    const product = await Product.findById(productId);

    // If product does not exists, send an error
    if (!product)
        return next(new AppError(404, `No product found with product id ${productId}`));

    if (product.sellerId.toString() !== userId)
        return next(new AppError(401, `You cannot delete the product since, you have not created it`));

    // // Set params before sending a request
    // const params = {
    //     Bucket: process.env.BUCKET_NAME,
    //     Key: product.image
    // }

    // // Create and send the delete object command
    // const delObjCommand = new DeleteObjectCommand(params);
    // await s3.send(delObjCommand);

    await cloudinary.uploader.destroy(product.image);

    // Delete the product from the DB
    await Product.findByIdAndDelete(productId);

    res.status(204).json({
        status: 'success',
        data: null
    });

});

const getAllSubCategories = catchAsync(async (req, res, next) => {

    const subcategories = await SubCategory.find();

    res.status(200).json({
        status: 'success',
        data: {
            subcategories
        }
    });

});

const postSubCategory = catchAsync(async (req, res, next) => {

    const { subCategory } = req.body;

    const newSubCategory = await SubCategory.create({ subCategory: subCategory });

    res.status(201).json({
        status: 'success',
        data: {
            subCategory: newSubCategory
        }
    });

});

module.exports = { postAProduct, getAllProducts, deleteAProduct, getProductFromId, getProductsByCategory, updateProductById, getAllSubCategories, postSubCategory, getProductsBySellerId };