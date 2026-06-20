const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public auth routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/refresh-token', refresh); // Alias for compatibility

// Protected auth routes
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
