const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const crypto = require('crypto');

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, inviteCode } = req.body;

        // Generate Invite Code (Simple 6 char random)
        const generatedInviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        let points = 50; // Base Sign up bonus
        let invitedBy = null;

        // Check referrer
        if (inviteCode) {
            const referrer = await User.findOne({ inviteCode });
            if (referrer) {
                invitedBy = referrer._id;

                // Award Referrer
                referrer.points_balance += 100;
                await referrer.save();

                await PointTransaction.create({
                    user: referrer._id,
                    amount: 100,
                    description: `Friend invited: ${name} signed up`
                });
            }
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            inviteCode: generatedInviteCode,
            points_balance: points,
            invitedBy
        });

        // Transaction for new user
        await PointTransaction.create({
            user: user._id,
            amount: points,
            description: 'Sign up bonus'
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc      Toggle product in wishlist
// @route     PUT /api/auth/wishlist/:productId
// @access    Private
exports.toggleWishlist = async (req, res, next) => {
    try {
        const product = await require('../models/Product').findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const user = await User.findById(req.user.id);

        // Check if product is already in wishlist
        const index = user.wishlist.indexOf(req.params.productId);

        if (index > -1) {
            // Remove
            user.wishlist.splice(index, 1);
        } else {
            // Add
            user.wishlist.push(req.params.productId);
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: user.wishlist
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            points: user.points_balance,
            avatar: user.avatar_url,
            inviteCode: user.inviteCode,
            inviteCode: user.inviteCode,
            invitedBy: user.invitedBy,
            role: user.role
        }
    });
};
