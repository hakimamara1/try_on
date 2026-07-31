const Hero = require('../models/Hero');

// @desc    Get all active heroes
// @route   GET /api/heroes
// @access  Public
exports.getHeroes = async (req, res, next) => {
    try {
        req.log.debug('Fetching active hero slides');
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
        req.log.debug({ bodyKeys: Object.keys(req.body) }, 'Creating hero slide');
        const hero = await Hero.create(req.body);

        req.log.info({ heroId: hero._id }, 'Hero slide created');
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
        req.log.debug({ heroId: req.params.id }, 'Updating hero slide');
        const hero = await Hero.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!hero) {
            req.log.warn({ heroId: req.params.id }, 'Hero slide not found');
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
        req.log.debug({ heroId: req.params.id }, 'Deleting hero slide');
        const hero = await Hero.findByIdAndDelete(req.params.id);

        if (!hero) {
            req.log.warn({ heroId: req.params.id }, 'Hero slide to delete not found');
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
