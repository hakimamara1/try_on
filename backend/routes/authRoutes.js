const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe, updateDetails, toggleWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Tighter limiter for credential-guessing-prone routes than the app-wide default
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: { success: false, error: 'Too many attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
