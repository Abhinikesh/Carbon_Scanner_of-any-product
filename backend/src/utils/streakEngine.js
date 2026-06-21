/**
 * Mutates user document in-memory to update streaks based on last scan date.
 * Does not save the document (caller must save).
 * 
 * @param {object} user - Mongoose User document
 */
function updateStreak(user) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.lastScanDate) {
    user.currentStreakDays = 1;
  } else {
    const lastDay = new Date(user.lastScanDate);
    lastDay.setHours(0, 0, 0, 0);
    const diffTime = today - lastDay;
    const diffDays = Math.round(diffTime / 86400000);

    if (diffDays === 0) {
      // Already scanned today, do nothing (streak unchanged)
    } else if (diffDays === 1) {
      user.currentStreakDays += 1;
    } else {
      // Streak broken, restart at 1
      user.currentStreakDays = 1;
    }
  }

  user.lastScanDate = new Date();

  if (user.currentStreakDays > user.longestStreakDays) {
    user.longestStreakDays = user.currentStreakDays;
  }
}

module.exports = {
  updateStreak
};
