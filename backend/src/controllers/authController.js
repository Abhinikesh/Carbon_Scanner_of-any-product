const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenHelper');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @desc   Register new user
 * @route  POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return sendError(res, 400, 'Name, email and password are required');

    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 400, 'Email already registered');

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 201, 'Account created successfully', {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Login user
 * @route  POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return sendError(res, 400, 'Email and password are required');

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) return sendError(res, 401, 'Invalid email or password');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 401, 'Invalid email or password');

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 200, 'Login successful', {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Refresh access token
 * @route  POST /api/auth/refresh-token
 * @access Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return sendError(res, 401, 'Refresh token required');

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token)
      return sendError(res, 401, 'Invalid refresh token');

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 200, 'Token refreshed', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Logout user
 * @route  POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get current user
 * @route  GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, 200, 'User fetched', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, getMe };
