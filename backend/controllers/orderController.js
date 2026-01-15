const Order = require('../models/Order');
const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const crypto = require('crypto');

// @desc      Create new order
// @route     POST /api/orders
// @access    Private
exports.createOrder = async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, error: 'No order items' });
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            totalPrice,
            isPaid: true, // For MVP assume paid
            paidAt: Date.now(),
            trackingNumber: 'TRK-' + Math.floor(1000 + Math.random() * 9000),
            qrCode: crypto.randomBytes(16).toString('hex') // Unique QR content
        });

        const createdOrder = await order.save();

        res.status(201).json({
            success: true,
            data: createdOrder
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get logged in user orders
// @route     GET /api/orders/myorders
// @access    Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get order by ID
// @route     GET /api/orders/:id
// @access    Private
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check permissions
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Scan Order QR to confirm delivery & earn points
// @route     POST /api/orders/scan-qr
// @access    Private
exports.scanOrderQr = async (req, res, next) => {
    try {
        const { qrCode } = req.body;

        if (!qrCode) {
            return res.status(400).json({ success: false, error: 'QR Code is required' });
        }

        const order = await Order.findOne({ qrCode });

        if (!order) {
            return res.status(404).json({ success: false, error: 'Invalid QR Code' });
        }

        // Check if order belongs to user
        if (order.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'This order does not belong to you' });
        }

        if (order.isQrScanned) {
            return res.status(400).json({ success: false, error: 'QR Code already scanned' });
        }

        // Logic found, update order
        order.isQrScanned = true;
        order.status = 'Delivered'; // Assume scanning confirms delivery
        await order.save();

        // Award User +200 Points
        const user = await User.findById(req.user.id);
        user.points_balance += 200;
        await user.save();

        await PointTransaction.create({
            user: user._id,
            amount: 200,
            description: `Order successfully delivered (Order #${order._id.toString().slice(-6)})`
        });

        // Check for Referral Bonus (First Order)
        // If this is the user's first scanned order, award referrer
        const completedOrdersCount = await Order.countDocuments({ user: req.user.id, isQrScanned: true });

        if (completedOrdersCount === 1 && user.invitedBy) {
            const referrer = await User.findById(user.invitedBy);
            if (referrer) {
                referrer.points_balance += 150; // Referral Bonus
                await referrer.save();

                await PointTransaction.create({
                    user: referrer._id,
                    amount: 150,
                    description: `Referral Bonus: ${user.name} placed first order`
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'QR Scanned! You earned 200 points.',
            data: order
        });

    } catch (err) {
        next(err);
    }
};
// @desc      Get all orders
// @route     GET /api/orders
// @access    Private (Admin/Staff)
exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('user', 'id name').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Update order status
// @route     PUT /api/orders/:id
// @access    Private (Admin/Staff)
exports.updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const { status, trackingNumber } = req.body;

        if (status) order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            data: updatedOrder
        });
    } catch (err) {
        next(err);
    }
};
