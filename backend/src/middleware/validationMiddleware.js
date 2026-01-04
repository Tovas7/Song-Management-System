const Joi = require('joi');

/**
 * Middleware factory for request validation
 * @param {Joi.Schema} schema - Joi validation schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
          }))
        }
      });
    }
    
    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

module.exports = validateRequest;
