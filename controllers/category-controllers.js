// const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const validator = require('validator');
// const crypto = require('crypto');
// const getImageFromBucket = require('../utils/getImageFromBucket');
const cloudinary = require('../utils/cloudinary');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Category = require('../models/category-model');
const Product = require('../models/product-model');

// Fn to generate random image name
// const randomImageName = () => {
//     return crypto.randomBytes(32).toString('hex');
// };

// Creating a S3 client
// const s3 = new S3Client({
//     credentials: {
//         accessKeyId: process.env.BUCKET_ACCESS_KEY,
//         secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
//     },
//     region: process.env.BUCKET_REGION
// });

const getCategories = catchAsync(async (req, res, next) => {

    const categories = await Category.find();

    if (!categories)
        return res.status(204).json({
            status: 'success',
            data: null
        });

    // Convert the image name stored in the DB to the image url we'll use 
    // to fetch the image
    // for (const category of categories) {
    //     category.image = await getImageFromBucket(category.image);
    // }

    res.status(200).json({
        status: 'success',
        data: {
            categories
        }
    });

});

const postACategory = catchAsync(async (req, res, next) => {

    const { category, description } = req.body;

    if (validator.isEmpty(category) || validator.isEmpty(description))
        return next(new AppError(400, 'Please add category name and description'));

    // Get a new random image name
    // const newImageName = randomImageName();

    const result = await cloudinary.uploader.upload(req.file.path);

    // Set params before sending the request
    // const params = {
    //     Bucket: process.env.BUCKET_NAME,
    //     Key: newImageName,
    //     Body: req.file.buffer,
    //     ContentType: req.file.mimetype
    // };

    // // Create and send command to send and store the object - image
    // const putObjCommand = new PutObjectCommand(params);
    // await s3.send(putObjCommand);

    // Create a new document to be stored in the DB
    const newCategory = await Category.create({
        category,
        image: result.secure_url,
        description
    });

    res.status(201).json({
        status: 'success',
        data: {
            category: newCategory
        }
    });

});

const deleteACategory = catchAsync(async (req, res, next) => {

    const { category } = req.body;

    await Product.deleteMany({ category });

    const toBeDeletedCategory = await Category.findOne({ category });

    // Set params before sending a request
    // const params = {
    //     Bucket: process.env.BUCKET_NAME,
    //     Key: toBeDeletedCategory.image
    // }

    // // Create and send the delete object command
    // const delObjCommand = new DeleteObjectCommand(params);
    // await s3.send(delObjCommand);

    await cloudinary.uploader.destroy(toBeDeletedCategory.image);

    await Category.deleteMany({ category });

    return res.status(204).json({
        status: 'success',
        data: null
    });

});

module.exports = { getCategories, postACategory, deleteACategory };