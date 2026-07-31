const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');

// @desc      Get reviews for a product
// @route     GET /api/reviews/:productId
// @access    Public
exports.getReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name avatar_url')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Add product review
// @route     POST /api/reviews/:productId
// @access    Private
exports.addReview = async (req, res, next) => {
    try {
        req.log.debug({ productId: req.params.productId, userId: req.user.id }, 'Adding review');
        req.body.user = req.user.id;
        req.body.product = req.params.productId;


        const product = await Product.findById(req.params.productId);

        if (!product) {
            req.log.warn({ productId: req.params.productId }, 'Product not found for review');
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const review = await Review.create(req.body);

        // Award Points (MVP Logic)
        const user = await User.findById(req.user.id);

        // Prevent points abuse? (Only award if not previously reviewed logic is handled by Reciew unique index constraint throwing error)
        // But if we want to award points, we can do it here.
        // Let's assume unique index prevents duplicate review creation, so points only awarded once successfully.
        if (user.firstReview) {
            user.points_balance += 40;
            user.firstReview = false;
            await user.save();

            await PointTransaction.create({
                user: user._id,
                amount: 40,
                description: `Reviewed product: ${product.name}`
            });
        }

        req.log.info({ reviewId: review._id }, 'Review successfully added');
        res.status(201).json({
            success: true,
            message: 'Review added',
            data: review
        });
    } catch (err) {
        // Handle duplicate review specifically
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this product'
            });
        }
        next(err);
    }
};

// @desc      Delete review
// @route     DELETE /api/reviews/:id
// @access    Private
exports.deleteReview = async (req, res, next) => {
    try {
        req.log.debug({ reviewId: req.params.id }, 'Attempting to delete review');
        const review = await Review.findById(req.params.id);

        if (!review) {
            req.log.warn({ reviewId: req.params.id }, 'Review not found');
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        // Make sure user is review owner
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            req.log.warn({ reviewId: req.params.id, userId: req.user.id }, 'Unauthorized review deletion attempt');
            return res.status(401).json({ success: false, error: 'Not authorized to delete this review' });
        }

        await review.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
