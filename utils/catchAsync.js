// Goal of this function is to catch the asynchronous errors
module.exports = (fn) => {

    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    }

};