const express = require('express');
const { getUsers, updateUserPoints, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/users', getUsers);
router.get('/analytics', getAnalytics);
router.put('/users/:id/points', authorize('admin'), updateUserPoints);

module.exports = router;
