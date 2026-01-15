const Hero = require('../models/Hero');

// @desc    Get all active heroes
// @route   GET /api/heroes
// @access  Public
exports.getHeroes = async (req, res, next) => {
    try {
        const heroes = await Hero.find({ isActive: true }).sort('order');

        res.status(200).json({
            success: true,
            count: heroes.length,
            data: heroes
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a hero slide
// @route   POST /api/heroes
// @access  Private/Admin
exports.createHero = async (req, res, next) => {
    try {
        const hero = await Hero.create(req.body);

        res.status(201).json({
            success: true,
            data: hero
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a hero slide
// @route   PUT /api/heroes/:id
// @access  Private/Admin
exports.updateHero = async (req, res, next) => {
    try {
        const hero = await Hero.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!hero) {
            return res.status(404).json({ success: false, error: 'Hero slide not found' });
        }

        res.status(200).json({
            success: true,
            data: hero
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a hero slide
// @route   DELETE /api/heroes/:id
// @access  Private/Admin
exports.deleteHero = async (req, res, next) => {
    try {
        const hero = await Hero.findByIdAndDelete(req.params.id);

        if (!hero) {
            return res.status(404).json({ success: false, error: 'Hero slide not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
