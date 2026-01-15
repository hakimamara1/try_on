const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc      Get all users
// @route     GET /api/admin/users
// @access    Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort('-createdAt');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Update user points
// @route     PUT /api/admin/users/:id/points
// @access    Private/Admin
exports.updateUserPoints = async (req, res, next) => {
    try {
        const { points } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { points_balance: points },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get analytics data
// @route     GET /api/admin/analytics
// @access    Private/Admin
exports.getAnalytics = async (req, res, next) => {
    try {
        // Total Users
        const totalUsers = await User.countDocuments({ role: 'user' });

        // Total Products
        const totalProducts = await Product.countDocuments();

        // Total Orders & Revenue
        const orders = await Order.find();
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        // Orders by Status
        const ordersByStatus = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                ordersByStatus
            }
        });
    } catch (err) {
        next(err);
    }
};
