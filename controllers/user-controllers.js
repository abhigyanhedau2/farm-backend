const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const nodemailer = require('nodemailer');
const uuid = require('uuid').v4;

const User = require('../models/user-model');
const UserToken = require('../models/user-token-model');
const Query = require('../models/query-model');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Cart = require('../models/cart-model');

const sendToken = catchAsync(async (req, res, next) => {

    // Get the required fields from req.body
    const { email } = req.body;

    if (!email || !validator.isEmail(email))
        return next(new AppError(400, 'Enter a valid email'));

    const user = await User.findOne({ email: email });
    const usertoken = await UserToken.findOne({ email: email });

    if (user)
        return next(new AppError(404, `A user already exists with this email. Try Logging In.`));

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.USER_PASS
        }
    });

    const resetToken = uuid();
    const hashedToken = await bcrypt.hash(resetToken, 12);

    if (!usertoken) {
        await UserToken.create({
            email: email,
            token: hashedToken
        });
    } else {
        await UserToken.updateOne({ email: email }, { token: hashedToken });
    }

    const message = `Hey, Welcome to Birch Wood Ranch. Thank you for registering. \n\nYou may sign up by copying and pasting the following token at the signup screen - ${resetToken} \n\nHave a nice day!\n\nRegards,\nBirch Wood Ranch by Abhigyan Hedau`;

    const mailOptions = {
        from: process.env.USER_MAIL,
        // to: 'spam22010904@gmail.com',
        to: email,
        subject: 'Account Verification Mail',
        text: message
    };

    transporter.sendMail(mailOptions, function (error) {
        if (error)
            return next(new AppError(500, 'Internal server error'));
    });

    res.status(200).json({
        status: 'success'
    });

});

const verifySignUpToken = catchAsync(async (req, res, next) => {

    const { email, token } = req.body;

    if (!token)
        return next(new AppError(400, 'Enter the token'));

    const user = await UserToken.findOne({ email: email });

    if (!user)
        return next(new AppError(404, `No user found with email ${userMail}. Try Signing Up Again.`));

    // Check if the token is correct or not
    const tokenIsCorrect = await bcrypt.compare(token, user.token);

    if (!tokenIsCorrect)
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid token'
        });

    res.status(200).json({
        status: 'success'
    });

});

// Signup / Create a new User
const signup = catchAsync(async (req, res, next) => {

    // Get the required fields from req.body
    const { name, email, password, address, number } = req.body;

    // Convert 'number' to number for validation
    const stringedNumber = number + '';

    // Perform the respective validations
    if (validator.isEmpty(name) ||
        !validator.isEmail(email) ||
        !validator.isLength(password, { min: 6 }) ||
        validator.isEmpty(address) ||
        !validator.isLength(stringedNumber, { min: 10, max: 10 })
    )
        return next(new AppError(400, 'Please add complete and correct details for sign up'));

    // Check if a user with the email exists previously
    const existingUser = await User.findOne({ email });

    // If the user already exists with the email, return an error
    if (existingUser)
        return next(new AppError(400, 'User already exists. Try logging in.'));

    // Hash the password before storing in DB
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        address,
        number
    });

    await Cart.create({
        products: [],
        totalItems: 0,
        cartPrice: 0,
        userId: newUser._id
    });

    // Create JWT token and sign it
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });

    await UserToken.deleteOne({ email: newUser.email });

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
            token
        }
    });

});

// Login User
const login = catchAsync(async (req, res, next) => {

    // Get the required fields from req.body
    const { email, password } = req.body;

    // Check if provided email and password are valid or not
    if (!validator.isEmail(email) ||
        !validator.isLength(password, { min: 6 }))
        return next(new AppError(400, 'Please add complete and correct details for login.'));

    // Get the user from DB along with password, we need to explicitly select password
    // because we set select: false for password
    const user = await User.findOne({ email }).select('+password');

    // If the user does not exists, send error
    if (!user)
        return next(new AppError(400, 'Invalid credentials. Wrong email or password.'));

    // Check if the password is correct or not
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    // If the password is incorrect send error
    if (!passwordIsCorrect)
        return next(new AppError(400, 'Invalid credentials. Wrong email or password.'));

    // Create JWT token and sign it
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });

    res.status(201).json({
        status: 'success',
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                number: user.number,
                address: user.address
            },
            token
        }
    });
});

// GET the list of all users - Only accessible to admin
const getAllUsers = catchAsync(async (req, res, next) => {

    const users = await User.find();

    if (!users) {
        return res.status(204).json({
            status: 'success',
            results: 0,
            data: {
                users: []
            }
        });
    }

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users: users
        }
    });

});

// GET a user from user id
const getUserFromUserId = catchAsync(async (req, res, next) => {

    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user)
        return next(new AppError(404, `No user found with user id ${userId}`));

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });

});

const postASeller = catchAsync(async (req, res, next) => {

    // Get the required fields from req.body
    const { name, email, password, address, number, role } = req.body;

    // Convert 'number' to number for validation
    const stringedNumber = number + '';

    // Perform the respective validations
    if (validator.isEmpty(name) ||
        !validator.isEmail(email) ||
        !validator.isLength(password, { min: 6 }) ||
        validator.isEmpty(address) ||
        !validator.isLength(stringedNumber, { min: 10, max: 10 })
    )
        return next(new AppError(400, 'Please add complete and correct details for sign up'));

    // Check if a user with the email exists previously
    const existingUser = await User.findOne({ email });

    // If the user already exists with the email, return an error
    if (existingUser)
        return next(new AppError(400, 'Seller already exists. Try logging in.'));

    // Hash the password before storing in DB
    const hashedPassword = await bcrypt.hash(password, 12);

    const newSeller = await User.create({
        name,
        email,
        password: hashedPassword,
        address,
        number,
        role
    });

    res.status(201).json({
        status: 'success',
        data: {
            user: newSeller
        }
    });

});

