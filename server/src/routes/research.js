const express = require('express');
const { Business } = require('../models/Business.js');
const { googlePlacesSearch, yelpBusinessSearch } = require('../services/discovery.js');
const { validateBusinessData } = require('../middleware/validation.js');
const { rateLimiter } = require('../middleware/rateLimiter.js');
const { authenticateJWT, validateApiKeys } = require('../middleware/auth.js');

const router = express.Router();

// Get businesses with filtering and pagination
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            category,
            city,
            source
        } = req.query;

        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (city) query['address.city'] = city;
        if (source) query.source = source;

        const businesses = await Business.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Business.countDocuments(query);

        res.json({
            businesses,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search for new businesses using external APIs
router.post('/discover', [authenticateJWT, rateLimiter, validateApiKeys], async (req, res) => {
    try {
        const { location, category, source = 'google' } = req.body;

        let results = [];
        if (source === 'google') {
            results = await googlePlacesSearch(location, category);
        } else if (source === 'yelp') {
            results = await yelpBusinessSearch(location, category);
        }

        // Filter out businesses that already exist in our database
        const existingBusinesses = await Business.find({
            name: { $in: results.map(b => b.name) },
            'address.city': location
        });
        
        const existingNames = new Set(existingBusinesses.map(b => b.name));
        const newBusinesses = results.filter(b => !existingNames.has(b.name));

        res.json({ businesses: newBusinesses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new business
router.post('/', [authenticateJWT, validateBusinessData], async (req, res) => {
    try {
        const business = new Business(req.body);
        await business.save();
        res.status(201).json(business);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update business information
router.patch('/:id', [authenticateJWT, validateBusinessData], async (req, res) => {
    try {
        const business = await Business.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        res.json(business);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get business by ID
router.get('/:id', authenticateJWT, async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);
        
        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        res.json(business);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = { researchRouter: router };
