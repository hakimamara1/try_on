const express = require('express');
const {
    getProducts,
    getProduct,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    getRelatedProducts
} = require('../controllers/productController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
    .get(getProducts)
    .post(protect, authorize('admin', 'staff'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), createProduct);

router.route('/categories').get(getCategories);
router.route('/related/:id').get(getRelatedProducts);

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('admin', 'staff'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), updateProduct)
    .delete(protect, authorize('admin', 'staff'), deleteProduct);

module.exports = router;