// GET user details
const getMyDetails = catchAsync(async (req, res, next) => {

    const userId = req.user._id;

    // Fetch the user from DB
    const user = await User.findById(userId);

    if (!user)
        return next(new AppError(404, `No user found with user id ${userId}`));

    const { name, address, number } = user;

    res.status(200).json({
        status: 'success',
        data: {
            name,
            address,
            number
        }
    });

});

// UPDATE a user from user id
const updateMe = catchAsync(async (req, res, next) => {

    const userId = req.user._id;

    // Fetch the user from DB
    const user = await User.findById(userId);

    // If no user is found, throw an error
    if (!user)
        return next(new AppError(404, `No user found with user id ${userId}`));

    // Extract required fields from body
    const { name, address, number } = req.body;

    // Validate the fields
    if (name !== undefined) {
        if (validator.isEmpty(name))
            return next(new AppError(400, 'Please add a name for updation'));
    }

    if (address !== undefined) {
        if (validator.isEmpty(address))
            return next(new AppError(400, 'Please add an address for updation'));
    }

    if (number !== undefined) {

        const stringedNumber = number + '';

        if (!validator.isLength(stringedNumber, { min: 10, max: 10 }))
            return next(new AppError(400, 'Please add a 10 digit number for updation'));
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(userId, { name, address, number }, { new: true });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });

});

const deleteMe = catchAsync(async (req, res, next) => {

    const userId = req.user._id;

    // Fetch the user from DB
    const user = await User.findById(userId);

    // If no user is found, throw an error
    if (!user)
        return next(new AppError(404, `No user found with user id ${userId}`));

    await User.findByIdAndDelete(userId);

    res.status(204).json({
        status: 'success',
        data: null
    })

});

const sendRecoveryMail = catchAsync(async (req, res, next) => {

    const userMail = req.body.email;

    if (!userMail || !validator.isEmail(userMail))
        return next(new AppError(400, 'Enter a valid email'));

    const user = await User.findOne({ email: userMail });

    if (!user)
        return next(new AppError(404, `No user found with email ${userMail}. Try Signing Up.`));

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.USER_PASS
        }
    });

    const resetToken = uuid();
    const hashedToken = await bcrypt.hash(resetToken, 12);

    const message = `Hey ${user.name}, \n\nForgot your password?\nWe received a request to reset the password for your Birch Wood Ranch Account.\n\nTo reset your password, enter the following token at the forgot password page - ${resetToken}\n\nHave a nice day!\n\nRegards,\nBirch Wood Ranch by Abhigyan Hedau`;

    await User.updateOne({ email: userMail }, { token: hashedToken });

    const mailOptions = {
        from: process.env.USER_MAIL,
        to: userMail,
        // to: 'spam22010904@gmail.com',
        subject: 'Account Recovery Mail',
        text: message
    };

    transporter.sendMail(mailOptions, function (error) {
        if (error)
            return next(new AppError(500, 'Internal server error'));
    });

    res.status(200).json({
        status: 'success'
    });

});

const resetPassword = catchAsync(async (req, res, next) => {

    const token = req.body.token;
    const userMail = req.body.email;
    const newPassword = req.body.password;

    if (!token)
        return next(new AppError(400, 'Enter the token'));

    const user = await User.findOne({ email: userMail });

    if (!user)
        return next(new AppError(404, `No user found with email ${userMail}. Try Signing Up.`));

    if (!user.token)
        return next(new AppError(404, `Send a forgot password request before changing the password`));

    // Check if the token is correct or not
    const tokenIsCorrect = await bcrypt.compare(token, user.token);

    if (!tokenIsCorrect)
        return next(new AppError(400, 'Enter the valid token'));

    const newHashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = newHashedPassword;
    user.token = undefined;

    const updatedUser = await user.save();

    // Create JWT token and sign it
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });

    res.status(201).json({
        status: 'success',
        data: {
            user: updatedUser,
            token: jwtToken
        }
    });
});

const getUserQueries = catchAsync(async (req, res, next) => {

    const queries = await Query.find();

    res.status(200).json({
        status: 'success',
        data: {
            queries: queries
        }
    });

});

const postQuery = catchAsync(async (req, res, next) => {

    const { name, email, query } = req.body;

    if (validator.isEmpty(name) ||
        !validator.isEmail(email) ||
        validator.isEmpty(query)
    )
        return next(new AppError(400, 'Please add complete and correct details for sign up'));

    const newQuery = await Query.create({
        name, email, query
    });

    res.status(201).json({
        status: 'success',
        data: {
            query: newQuery
        }
    });

});

const deleteQuery = catchAsync(async (req, res, next) => {

    const queryId = req.params.queryId;

    await Query.findByIdAndDelete(queryId);

    res.status(204).json({
        status: 'success',
        data: null
    });

});

module.exports = { signup, login, getAllUsers, getUserFromUserId, postASeller, getMyDetails, updateMe, deleteMe, sendRecoveryMail, resetPassword, getUserQueries, postQuery, deleteQuery, sendToken, verifySignUpToken };