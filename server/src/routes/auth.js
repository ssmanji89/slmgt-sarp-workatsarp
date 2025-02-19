const express = require('express');
const { authService } = require('../services/auth.js');
const { validateApiKeys } = require('../middleware/auth.js');

const router = express.Router();

/**
 * Get Google OAuth URL
 */
router.get('/google/url', async (req, res) => {
    try {
        const scopes = [
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/places'
        ];
        
        const url = authService.getGoogleAuthUrl(scopes);
        res.json({ url });
    } catch (error) {
        console.error('Google OAuth URL error:', error);
        res.status(500).json({ error: 'Failed to generate Google OAuth URL' });
    }
});

/**
 * Handle Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ error: 'No authorization code provided' });
        }

        const tokens = await authService.exchangeGoogleCode(code);
        
        // Generate JWT for API authentication
        const jwt = authService.generateToken({
            service: 'google',
            accessToken: tokens.access_token
        });

        res.json({
            message: 'Google authentication successful',
            jwt,
            tokens
        });
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.status(500).json({ error: 'Failed to complete Google authentication' });
    }
});

/**
 * Get Twitter OAuth URL
 */
router.get('/twitter/url', async (req, res) => {
    try {
        const authData = await authService.getTwitterAuthUrl();
        
        // Store oauth_token_secret temporarily (should use Redis in production)
        req.session.oauthTokenSecret = authData.oauth_token_secret;
        
        res.json({
            url: authData.url,
            oauth_token: authData.oauth_token
        });
    } catch (error) {
        console.error('Twitter OAuth URL error:', error);
        res.status(500).json({ error: 'Failed to generate Twitter OAuth URL' });
    }
});

/**
 * Handle Twitter OAuth callback
 */
router.get('/twitter/callback', async (req, res) => {
    try {
        const { oauth_token, oauth_verifier } = req.query;
        const { oauthTokenSecret } = req.session;

        if (!oauth_token || !oauth_verifier || !oauthTokenSecret) {
            return res.status(400).json({ error: 'Invalid OAuth parameters' });
        }

        const tokens = await authService.exchangeTwitterTokens(
            oauth_token,
            oauth_verifier,
            oauthTokenSecret
        );

        // Clear temporary session data
        delete req.session.oauthTokenSecret;

        // Generate JWT for API authentication
        const jwt = authService.generateToken({
            service: 'twitter',
            accessToken: tokens.accessToken
        });

        res.json({
            message: 'Twitter authentication successful',
            jwt,
            tokens
        });
    } catch (error) {
        console.error('Twitter OAuth callback error:', error);
        res.status(500).json({ error: 'Failed to complete Twitter authentication' });
    }
});

/**
 * Validate API keys
 */
router.post('/validate-keys', validateApiKeys, (req, res) => {
    res.json({ message: 'API keys are valid' });
});

/**
 * Refresh Google tokens
 */
router.post('/google/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'No refresh token provided' });
        }

        const tokens = await authService.refreshGoogleTokens(refreshToken);
        
        // Generate new JWT
        const jwt = authService.generateToken({
            service: 'google',
            accessToken: tokens.access_token
        });

        res.json({
            message: 'Tokens refreshed successfully',
            jwt,
            tokens
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh tokens' });
    }
});

module.exports = { authRouter: router };
