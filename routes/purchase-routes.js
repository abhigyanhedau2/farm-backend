const express = require('express');

const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const purchaseControllers = require('../controllers/purchase-controllers');

const router = express.Router();

const {getMyPurchases} = purchaseControllers;

router.use(protect, restrictTo('customer'));

router.route('/')
    .get(getMyPurchases);   // GET user purchases

module.exports = router;