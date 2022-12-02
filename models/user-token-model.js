const mongoose = require('mongoose');
const validator = require('validator');

const userTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter a valid email.'],
        unique: true,
        lowercase: true, // not a validator, will convert the stored value to lowercase
        validate: [validator.isEmail, 'Please enter a valid email.']
    },
    token: {
        type: String
    }
});

const UserToken = new mongoose.model('UserToken', userTokenSchema);

module.exports = UserToken;