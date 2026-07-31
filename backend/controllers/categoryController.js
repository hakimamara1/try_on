const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc      Get all categories
// @route     GET /api/categories
// @access    Public
exports.getCategories = async (req, res, next) => {
    try {
        req.log.debug('Fetching all categories');
        const categories = await Category.find();

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get single category
// @route     GET /api/categories/:id
// @access    Public
exports.getCategory = async (req, res, next) => {
    try {
        req.log.debug({ categoryId: req.params.id }, 'Fetching category');
        const category = await Category.findById(req.params.id);

        if (!category) {
            req.log.warn({ categoryId: req.params.id }, 'Category not found');
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Create new category
// @route     POST /api/categories
// @access    Private/Admin/Staff
exports.createCategory = async (req, res, next) => {
    try {
        req.log.debug({ bodyKeys: Object.keys(req.body) }, 'Creating new category');
        // Handle Image Upload
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'categories'
            });

            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            req.body.image = result.secure_url;
        }

        const category = await Category.create(req.body);

        req.log.info({ categoryId: category._id }, 'Category successfully created');
        res.status(201).json({
            success: true,
            data: category
        });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
};

// @desc      Update category
// @route     PUT /api/categories/:id
// @access    Private/Admin/Staff
exports.updateCategory = async (req, res, next) => {
    try {
        req.log.debug({ categoryId: req.params.id }, 'Attempting to update category');
        let category = await Category.findById(req.params.id);

        if (!category) {
            req.log.warn({ categoryId: req.params.id }, 'Category to update not found');
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        // Handle Image Upload
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'categories'
            });

            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            req.body.image = result.secure_url;
        }

        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        req.log.info({ categoryId: category._id }, 'Category successfully updated');
        res.status(200).json({
            success: true,
            data: category
        });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
};

// @desc      Delete category
// @route     DELETE /api/categories/:id
// @access    Private/Admin/Staff
exports.deleteCategory = async (req, res, next) => {
    try {
        req.log.debug({ categoryId: req.params.id }, 'Attempting to delete category');
        const category = await Category.findById(req.params.id);

        if (!category) {
            req.log.warn({ categoryId: req.params.id }, 'Category to delete not found');
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        await category.deleteOne();

        req.log.info({ categoryId: category._id }, 'Category successfully deleted');
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
