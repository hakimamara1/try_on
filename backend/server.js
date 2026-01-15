const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();
// Connect to Redis
connectRedis();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
console.log('CORS Enabled');

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.send('ZED DREAM API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tryOnRoutes = require('./routes/tryOnRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/try-on', tryOnRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/heroes', require('./routes/heroRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));


// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
