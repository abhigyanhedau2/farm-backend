const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please specify your name.']
    },
    email: {
        type: String,
        required: [true, 'Please specify your email.']
    },
    query: {
        type: String,
        required: [true, 'Please specify your query.']
    }
});

const Query = new mongoose.model('Query', querySchema);

module.exports = Query;