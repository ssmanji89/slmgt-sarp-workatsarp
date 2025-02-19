const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

// API-specific rate limits
const limits = {
    google: {
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
        max: 1000 // Google Places API daily limit
    },
    yelp: {
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
        max: 5000 // Yelp API daily limit
    },
    default: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // Default limit for other endpoints
    }
};

// Create rate limiters for each API
const createLimiter = (config) => rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rate-limit:',
        expiry: config.windowMs / 1000 // Redis expects seconds
    }),
    windowMs: config.windowMs,
    max: config.max,
    message: {
        error: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const limiters = {
    google: createLimiter(limits.google),
    yelp: createLimiter(limits.yelp),
    default: createLimiter(limits.default)
};

// Middleware to apply appropriate rate limit based on the source
const rateLimiter = (req, res, next) => {
    const source = req.body.source || 'default';
    const limiter = limiters[source] || limiters.default;
    return limiter(req, res, next);
};

module.exports = { rateLimiter };
