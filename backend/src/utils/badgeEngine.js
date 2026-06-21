const { getTotalScans, getAverageScore } = require('./scanStatsHelper');

const BADGE_CATALOG = [
  {
    key: 'first_scan',
    label: 'First Scan',
    emoji: '🌱',
    description: 'Complete your first scan',
    check: ctx => ctx.totalScans >= 1
  },
  {
    key: 'five_scans',
    label: 'Getting Started',
    emoji: '📊',
    description: 'Complete 5 scans',
    check: ctx => ctx.totalScans >= 5
  },
  {
    key: 'twenty_scans',
    label: 'Dedicated Tracker',
    emoji: '🏆',
    description: 'Complete 20 scans',
    check: ctx => ctx.totalScans >= 20
  },
  {
    key: 'week_streak',
    label: 'Week Streak',
    emoji: '🔥',
    description: 'Scan something 7 days in a row',
    check: ctx => ctx.currentStreakDays >= 7
  },
  {
    key: 'month_streak',
    label: 'Month Streak',
    emoji: '⚡',
    description: 'Scan something 30 days in a row',
    check: ctx => ctx.currentStreakDays >= 30
  },
  {
    key: 'green_scorer',
    label: 'Green Scorer',
    emoji: '🍃',
    description: 'Maintain an average score of 80+ across 5+ scans',
    check: ctx => ctx.avgScore !== null && ctx.avgScore >= 80 && ctx.totalScans >= 5
  },
  {
    key: 'recycler',
    label: 'Responsible Recycler',
    emoji: '♻️',
    description: 'Use Recycle Finder 3 times',
    check: ctx => ctx.recycleLookupsCount >= 3
  }
];

/**
 * Checks and awards any new badges to the user in-memory.
 * Does not save the document (caller must save).
 * 
 * @param {object} user - Mongoose User document
 * @returns {Promise<Array>} - List of newly earned badge objects
 */
async function checkAndAwardBadges(user) {
  const totalScans = await getTotalScans(user._id);
  const avgScore = await getAverageScore(user._id);

  const ctx = {
    totalScans,
    avgScore,
    currentStreakDays: user.currentStreakDays || 0,
    recycleLookupsCount: user.recycleLookupsCount || 0
  };

  const newBadges = [];

  for (const badge of BADGE_CATALOG) {
    if (!user.badges.includes(badge.key)) {
      if (badge.check(ctx)) {
        user.badges.push(badge.key);
        newBadges.push({
          key: badge.key,
          label: badge.label,
          emoji: badge.emoji,
          description: badge.description
        });
      }
    }
  }

  return newBadges;
}

module.exports = {
  BADGE_CATALOG,
  checkAndAwardBadges
};
