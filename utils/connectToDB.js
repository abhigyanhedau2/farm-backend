const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const connectToDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI, () => {
            console.log('Connected to Database');
        });
    } catch (error) {
        return new AppError(500, `Connection to Database failed: ${error.message}`);
    }
};

module.exports = connectToDB;