const AppError = require('../utils/appError');

const restrictTo = (...params) => {

    // params = [ 'admin' ] if restrictTo('admin');
    // params = [ 'admin', 'user', 'seller' ] if restrictTo('admin', 'user', 'seller');

    // Following is middle ware function
    return (req, res, next) => {

        // roles is an array of parameters
        // We've used req.user in above protect function
        if (!params.includes(req.user.role))
            return next(new AppError(403, 'Forbidden. You do not have access.'));

        next();

    };
};

module.exports = restrictTo;