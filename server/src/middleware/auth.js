const { authService } = require('../services/auth.js');
const { TwitterApi } = require('twitter-api-v2');

/**
 * Middleware to verify JWT token
 */
const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = await authService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * Middleware to validate API keys for external services
 */
const validateApiKeys = async (req, res, next) => {
    try {
        const { source = 'google' } = req.body;
        const apiKey = source === 'google' 
            ? process.env.GOOGLE_API_KEY 
            : process.env.YELP_API_KEY;

        if (!apiKey) {
            return res.status(401).json({ 
                error: `No API key configured for ${source}` 
            });
        }

        const isValid = await authService.validateApiKey(apiKey, source);
        if (!isValid) {
            return res.status(401).json({ 
                error: `Invalid API key for ${source}` 
            });
        }

        next();
    } catch (error) {
        console.error('API key validation error:', error);
        return res.status(500).json({ 
            error: 'Error validating API key' 
        });
    }
};

/**
 * Middleware to check Google OAuth tokens
 */
const validateGoogleAuth = async (req, res, next) => {
    try {
        const refreshToken = process.env.GMAIL_OAUTH_REFRESH_TOKEN;
        if (!refreshToken) {
            return res.status(401).json({ 
                error: 'Google OAuth refresh token not configured' 
            });
        }

        try {
            // Attempt to refresh tokens to verify they're valid
            await authService.refreshGoogleTokens(refreshToken);
            next();
        } catch (error) {
            return res.status(401).json({ 
                error: 'Invalid Google OAuth credentials' 
            });
        }
    } catch (error) {
        console.error('Google auth validation error:', error);
        return res.status(500).json({ 
            error: 'Error validating Google authentication' 
        });
    }
};

/**
 * Middleware to check Twitter OAuth tokens
 */
const validateTwitterAuth = async (req, res, next) => {
    try {
        const accessToken = process.env.TWITTER_ACCESS_TOKEN;
        const accessSecret = process.env.TWITTER_ACCESS_SECRET;

        if (!accessToken || !accessSecret) {
            return res.status(401).json({ 
                error: 'Twitter OAuth tokens not configured' 
            });
        }

        // Create a client with the tokens to verify they're valid
        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken,
            accessSecret,
        });

        try {
            // Verify credentials by making a test API call
            await client.v2.me();
            next();
        } catch (error) {
            return res.status(401).json({ 
                error: 'Invalid Twitter OAuth credentials' 
            });
        }
    } catch (error) {
        console.error('Twitter auth validation error:', error);
        return res.status(500).json({ 
            error: 'Error validating Twitter authentication' 
        });
    }
};

module.exports = {
    authenticateJWT,
    validateApiKeys,
    validateGoogleAuth,
    validateTwitterAuth
};
