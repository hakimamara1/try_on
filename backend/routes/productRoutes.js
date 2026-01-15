const express = require('express');
const multer = require('multer');
const {
    getProducts,
    getProduct,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.route('/')
    .get(getProducts)
    .post(protect, authorize('admin', 'staff'), upload.single('image'), createProduct);

router.route('/categories').get(getCategories);

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('admin', 'staff'), upload.single('image'), updateProduct)
    .delete(protect, authorize('admin', 'staff'), deleteProduct);

module.exports = router;
