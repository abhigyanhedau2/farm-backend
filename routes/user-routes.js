const express = require('express');

const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const userControllers = require('../controllers/user-controllers');

const router = express.Router();

const { signup, login, getAllUsers, getUserFromUserId, postASeller, getMyDetails, updateMe, deleteMe, sendRecoveryMail, resetPassword, getUserQueries, postQuery, deleteQuery, sendToken, verifySignUpToken } = userControllers;

// Signup / Create a new User
router.route('/sendToken').post(sendToken);
router.route('/verifyToken').post(verifySignUpToken);
router.route('/signup').post(signup);

// Login User
router.route('/login').post(login);

// Forgort Password
router.route('/forgotPassword')
    .post(sendRecoveryMail);  // Send recovery mail 

router.route('/resetPassword')
    .post(resetPassword);    // Store updated password in the DB

router.route('/queries')
    .post(postQuery);   // Post a query

router.route('/getUser/:userId')
    .get(getUserFromUserId); // GET a user from user id

// Protect all the routes below this middleware, to make sure user is logged in
router.use(protect);

// GET the list of all users, only accessible to admin
router.route('/')
    .get(restrictTo('admin'), getAllUsers)
    .patch(updateMe)    // UPDATE a user from user id
    .delete(deleteMe);  // DELETE a user from user id

router.route('/allqueries')
    .get(protect, restrictTo('admin'), getUserQueries);   // Get queries posted by user

router.route('/allqueries/:queryId')
    .delete(protect, restrictTo('admin'), deleteQuery);   // Get queries posted by user

router.route('/me')
    .get(protect, getMyDetails);

// POST a seller    
router.route('/addSeller')
    .post(protect, restrictTo('admin'), postASeller);

module.exports = router;