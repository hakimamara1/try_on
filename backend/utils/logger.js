const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';

const pinoConfig = {
    level: process.env.LOG_LEVEL || 'info',
    // Redact sensitive fields from logs
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.token',
        ],
        censor: '[REDACTED]',
    },
};

if (isDev) {
    pinoConfig.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    };
}

const logger = pino(pinoConfig);

module.exports = logger;
