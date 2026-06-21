const rateLimit = require('express-rate-limit');

/**
 * Baseline API Limiter (globally applied under /api)
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Try again in a few minutes." }
});

/**
 * Authentication Rate Limiter (for login and registration attempts)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again in 15 minutes." }
});

/**
 * Scan creation Rate Limiter (protects OCR/CPU resource limit hourly)
 */
const scanCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Scan limit reached for this hour. Try again later." }
});

/**
 * External OSM Lookup Limiter (protects OpenStreetMap Nominatim/Overpass free services)
 */
const externalLookupLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many location lookups. Wait a moment and try again." }
});

module.exports = {
  apiLimiter,
  authLimiter,
  scanCreateLimiter,
  externalLookupLimiter
};
