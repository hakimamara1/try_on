const mongoose = require('mongoose');

const SavedTryOnSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    generatedImage: {
        type: String,
        required: true
    },
    originalImage: {
        type: String
    },
    productImage: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SavedTryOn', SavedTryOnSchema);
