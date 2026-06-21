const emissionFactors = require('../data/emissionFactors.json');

/**
 * Rounds a number to a specific number of decimals.
 */
function round(value, decimals = 1) {
  if (value == null || isNaN(value)) return null;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Helper to capitalize words.
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Calculates greener alternative suggestions for a scan.
 * 
 * @param {object} scan - Mongoose Scan document
 * @returns {Promise<object>} - Alternative suggestion result
 */
async function getAlternative(scan) {
  if (!scan) {
    return { hasAlternative: false, message: "No scan data provided." };
  }

  const { materialCategories, spendCategories, foodPerKg, foodSwaps, flightFactors } = emissionFactors;

  switch (scan.type) {
    case 'product': {
      if (!scan.categoryKey) {
        return { hasAlternative: false, message: "No category key found on this scan. Try manual classification to see swaps." };
      }
      const entry = materialCategories[scan.categoryKey];
      if (!entry || !entry.alternative) {
        return { hasAlternative: false, message: "No specific lower-carbon swap identified for this material yet." };
      }

      // If the scan co2Kg is null, use the entry default
      const currentCo2 = scan.co2Kg ?? entry.co2PerItem;
      const savingsKg = round(currentCo2 - entry.alternative.co2PerItem, 1);
      const savingsPercent = round((savingsKg / currentCo2) * 100, 0);

      return {
        hasAlternative: true,
        suggestion: entry.alternative.label,
        message: entry.alternative.message,
        currentCo2Kg: currentCo2,
        alternativeCo2Kg: entry.alternative.co2PerItem,
        savingsKg: Math.max(0, savingsKg),
        savingsPercent: Math.max(0, savingsPercent)
      };
    }

    case 'receipt': {
      if (!scan.categoryKey) {
        return { hasAlternative: false, message: "No category key found on this receipt scan." };
      }
      const entry = spendCategories[scan.categoryKey];
      if (!entry) {
        return { hasAlternative: false, message: "No guidance available for this category yet." };
      }

      return {
        hasAlternative: true,
        tip: entry.alternativeTip,
        note: "General guidance — exact savings depend on what you actually buy, not a precise number for this specific receipt."
      };
    }

    case 'flight': {
      const distanceKm = scan.calculationDetails?.distanceKm;
      if (!distanceKm || scan.co2Kg == null) {
        return { hasAlternative: false, message: "Not enough route data to suggest an alternative for this flight." };
      }

      if (distanceKm >= flightFactors.shortHaulThresholdKm) {
        return {
          hasAlternative: false,
          message: "No realistic lower-carbon alternative for this distance — direct flights remain the practical option for long-haul travel."
        };
      }

      const railEstimateKg = round(distanceKm * flightFactors.railFactorPerKgKm, 1);
      const savingsKg = round(scan.co2Kg - railEstimateKg, 1);
      const savingsPercent = round((savingsKg / scan.co2Kg) * 100, 0);

      return {
        hasAlternative: true,
        suggestion: "Take the train instead",
        message: "For a route this distance, rail travel typically produces a fraction of the emissions per passenger.",
        currentCo2Kg: scan.co2Kg,
        alternativeCo2Kg: railEstimateKg,
        savingsKg: Math.max(0, savingsKg),
        savingsPercent: Math.max(0, savingsPercent)
      };
    }

    case 'barcode': {
      if (!scan.categoryKey) {
        return { hasAlternative: false, message: "No specific lower-carbon swap identified for this item yet." };
      }

      const swapKey = foodSwaps[scan.categoryKey];
      if (!swapKey || !foodPerKg[scan.categoryKey] || !foodPerKg[swapKey]) {
        return { hasAlternative: false, message: "No specific lower-carbon swap identified for this item yet." };
      }

      const originalPerKg = foodPerKg[scan.categoryKey];
      const alternativePerKg = foodPerKg[swapKey];
      const savingsPercent = round(((originalPerKg - alternativePerKg) / originalPerKg) * 100, 0);

      return {
        hasAlternative: true,
        suggestion: `Try ${capitalize(swapKey)} instead of ${capitalize(scan.categoryKey)}`,
        currentCo2PerKg: originalPerKg,
        alternativeCo2PerKg: alternativePerKg,
        savingsPercent: Math.max(0, savingsPercent),
        note: "Based on average emissions per kg for this food category, not this specific product's exact weight."
      };
    }

    default: {
      return { hasAlternative: false, message: "No alternative suggestion available for this scan." };
    }
  }
}

module.exports = {
  getAlternative
};
