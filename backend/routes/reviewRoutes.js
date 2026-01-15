const express = require('express');
const { addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/:productId', protect, addReview);

module.exports = router;
