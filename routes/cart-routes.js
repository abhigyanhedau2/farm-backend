const express = require('express');
const protect = require('../middlewares/protect');
const cartControllers = require('../controllers/cart-controllers');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

const { getCart, postCart, updateCart, deleteCart, getUnpopulatedCart } = cartControllers;

router.use(protect);
router.use(restrictTo('customer'));

router.route('/:userId')
    .get(getCart)   // GET the cart
    .post(postCart)  // POST the cart - Order Placed
    .patch(updateCart)  // UPDATE the cart if an item is added or removed
    .delete(deleteCart);    // DELETE the cart

router.route('/unpopulated/:userId').get(getUnpopulatedCart);

module.exports = router;