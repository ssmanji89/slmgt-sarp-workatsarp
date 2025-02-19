const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    socialMedia: {
        twitter: String,
        linkedin: String,
        facebook: String
    },
    category: {
        type: String,
        required: true
    },
    source: {
        type: String,
        enum: ['google', 'yelp', 'manual'],
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'responded', 'converted', 'rejected'],
        default: 'new'
    },
    contactHistory: [{
        channel: {
            type: String,
            enum: ['email', 'twitter'],
            required: true
        },
        messageId: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'failed'],
            required: true
        },
        response: String
    }],
    metadata: {
        rating: Number,
        reviewCount: Number,
        lastUpdated: Date,
        notes: String
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
businessSchema.index({ name: 1 });
businessSchema.index({ 'address.city': 1 });
businessSchema.index({ category: 1 });
businessSchema.index({ status: 1 });
businessSchema.index({ 'contactHistory.timestamp': 1 });

const Business = mongoose.model('Business', businessSchema);

module.exports = { Business };
