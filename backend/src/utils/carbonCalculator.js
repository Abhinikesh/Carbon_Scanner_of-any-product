/**
 * Local carbon emission factors (fallback when Climatiq API is unavailable)
 * Source: EPA, DEFRA, FAO public datasets
 */
const EMISSION_FACTORS = {
  food: {
    beef: 27.0,
    lamb: 24.0,
    pork: 7.6,
    chicken: 6.9,
    fish: 6.1,
    cheese: 13.5,
    milk: 3.2,
    eggs: 4.5,
    rice: 2.7,
    bread: 1.6,
    pasta: 1.4,
    vegetables: 2.0,
    fruit: 1.1,
    tofu: 3.0,
    nuts: 2.5,
    chocolate: 18.7,
    coffee: 17.0,
    beer: 0.89,
  },
  transport: {
    flight_economy_per_km: 0.255,
    flight_business_per_km: 0.573,
    flight_first_per_km: 0.858,
    car_petrol_per_km: 0.21,
    car_diesel_per_km: 0.168,
    car_electric_per_km: 0.053,
    train_per_km: 0.041,
    bus_per_km: 0.089,
    motorcycle_per_km: 0.114,
    taxi_per_km: 0.149,
  },
  product: {
    plastic_bottle: 0.083,
    tshirt_cotton: 10.0,
    tshirt_polyester: 5.5,
    jeans: 33.4,
    shoes_leather: 14.0,
    shoes_synthetic: 7.5,
    smartphone: 70.0,
    laptop: 316.0,
    tv_50inch: 400.0,
    washing_machine: 247.0,
    shampoo_bottle: 0.5,
    toothbrush: 0.045,
    notebook_paper: 0.003,
  },
};

/**
 * Category max CO2 for normalization (used in sustainability scoring)
 */
const CATEGORY_MAX = {
  food: 30,
  transport: 500,
  product: 400,
  general: 100,
};

/**
 * Calculate CO2e from local factors
 * @param {string} itemKey - item key in emission factors
 * @param {string} category - food | transport | product
 * @param {number} quantity - amount (kg, km, units)
 * @returns {number} CO2e in kg
 */
const calculateLocalCO2 = (itemKey, category, quantity = 1) => {
  const cat = EMISSION_FACTORS[category];
  if (!cat) return quantity * 1.0; // default fallback
  const factor = cat[itemKey] || cat[Object.keys(cat)[0]];
  return parseFloat((quantity * factor).toFixed(2));
};

/**
 * Match a recognized label to the closest emission factor key
 * @param {string} label - AI recognized label
 * @param {string} category - category hint
 * @returns {string} matched key
 */
const matchToFactorKey = (label, category) => {
  const lowerLabel = label.toLowerCase();
  const cat = EMISSION_FACTORS[category] || {};
  for (const key of Object.keys(cat)) {
    if (lowerLabel.includes(key.split('_')[0])) return key;
  }
  return Object.keys(cat)[0] || 'general';
};

module.exports = { EMISSION_FACTORS, CATEGORY_MAX, calculateLocalCO2, matchToFactorKey };
