const express = require('express');
const { addReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:productId', getReviews);
router.post('/:productId', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
