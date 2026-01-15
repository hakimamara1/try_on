const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    costPoints: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Reward', RewardSchema);
