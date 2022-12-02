const util = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/user-model');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/*
1. Get the token
2. Validate the token
3. Check if the user still exists - there can be a case where user is deleted but token is valid, user changed password
4. Check if the user changed password after JWT was issued
*/
const protect = catchAsync(async (req, res, next) => {

    // 1) Get the token

    let token;

    // If there is authorization header and it has a value starting with Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        // currently the value of req.headers.authorization is 'Bearer tokentokentoken'
        // So we need to get the second word from the value which is our token
        token = req.headers.authorization.split(' ')[1];

    }

    // If token does not exist
    if (!token)
        return next(new AppError(401, 'Please Signup or Login'));


    // 2) Validate the token

    // Convert the callback function in a promising function, so we don't need to use the callback 
    // function and can instead use the async await syntax
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);


    // 3) Check if the user still exists
    // There can be a case where use is deleted but the token is valid OR maybe the user changed the password
    const currentUser = await User.findById(decodedToken.id);

    if (!currentUser)
        return next(new AppError(401, 'Please Signup or Login'));

    // 4) Check if user changed password after JWT was issued - yet to implement

    // If no problem is there is above authentication, then only next will be called 
    // and control will go to next middleware in line
    req.user = currentUser;
    next();

});

module.exports = protect;