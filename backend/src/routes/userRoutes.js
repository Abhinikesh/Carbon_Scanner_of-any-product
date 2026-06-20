const express = require('express');
const router = express.Router();
const { getDashboard, updateProfile, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboard);
router.put('/profile', protect, updateProfile);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
