const User = require('../models/User');
const Reward = require('../models/Reward');
const PointTransaction = require('../models/PointTransaction');

// @desc      Get User Point Balance & History
// @route     GET /api/loyalty/balance
// @access    Private
exports.getBalance = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const history = await PointTransaction.find({ user: req.user.id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            balance: user.points_balance,
            history
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get Available Rewards
// @route     GET /api/loyalty/rewards
// @access    Private
exports.getRewards = async (req, res, next) => {
    try {
        const rewards = await Reward.find({ isActive: true });

        // Seed if empty (for MVP demo)
        if (rewards.length === 0) {
            const demoRewards = [
                { title: '10% OFF', subtitle: 'On your next order', costPoints: 100 },
                { title: 'Free Shipping', subtitle: 'No minimum spent', costPoints: 150 },
                { title: '$20 Voucher', subtitle: 'For accessories', costPoints: 300 }
            ];
            await Reward.create(demoRewards);
            return res.status(200).json({ success: true, count: 3, data: demoRewards });
        }

        res.status(200).json({
            success: true,
            count: rewards.length,
            data: rewards
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Redeem Reward
// @route     POST /api/loyalty/redeem
// @access    Private
exports.redeemReward = async (req, res, next) => {
    try {
        const { rewardId } = req.body;
        const user = await User.findById(req.user.id);
        const reward = await Reward.findById(rewardId);

        if (!reward) {
            return res.status(404).json({ success: false, error: 'Reward not found' });
        }

        if (user.points_balance < reward.costPoints) {
            return res.status(400).json({ success: false, error: 'Insufficient points' });
        }

        // Deduct points
        user.points_balance -= reward.costPoints;
        await user.save();

        // Create transaction
        await PointTransaction.create({
            user: user.id,
            amount: -reward.costPoints,
            description: `Redeemed ${reward.title}`
        });

        res.status(200).json({
            success: true,
            message: `Successfully redeemed ${reward.title}`,
            newBalance: user.points_balance
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Award Profile Completion Bonus
// @route     POST /api/loyalty/profile-bonus
// @access    Private
exports.completeProfileBonus = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.checklist && user.checklist.profileCompleted) {
            return res.status(400).json({ success: false, error: 'Bonus already claimed' });
        }

        // Initialize checklist if missing
        if (!user.checklist) {
            user.checklist = { profileCompleted: false, firstTryOn: false };
        }

        user.points_balance += 30;
        user.checklist.profileCompleted = true;
        await user.save();

        await PointTransaction.create({
            user: user._id,
            amount: 30,
            description: 'Profile Completed Bonus'
        });

        res.status(200).json({
            success: true,
            message: 'Profile completed! You earned 30 points.',
            newBalance: user.points_balance
        });
    } catch (err) {
        next(err);
    }
};
