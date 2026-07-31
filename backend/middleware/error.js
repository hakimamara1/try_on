const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log the error
    if (req.log) {
        req.log.error({ err }, err.message);
    } else {
        logger.error({ err }, err.message);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message, statusCode: 400 };
    }

    // Don't leak internal error details (DB/Cloudinary/Replicate messages,
    // stack traces) to clients once the app is running in production.
    const isProduction = process.env.NODE_ENV === 'production';
    const statusCode = error.statusCode || 500;
    const message = (!isProduction || statusCode < 500)
        ? (error.message || 'Server Error')
        : 'Server Error';

    res.status(statusCode).json({
        success: false,
        error: message
    });
};

module.exports = errorHandler;
