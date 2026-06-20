const axios = require('axios');
const { calculateLocalCO2, matchToFactorKey } = require('../utils/carbonCalculator');

const CLIMATIQ_URL = 'https://api.climatiq.io/data/v1/estimate';

/**
 * Calculate CO2e for a given item
 * Tries Climatiq API first, falls back to local factors
 * @param {string} itemName - recognized item name
 * @param {string} category - food | transport | product
 * @param {number} quantity - amount
 * @param {string} unit - kg | km | unit
 * @returns {object} { co2e, unit, source }
 */
const calculateCO2 = async (itemName, category, quantity = 1, unit = 'kg') => {
  try {
    if (process.env.CLIMATIQ_API_KEY) {
      const result = await calculateWithClimatiq(itemName, category, quantity, unit);
      return result;
    }
  } catch (err) {
    console.warn('Climatiq API failed, using local fallback:', err.message);
  }

  // Local fallback
  const itemKey = matchToFactorKey(itemName, category);
  const co2e = calculateLocalCO2(itemKey, category, quantity);
  return {
    co2e,
    unit: 'kg CO2e',
    source: 'local_estimate',
  };
};

/**
 * Call Climatiq API for emission estimate
 */
const calculateWithClimatiq = async (itemName, category, quantity, unit) => {
  const activityId = mapToClimatiqActivity(itemName, category);

  const response = await axios.post(
    CLIMATIQ_URL,
    {
      emission_factor: { activity_id: activityId },
      parameters: { [unit === 'km' ? 'distance' : 'weight']: quantity, [`${unit === 'km' ? 'distance' : 'weight'}_unit`]: unit },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    co2e: parseFloat(response.data.co2e.toFixed(2)),
    unit: response.data.co2e_unit || 'kg CO2e',
    source: 'climatiq_api',
  };
};

/**
 * Map item to Climatiq activity ID
 */
const mapToClimatiqActivity = (itemName, category) => {
  const lower = itemName.toLowerCase();
  if (category === 'food') {
    if (lower.includes('beef')) return 'food-beef_products-na-kg';
    if (lower.includes('chicken')) return 'food-poultry_products-na-kg';
    return 'food-mixed-na-kg';
  }
  if (category === 'transport') {
    if (lower.includes('flight') || lower.includes('plane')) return 'passenger_flight-route_type_na-aircraft_type_na-na-na-economy_class';
    if (lower.includes('car')) return 'passenger_vehicle-vehicle_type_car-fuel_source_petrol-na-average';
    return 'passenger_vehicle-vehicle_type_car-fuel_source_petrol-na-average';
  }
  return 'consumer_goods-type_mixed-na-kg';
};

module.exports = { calculateCO2 };
