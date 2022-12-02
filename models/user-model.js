const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please specify the name.']
    },
    email: {
        type: String,
        required: [true, 'Please enter a valid email.'],
        unique: true,
        lowercase: true, // not a validator, will convert the stored value to lowercase
        validate: [validator.isEmail, 'Please enter a valid email.']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password of atleast 6 characters.'],
        minLength: 6,
        select: false  // password won't be sent to the client
    },
    address: {
        type: String,
        required: [true, 'Please provide an address to deliver.']
    },
    number: {
        type: Number,
        required: [true, 'Please provide a contact number.']
    },
    role: {
        type: String,
        default: 'customer',
        enum: ['customer', 'seller', 'admin']
    },
    token: {
        type: String
    }
});

const User = new mongoose.model('User', userSchema);

module.exports = User;