const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// req.files (from upload.fields()) is keyed by field name, each holding an
// array of files; clean up whatever made it to disk before the error.
function cleanupUploadedFiles(files) {
    if (!files) return;
    for (const fieldFiles of Object.values(files)) {
        for (const file of fieldFiles) {
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }
    }
}

// Fields the /api/products endpoint is allowed to filter on, and the
// comparison operators allowed per field. Anything else in req.query is
// ignored rather than forwarded into the Mongo filter, since req.query can
// contain attacker-controlled nested objects (e.g. ?category[$where]=...).
const ALLOWED_FILTER_FIELDS = ['category', 'price', 'rating', 'isNewArrival', 'tags', 'colors', 'sizes', 'discount'];
const ALLOWED_OPERATORS = ['gt', 'gte', 'lt', 'lte', 'in', 'ne', 'eq'];

function sanitizeFilterValue(value) {
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    if (Array.isArray(value)) {
        const cleaned = value.filter(v => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean');
        return cleaned.length > 0 ? cleaned : undefined;
    }
    return undefined;
}

function buildProductFilter(query) {
    const filter = {};

    for (const field of ALLOWED_FILTER_FIELDS) {
        const raw = query[field];
        if (raw === undefined) continue;

        if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
            const opFilter = {};
            for (const [op, val] of Object.entries(raw)) {
                if (!ALLOWED_OPERATORS.includes(op)) continue;
                const safeVal = sanitizeFilterValue(val);
                if (safeVal === undefined) continue;
                opFilter[`$${op}`] = safeVal;
            }
            if (Object.keys(opFilter).length > 0) filter[field] = opFilter;
        } else {
            const safeVal = sanitizeFilterValue(raw);
            if (safeVal !== undefined) filter[field] = safeVal;
        }
    }

    return filter;
}

function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @desc      Get all products
// @route     GET /api/products
// @access    Public
exports.getProducts = async (req, res, next) => {
    try {
        req.log.debug({ query: req.query }, 'Fetching products');

        // Build the filter object from an explicit field/operator whitelist
        const filter = buildProductFilter(req.query);

        // Server-side search by product name (regex-escaped to avoid ReDoS)
        if (req.query.search) {
            filter.name = { $regex: escapeRegex(req.query.search), $options: 'i' };
        }

        // Finding resource
        let query = Product.find(filter).populate('category', 'name slug');

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
        const total = await Product.countDocuments(filter);

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

        req.log.info({ count: products.length, total, page }, 'Products fetched');
        res.status(200).json({
            success: true,
            count: products.length,
            total,
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
        req.log.debug({ user: req.user, product: product }, 'Product found');
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
// @desc      Get related products based on category
// @route     GET /api/products/related/:id
// @access    Public
exports.getRelatedProducts = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Find products with same category, exclude current product
        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        res.status(200).json({
            success: true,
            data: related
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
        req.log.debug({ contentType: req.headers['content-type'], bodyKeys: Object.keys(req.body) }, 'Attempting to create product');

        // Handle Image Upload
        if (req.files) {
            // Handle single image (backward compatibility)
            if (req.files.image) {
                const file = req.files.image[0];
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'products'
                });

                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }

                req.body.image = result.secure_url;
            }

            // Handle multiple images
            if (req.files.images) {
                const imageUrls = [];
                for (const file of req.files.images) {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'products'
                    });

                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }

                    imageUrls.push(result.secure_url);
                }
                req.body.images = imageUrls;
            }
        }

        const product = await Product.create(req.body);

        req.log.info({ productId: product._id }, 'Product successfully created');
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (err) {
        // Clean up creating file if error happens
        cleanupUploadedFiles(req.files);
        next(err);
    }
};

// @desc      Update product
// @route     PUT /api/products/:id
// @access    Private/Admin/Staff
exports.updateProduct = async (req, res, next) => {
    try {
        req.log.debug({ productId: req.params.id }, 'Attempting to update product');
        let product = await Product.findById(req.params.id);

        if (!product) {
            req.log.warn({ productId: req.params.id }, 'Product to update not found');
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Handle Image Upload
        if (req.files) {
            // Handle single image
            if (req.files.image) {
                const file = req.files.image[0];
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'products'
                });

                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }

                req.body.image = result.secure_url;
            }

            // Handle multiple images
            if (req.files.images) {
                const imageUrls = [];
                for (const file of req.files.images) {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'products'
                    });

                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }

                    imageUrls.push(result.secure_url);
                }

                if (!req.body.images) req.body.images = product.images || [];
                // if images is coming as string or array in body? 
                // req.body.images might be existing images URLs sent by client?
                if (typeof req.body.images === 'string') req.body.images = [req.body.images];

                req.body.images = [...req.body.images, ...imageUrls];
            }
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        req.log.info({ productId: product._id }, 'Product successfully updated');
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (err) {
        cleanupUploadedFiles(req.files);
        next(err);
    }
};

// @desc      Delete product
// @route     DELETE /api/products/:id
// @access    Private/Admin/Staff
exports.deleteProduct = async (req, res, next) => {
    try {
        req.log.debug({ productId: req.params.id }, 'Attempting to delete product');
        const product = await Product.findById(req.params.id);

        if (!product) {
            req.log.warn({ productId: req.params.id }, 'Product to delete not found');
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        await product.deleteOne();

        req.log.info({ productId: product._id }, 'Product successfully deleted');
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
