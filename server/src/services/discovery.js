const axios = require('axios');
const { google } = require('googleapis');
const yelp = require('yelp-fusion');

// Initialize Google Places client
const places = google.places({
    version: 'v1',
    auth: process.env.GOOGLE_API_KEY
});

// Initialize Yelp client
const yelpClient = yelp.client(process.env.YELP_API_KEY);

/**
 * Search for businesses using Google Places API
 * @param {string} location - City or area to search in
 * @param {string} category - Business category
 * @returns {Promise<Array>} Array of business objects
 */
const googlePlacesSearch = async (location, category) => {
    try {
        const response = await places.searchNearby({
            location: await geocodeLocation(location),
            radius: 5000, // 5km radius
            type: category,
            maxResults: 20
        });

        return response.data.results.map(business => ({
            name: business.name,
            email: business.formatted_address,
            phone: business.formatted_phone_number,
            address: {
                street: business.vicinity,
                city: location,
                // Note: We'll need to parse the full address to get state and zip
            },
            category: category,
            source: 'google',
            metadata: {
                rating: business.rating,
                reviewCount: business.user_ratings_total,
                placeId: business.place_id,
                lastUpdated: new Date()
            }
        }));
    } catch (error) {
        console.error('Google Places API error:', error);
        throw new Error('Failed to fetch businesses from Google Places');
    }
};

/**
 * Search for businesses using Yelp Fusion API
 * @param {string} location - City or area to search in
 * @param {string} category - Business category
 * @returns {Promise<Array>} Array of business objects
 */
const yelpBusinessSearch = async (location, category) => {
    try {
        const response = await yelpClient.search({
            location,
            categories: category,
            limit: 20
        });

        return response.jsonBody.businesses.map(business => ({
            name: business.name,
            phone: business.phone,
            address: {
                street: business.location.address1,
                city: business.location.city,
                state: business.location.state,
                zipCode: business.location.zip_code,
                country: business.location.country
            },
            category: category,
            source: 'yelp',
            metadata: {
                rating: business.rating,
                reviewCount: business.review_count,
                yelpId: business.id,
                lastUpdated: new Date()
            }
        }));
    } catch (error) {
        console.error('Yelp API error:', error);
        throw new Error('Failed to fetch businesses from Yelp');
    }
};

/**
 * Helper function to geocode a location string
 * @param {string} location - Location string (e.g., "San Francisco, CA")
 * @returns {Promise<{lat: number, lng: number}>} Latitude and longitude
 */
const geocodeLocation = async (location) => {
    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            {
                params: {
                    address: location,
                    key: process.env.GOOGLE_API_KEY
                }
            }
        );

        if (response.data.results.length === 0) {
            throw new Error('Location not found');
        }

        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, lng };
    } catch (error) {
        console.error('Geocoding error:', error);
        throw new Error('Failed to geocode location');
    }
};

module.exports = {
    googlePlacesSearch,
    yelpBusinessSearch
};
