const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    originalPrice: {
        type: Number
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
    },
    images: {
        type: [String],
        default: []
    },
    sizes: {
        type: [String],
        default: []
    },
    colors: {
        type: [String],
        default: []
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    isNewArrival: {
        type: Boolean,
        default: false
    },
    discount: {
        type: String // e.g., '20% OFF'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);
