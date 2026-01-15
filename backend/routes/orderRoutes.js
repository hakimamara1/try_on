const express = require('express');
const { createOrder, getMyOrders, getOrderById, scanOrderQr, getOrders, updateOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, createOrder)
    .get(protect, authorize('admin', 'staff'), getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/scan-qr').post(protect, scanOrderQr);

router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, authorize('admin', 'staff', 'delivery'), updateOrder);

module.exports = router;
