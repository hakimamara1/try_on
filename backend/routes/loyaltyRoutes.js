const express = require('express');
const { getBalance, getRewards, redeemReward, completeProfileBonus } = require('../controllers/loyaltyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/balance', protect, getBalance);
router.get('/rewards', protect, getRewards);
router.post('/redeem', protect, redeemReward);
router.post('/profile-bonus', protect, completeProfileBonus);

module.exports = router;
