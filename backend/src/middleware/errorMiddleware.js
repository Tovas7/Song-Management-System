/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle URL decoding errors
  if (err instanceof URIError || err.message.includes('Failed to decode param')) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid URL parameter',
        code: 'INVALID_PARAM'
      }
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid JSON format',
        code: 'INVALID_JSON'
      }
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
