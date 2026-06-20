const { CATEGORY_MAX } = require('../utils/carbonCalculator');

/**
 * Calculate sustainability index for a scan
 * @param {number} co2Value - CO2e in kg
 * @param {string} category - food | transport | product | general
 * @returns {object} { score, label, color }
 */
const calculateIndex = (co2Value, category) => {
  const maxCO2 = CATEGORY_MAX[category] || CATEGORY_MAX.general;
  const normalized = Math.min(co2Value / maxCO2, 1);
  const score = Math.round((1 - normalized) * 100);

  let label, color;

  if (score >= 80) {
    label = 'green';
    color = '#00C896';
  } else if (score >= 50) {
    label = 'moderate';
    color = '#F4A261';
  } else {
    label = 'high_impact';
    color = '#EF4444';
  }

  return { score, label, color };
};

/**
 * Get equivalent real-world comparison for CO2 value
 * @param {number} co2kg - CO2 in kg
 * @returns {string} human-readable equivalent
 */
const getEquivalent = (co2kg) => {
  const drivingKm = (co2kg / 0.21).toFixed(1);
  const treeHours = (co2kg / 0.02).toFixed(0);

  if (co2kg < 1) return `About ${(co2kg * 1000).toFixed(0)}g of CO₂ — like charging your phone ${Math.round(co2kg * 100)} times`;
  if (co2kg < 10) return `Equivalent to driving ${drivingKm} km in a petrol car`;
  return `Equivalent to driving ${drivingKm} km or ${treeHours} hours of tree absorption`;
};

module.exports = { calculateIndex, getEquivalent };
