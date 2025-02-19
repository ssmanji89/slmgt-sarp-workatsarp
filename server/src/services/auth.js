const { google } = require('googleapis');
const { TwitterApi } = require('twitter-api-v2');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const axios = require('axios');

// Initialize OAuth2 client for Google APIs
const googleOAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_OAUTH_CLIENT_ID,
    process.env.GMAIL_OAUTH_CLIENT_SECRET,
    process.env.OAUTH_REDIRECT_URL
);

// Initialize Twitter client
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

class AuthService {
    constructor() {
        this.verifyJwtAsync = promisify(jwt.verify);
        this.googleOAuth2Client = googleOAuth2Client;
        this.twitterClient = twitterClient;
    }

    /**
     * Generate JWT token for API authentication
     * @param {Object} payload - Data to encode in token
     * @returns {string} JWT token
     */
    generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token to verify
     * @returns {Promise<Object>} Decoded token payload
     */
    async verifyToken(token) {
        try {
            return await this.verifyJwtAsync(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    /**
     * Get Google OAuth2 URL for authentication
     * @param {string[]} scopes - OAuth scopes to request
     * @returns {string} Authorization URL
     */
    getGoogleAuthUrl(scopes) {
        return this.googleOAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    /**
     * Exchange Google OAuth2 code for tokens
     * @param {string} code - Authorization code
     * @returns {Promise<Object>} OAuth tokens
     */
    async exchangeGoogleCode(code) {
        try {
            const { tokens } = await this.googleOAuth2Client.getToken(code);
            this.googleOAuth2Client.setCredentials(tokens);
            return tokens;
        } catch (error) {
            console.error('Google OAuth error:', error);
            throw new Error('Failed to exchange Google authorization code');
        }
    }

    /**
     * Get Twitter OAuth URL for authentication
     * @returns {Promise<Object>} Twitter OAuth URL and tokens
     */
    async getTwitterAuthUrl() {
        try {
            const { url, oauth_token, oauth_token_secret } = 
                await this.twitterClient.generateAuthLink(process.env.TWITTER_CALLBACK_URL);
            return { url, oauth_token, oauth_token_secret };
        } catch (error) {
            console.error('Twitter OAuth error:', error);
            throw new Error('Failed to generate Twitter authorization URL');
        }
    }

    /**
     * Exchange Twitter OAuth tokens
     * @param {string} oauth_token - OAuth token
     * @param {string} oauth_verifier - OAuth verifier
     * @param {string} oauth_token_secret - OAuth token secret
     * @returns {Promise<Object>} Twitter access tokens
     */
    async exchangeTwitterTokens(oauth_token, oauth_verifier, oauth_token_secret) {
        try {
            const client = new TwitterApi({
                appKey: process.env.TWITTER_API_KEY,
                appSecret: process.env.TWITTER_API_SECRET,
                accessToken: oauth_token,
                accessSecret: oauth_token_secret,
            });

            const { accessToken, accessSecret } = 
                await client.login(oauth_verifier);
            
            return { accessToken, accessSecret };
        } catch (error) {
            console.error('Twitter token exchange error:', error);
            throw new Error('Failed to exchange Twitter tokens');
        }
    }

    /**
     * Refresh Google OAuth2 tokens
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<Object>} New OAuth tokens
     */
    async refreshGoogleTokens(refreshToken) {
        try {
            this.googleOAuth2Client.setCredentials({
                refresh_token: refreshToken
            });
            const { credentials } = await this.googleOAuth2Client.refreshAccessToken();
            return credentials;
        } catch (error) {
            console.error('Google token refresh error:', error);
            throw new Error('Failed to refresh Google tokens');
        }
    }

    /**
     * Validate API key for external services
     * @param {string} apiKey - API key to validate
     * @param {string} service - Service name (google, yelp)
     * @returns {boolean} Whether the API key is valid
     */
    async validateApiKey(apiKey, service) {
        try {
            switch (service) {
                case 'google':
                    // Test Google Places API
                    const placesResponse = await axios.get(
                        'https://maps.googleapis.com/maps/api/place/details/json',
                        {
                            params: {
                                place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // Test place ID
                                key: apiKey,
                                fields: 'name' // Minimal fields for validation
                            }
                        }
                    );
                    return !placesResponse.data.error;

                case 'yelp':
                    // Test Yelp API
                    const yelpResponse = await axios.get(
                        'https://api.yelp.com/v3/businesses/search',
                        {
                            headers: { Authorization: `Bearer ${apiKey}` },
                            params: { location: 'San Francisco', limit: 1 }
                        }
                    );
                    return !yelpResponse.data.error;

                default:
                    throw new Error(`Unknown service: ${service}`);
            }
        } catch (error) {
            console.error(`API key validation error for ${service}:`, error);
            return false;
        }
    }
}

const authService = new AuthService();
module.exports = { authService };
