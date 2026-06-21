const mongoose = require('mongoose');
const Scan = require('../models/Scan');

/**
 * Gets the total number of scans completed for a user.
 * @param {string|mongoose.Types.ObjectId} userId 
 * @returns {Promise<number>}
 */
async function getTotalScans(userId) {
  const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  return await Scan.countDocuments({ user: userObjectId });
}

/**
 * Gets the average sustainability score for a user's scans (excluding nulls).
 * Returns null if no scans have scores.
 * @param {string|mongoose.Types.ObjectId} userId 
 * @returns {Promise<number|null>}
 */
async function getAverageScore(userId) {
  const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  const result = await Scan.aggregate([
    { $match: { user: userObjectId, score: { $ne: null } } },
    { $group: { _id: null, avgScore: { $avg: '$score' } } }
  ]);

  if (result.length === 0) {
    return null;
  }
  return Math.round(result[0].avgScore);
}

module.exports = {
  getTotalScans,
  getAverageScore
};
