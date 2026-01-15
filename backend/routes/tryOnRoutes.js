const express = require('express');
const multer = require('multer');
const { generateTryOn, saveLook, getSavedLooks, deleteSavedLook } = require('../controllers/tryOnController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer config
const upload = multer({ dest: 'uploads/' });

router.post('/generate', protect, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'productImage', maxCount: 1 }
]), generateTryOn);
router.post('/save', protect, saveLook);
router.get('/saved', protect, getSavedLooks);
router.delete('/:id', protect, deleteSavedLook);

module.exports = router;
