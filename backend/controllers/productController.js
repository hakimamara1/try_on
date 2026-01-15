const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc      Get all products
// @route     GET /api/products
// @access    Public
exports.getProducts = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Product.find(JSON.parse(queryStr)).populate('category', 'name slug');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Product.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const products = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: products.length,
            pagination,
            data: products
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get single product
// @route     GET /api/products/:id
// @access    Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug');

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get all categories
// @route     GET /api/products/categories
// @access    Public
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (err) {
        next(err);
    }
};
// @desc      Create new product
// @route     POST /api/products
// @access    Private/Admin/Staff
exports.createProduct = async (req, res, next) => {
    try {
        console.log('Create Product Request:');
        console.log('Content-Type:', req.headers['content-type']);
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);

        // Handle Image Upload
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'products'
            });

            // Remove file from local
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            req.body.image = result.secure_url;
        }

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (err) {
        // Clean up creating file if error happens
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
};

// @desc      Update product
// @route     PUT /api/products/:id
// @access    Private/Admin/Staff
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Handle Image Upload
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'products'
            });

            // Remove file from local
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            req.body.image = result.secure_url;
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
};

// @desc      Delete product
// @route     DELETE /api/products/:id
// @access    Private/Admin/Staff
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
