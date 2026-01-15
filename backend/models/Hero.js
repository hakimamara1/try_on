const mongoose = require('mongoose');

const HeroSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    subtitle: {
        type: String,
        required: [true, 'Please add a subtitle'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    ctaText: {
        type: String,
        default: 'Shop Collection'
    },
    linkType: {
        type: String,
        enum: ['product', 'category', 'external', 'none'],
        default: 'none'
    },
    linkValue: {
        type: String, // ID or URL
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Hero', HeroSchema);
