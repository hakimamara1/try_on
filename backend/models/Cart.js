const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            },
            name: String,
            image: String,
            price: Number,
            size: String,
            color: String,
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', CartSchema);
