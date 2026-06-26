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
    ).select('-password -refreshTokenHash');
    return sendSuccess(res, 200, 'Profile updated', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get leaderboard — top 10 by scan count (aggregated from Scan collection)
 *         + the requesting user's own real rank even if outside top 10
 * @route  GET /api/users/leaderboard
 * @access Private
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const requestingUserId = req.user._id;

    // ── 1. Aggregate top-10 from Scan collection ────────────────────────────
    const aggregated = await Scan.aggregate([
      // Group every scan document by its owner
      {
        $group: {
          _id: '$user',
          scansCount: { $sum: 1 },
          totalCo2Kg: { $sum: { $ifNull: ['$co2Kg', 0] } },
        },
      },
      // Only include users who actually have scans
      { $match: { scansCount: { $gte: 1 } } },
      // Sort: most scans first; CO₂ as tiebreaker
      { $sort: { scansCount: -1, totalCo2Kg: -1 } },
      { $limit: 10 },
      // Join name + avatar from User collection — no sensitive fields
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      // Drop entries whose user account no longer exists
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: 0,
          userId: { $toString: '$_id' },
          name: '$userInfo.name',
          avatar: '$userInfo.avatar',
          scansCount: 1,
          totalCo2Kg: { $round: ['$totalCo2Kg', 2] },
        },
      },
    ]);

    // Assign 1-indexed ranks based on sorted position
    const topPerformers = aggregated.map((entry, i) => ({
      ...entry,
      rank: i + 1,
    }));

    // ── 2. Compute the requesting user's own stats + rank ───────────────────
    const myStatsAgg = await Scan.aggregate([
      { $match: { user: requestingUserId } },
      {
        $group: {
          _id: null,
          scansCount: { $sum: 1 },
          totalCo2Kg: { $sum: { $ifNull: ['$co2Kg', 0] } },
        },
      },
    ]);

    const myScansCount = myStatsAgg.length > 0 ? myStatsAgg[0].scansCount : 0;
    const myTotalCo2Kg =
      myStatsAgg.length > 0
        ? parseFloat(myStatsAgg[0].totalCo2Kg.toFixed(2))
        : 0;

    // Rank = (number of users with strictly MORE scans than me) + 1
    // If I have zero scans, rank is null — I'm not meaningfully ranked yet
    let myRank = null;
    if (myScansCount >= 1) {
      const usersAhead = await Scan.aggregate([
        {
          $group: {
            _id: '$user',
            scansCount: { $sum: 1 },
          },
        },
        { $match: { scansCount: { $gt: myScansCount } } },
        { $count: 'higherUsers' },
      ]);
      myRank = (usersAhead.length > 0 ? usersAhead[0].higherUsers : 0) + 1;
    }

    return res.status(200).json({
      success: true,
      topPerformers,
      currentUser: {
        userId: String(requestingUserId),
        scansCount: myScansCount,
        totalCo2Kg: myTotalCo2Kg,
        rank: myRank,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update user preferences (name, pushNotifications)
 * @route  PUT /api/users/me
 * @access Private
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, preferences } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Name must be a valid non-empty string' });
      }
      user.name = name.trim();
    }

    if (preferences !== undefined) {
      if (preferences.pushNotifications !== undefined) {
        if (typeof preferences.pushNotifications !== 'boolean') {
          return res.status(400).json({ success: false, message: 'pushNotifications must be a boolean' });
        }
        user.preferences = {
          ...user.preferences,
          pushNotifications: preferences.pushNotifications
        };
      }
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokenHash;

    return res.status(200).json({
      success: true,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, updateProfile, getLeaderboard, updateMe };
