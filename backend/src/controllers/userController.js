const User = require('../models/User');
const Scan = require('../models/Scan');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @desc   Get user dashboard stats
 * @route  GET /api/user/dashboard
 * @access Private
 */
const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Last 30 days scans
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentScans = await Scan.find({
      userId: req.user._id,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: 1 });

    // CO2 by category
    const categoryBreakdown = await Scan.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$recognizedItem.category', totalCO2: { $sum: '$co2Estimate.value' }, count: { $sum: 1 } } },
    ]);

    // Monthly CO2 trend (last 30 days grouped by day)
    const dailyTrend = recentScans.reduce((acc, scan) => {
      const day = scan.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + scan.co2Estimate.value;
      return acc;
    }, {});

    const trendData = Object.entries(dailyTrend).map(([date, co2]) => ({ date, co2: parseFloat(co2.toFixed(2)) }));

    // Global average comparison (hardcoded average: ~4000 kg CO2/year per person)
    const globalAvgMonthly = (4000 / 12).toFixed(2);
    const userMonthlyScans = recentScans.reduce((acc, s) => acc + s.co2Estimate.value, 0);

    return sendSuccess(res, 200, 'Dashboard data fetched', {
      stats: {
        totalScans: user.totalScans,
        totalCO2: user.totalCO2,
        thisMonthCO2: parseFloat(userMonthlyScans.toFixed(2)),
        globalAvgMonthly: parseFloat(globalAvgMonthly),
      },
      trendData,
      categoryBreakdown,
      badges: user.badges,
      recentScans: recentScans.slice(-5).reverse(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update user profile
 * @route  PUT /api/user/profile
 * @access Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, 200, 'Profile updated', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get leaderboard (top 10 users)
 * @route  GET /api/user/leaderboard
 * @access Public
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const leaders = await User.find()
      .sort({ totalScans: -1 })
      .limit(10)
      .select('name avatar totalScans totalCO2 badges');
    return sendSuccess(res, 200, 'Leaderboard fetched', { leaders });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, updateProfile, getLeaderboard };
