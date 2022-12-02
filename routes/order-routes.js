const express = require('express');

const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const orderControllers = require('../controllers/order-controllers');

const router = express.Router();

const { getAllOrders, deleteOrderById } = orderControllers;

// Routes for seller to see the orders placed and delete the orders once completed
router.use(protect);
router.use(restrictTo('seller'));

router.route('/')
    .get(getAllOrders); // GET all the orders which are placed by customers

router.route('/:orderId')
    .delete(deleteOrderById); // DELETE the order which are completed

module.exports = router;