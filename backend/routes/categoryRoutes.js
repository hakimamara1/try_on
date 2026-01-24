const express = require('express');
const multer = require('multer');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.route('/')
    .get(getCategories)
    .post(protect, authorize('admin', 'staff'), upload.single('image'), createCategory);

router.route('/:id')
    .get(getCategory)
    .put(protect, authorize('admin', 'staff'), upload.single('image'), updateCategory)
    .delete(protect, authorize('admin', 'staff'), deleteCategory);

module.exports = router;
