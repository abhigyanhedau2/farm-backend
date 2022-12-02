const AppError = require('../utils/appError');

const globalErrorHandler = (err, req, res, next) => {

    // Setting status code and error status if not set before
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';

    // Handler for duplicate names
    if (err.code === 11000)
        return res.status(400).json({
            status: 'error',
            message: `An item with name, ${err.keyValue.name}, already exists`
        });

    if (err.name === 'TokenExpiredError')
        return res.status(419).json({
            status: 'error',
            message: `Session Expired. Please Login Again.`
        });

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(item => item.message);
        return res.status(400).json({
            status: 'error',
            message: `Invalid input data. ${errors.join('. ')}`
        });
    }

    if (err.name === 'JsonWebTokenError')
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token. Please Login Again.'
        });


    // If the error is operational, it means that if we introduced it
    if (err.isOperational) {
        // console.log(err);
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err
        });
    }

    // Else, it means that it is a programmatical error
    else {
        // console.log(err);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong. Internal Server Error.',
            error: err
        });
    }
}

module.exports = globalErrorHandler;