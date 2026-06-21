const mongoose = require('mongoose');

/**
 * Middleware factory to validate MongoDB ObjectId from request parameters.
 * 
 * @param {string} paramName - Name of the parameter containing the ObjectId
 * @returns {Function} - Express middleware function
 */
function validateObjectId(paramName) {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}`
      });
    }
    next();
  };
}

module.exports = validateObjectId;
