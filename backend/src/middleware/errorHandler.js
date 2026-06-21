/**
 * Centralized Error Handler Middleware.
 * Always logs the full error stack to the server console,
 * maps specific Mongoose/JWT/Multer errors to 400/401 statuses,
 * and hides the stack trace from the client in production.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Multer limit file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size limit exceeded (Max 10MB)';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Always log the full error with stack trace to console for diagnostics
  console.error('[ERROR]', err);

  const responseBody = {
    success: false,
    message
  };

  // Only expose the stack trace to client in development environment
  if (process.env.NODE_ENV === 'development') {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

module.exports = errorHandler;
