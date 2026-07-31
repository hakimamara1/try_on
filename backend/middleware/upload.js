const multer = require('multer');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: imageFileFilter
});

module.exports = upload;
