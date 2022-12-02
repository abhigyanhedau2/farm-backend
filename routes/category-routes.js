const express = require('express');
// const multer = require('multer');

const upload = require('../utils/multer');

const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const categoryControllers = require('../controllers/category-controllers');

const router = express.Router();

const { getCategories, postACategory, deleteACategory } = categoryControllers;

// Create a memory storage object and a upload function with multer 
// which makes sure that it always stores the image in memory
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

router.route('/')
    .get(getCategories)
    .post(protect, restrictTo('seller'), upload.single('image'), postACategory)
    .delete(protect, restrictTo('seller'), deleteACategory);

module.exports = router;