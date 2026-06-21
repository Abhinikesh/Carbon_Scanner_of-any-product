const mongoSanitize = require('express-mongo-sanitize');

/**
 * Middleware to manually sanitize request bodies and route parameters 
 * from MongoDB operator injection attempts (e.g. keys containing $ or .).
 */
module.exports = (req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
  }
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params);
  }
  next();
};
