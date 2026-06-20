const { verifyAccessToken } = require('../utils/tokenHelper');
const User = require('../models/User');
const { sendError } = require('../utils/responseHelper');

/**
 * Protect routes — verify JWT and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Not authorized, no token');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) return sendError(res, 401, 'User not found');

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired, please login again');
    }
    return sendError(res, 401, 'Not authorized, invalid token');
  }
};

module.exports = { protect };
