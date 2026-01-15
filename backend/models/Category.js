const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create slug from name
CategorySchema.pre('save', function () {
    this.slug = this.name.toLowerCase().replace(/ /g, '-');
});

module.exports = mongoose.model('Category', CategorySchema);
