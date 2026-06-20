/**
 * Send success response
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({ success: true, message, data });
};

/**
 * Send error response
 */
const sendError = (res, statusCode = 500, message = 'Server Error', error = '') => {
  return res.status(statusCode).json({ success: false, message, error });
};

module.exports = { sendSuccess, sendError };
