const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = () => {
    if (!process.env.REDIS_URL) {
        logger.warn('Redis URL not found, skipping Redis connection');
        return;
    }

    redisClient = new Redis(process.env.REDIS_URL);

    redisClient.on('connect', () => {
        logger.info('Redis Connected');
    });

    redisClient.on('error', (err) => {
        logger.error(`Redis Error: ${err.message}`);
    });
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
