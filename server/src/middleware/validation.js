const Joi = require('joi');

// Schema for business data validation
const businessSchema = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().trim().lowercase().allow(null, ''),
    phone: Joi.string().trim().allow(null, ''),
    address: Joi.object({
        street: Joi.string().allow(null, ''),
        city: Joi.string().required(),
        state: Joi.string().allow(null, ''),
        zipCode: Joi.string().allow(null, ''),
        country: Joi.string().allow(null, '')
    }).required(),
    socialMedia: Joi.object({
        twitter: Joi.string().allow(null, ''),
        linkedin: Joi.string().allow(null, ''),
        facebook: Joi.string().allow(null, '')
    }),
    category: Joi.string().required(),
    source: Joi.string().valid('google', 'yelp', 'manual').required(),
    status: Joi.string()
        .valid('new', 'contacted', 'responded', 'converted', 'rejected')
        .default('new'),
    contactHistory: Joi.array().items(
        Joi.object({
            channel: Joi.string().valid('email', 'twitter').required(),
            messageId: Joi.string().allow(null, ''),
            timestamp: Joi.date().default(Date.now),
            status: Joi.string().valid('sent', 'delivered', 'failed').required(),
            response: Joi.string().allow(null, '')
        })
    ),
    metadata: Joi.object({
        rating: Joi.number().min(0).max(5).allow(null),
        reviewCount: Joi.number().min(0).allow(null),
        lastUpdated: Joi.date().allow(null),
        notes: Joi.string().allow(null, '')
    })
});

/**
 * Middleware to validate business data
 */
const validateBusinessData = async (req, res, next) => {
    try {
        // For PATCH requests, only validate the fields that are present
        const schema = req.method === 'PATCH' 
            ? businessSchema.fork(
                Object.keys(businessSchema.describe().keys),
                (schema) => schema.optional()
              )
            : businessSchema;

        const validatedData = await schema.validateAsync(req.body, {
            abortEarly: false,
            stripUnknown: true, // Remove unknown fields
            presence: req.method === 'PATCH' ? 'optional' : 'required'
        });

        // Replace request body with validated data
        req.body = validatedData;
        next();
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        next(error);
    }
};

/**
 * Helper function to validate location and category for discovery
 */
const validateDiscoveryParams = async (req, res, next) => {
    const schema = Joi.object({
        location: Joi.string().required(),
        category: Joi.string().required(),
        source: Joi.string().valid('google', 'yelp').default('google')
    });

    try {
        const validatedData = await schema.validateAsync(req.body, {
            abortEarly: false
        });
        req.body = validatedData;
        next();
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        next(error);
    }
};

module.exports = {
    validateBusinessData,
    validateDiscoveryParams
};
