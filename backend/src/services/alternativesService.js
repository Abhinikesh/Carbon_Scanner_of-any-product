/**
 * Greener alternatives map
 */
const ALTERNATIVES_MAP = {
  beef: [
    { name: 'Veg Burger', co2Reduction_percent: 70, reason: 'Plant-based protein, no livestock emissions' },
    { name: 'Chicken', co2Reduction_percent: 74, reason: 'Lower methane emissions than beef' },
    { name: 'Lentils', co2Reduction_percent: 90, reason: 'Legumes have very low carbon footprint' },
  ],
  lamb: [
    { name: 'Chicken', co2Reduction_percent: 71, reason: 'Poultry is far more efficient than lamb' },
    { name: 'Tofu', co2Reduction_percent: 89, reason: 'Plant-based protein' },
  ],
  chicken: [
    { name: 'Tofu', co2Reduction_percent: 57, reason: 'Plant-based protein' },
    { name: 'Eggs', co2Reduction_percent: 35, reason: 'Lower land and feed requirement' },
  ],
  cheese: [
    { name: 'Vegan Cheese', co2Reduction_percent: 60, reason: 'No dairy processing required' },
    { name: 'Hummus', co2Reduction_percent: 75, reason: 'Chickpea-based, very low emissions' },
  ],
  flight: [
    { name: 'Train', co2Reduction_percent: 84, reason: 'Rail travel emits 84% less per km' },
    { name: 'Bus', co2Reduction_percent: 75, reason: 'Shared transport reduces per-person emissions' },
    { name: 'Video Call', co2Reduction_percent: 99, reason: 'Eliminate travel entirely' },
  ],
  car_petrol: [
    { name: 'Electric Car', co2Reduction_percent: 75, reason: 'Zero tailpipe emissions' },
    { name: 'Train', co2Reduction_percent: 80, reason: 'Far more efficient per passenger km' },
    { name: 'Bicycle', co2Reduction_percent: 100, reason: 'Zero emissions' },
  ],
  plastic_bottle: [
    { name: 'Reusable Bottle', co2Reduction_percent: 90, reason: 'Eliminates single-use plastic manufacturing' },
    { name: 'Glass Bottle', co2Reduction_percent: 40, reason: 'Recyclable and reusable' },
  ],
  tshirt_cotton: [
    { name: 'Organic Cotton T-Shirt', co2Reduction_percent: 46, reason: 'No pesticides, less water use' },
    { name: 'Secondhand Clothing', co2Reduction_percent: 82, reason: 'Reuse eliminates manufacturing emissions' },
  ],
  jeans: [
    { name: 'Secondhand Jeans', co2Reduction_percent: 80, reason: 'No new production required' },
    { name: 'Organic Denim', co2Reduction_percent: 45, reason: 'Sustainable farming practices' },
  ],
  smartphone: [
    { name: 'Refurbished Phone', co2Reduction_percent: 70, reason: 'No new manufacturing needed' },
    { name: 'Keep Current Phone Longer', co2Reduction_percent: 50, reason: 'Every extra year halves annual footprint' },
  ],
  laptop: [
    { name: 'Refurbished Laptop', co2Reduction_percent: 60, reason: 'Reuse avoids new resource extraction' },
  ],
  chocolate: [
    { name: 'Dark Chocolate (70%+)', co2Reduction_percent: 30, reason: 'Less dairy, more efficient' },
    { name: 'Local Artisan Chocolate', co2Reduction_percent: 20, reason: 'Shorter supply chain' },
  ],
  coffee: [
    { name: 'Oat Milk Coffee', co2Reduction_percent: 30, reason: 'Oat milk has 70% lower emissions than dairy' },
    { name: 'Local/Shade-grown Coffee', co2Reduction_percent: 25, reason: 'Sustainable farming practices' },
  ],
};

/**
 * Get greener alternatives for a recognized item
 * @param {string} itemName - recognized item name
 * @param {string} category - category hint
 * @returns {Array} list of alternatives
 */
const getAlternatives = (itemName, category) => {
  const lower = itemName.toLowerCase();

  for (const key of Object.keys(ALTERNATIVES_MAP)) {
    if (lower.includes(key.split('_')[0])) {
      return ALTERNATIVES_MAP[key];
    }
  }

  // Generic alternatives by category
  if (category === 'food') {
    return [{ name: 'Plant-based option', co2Reduction_percent: 50, reason: 'Plant-based foods average 50% lower emissions' }];
  }
  if (category === 'transport') {
    return [{ name: 'Public Transport', co2Reduction_percent: 60, reason: 'Shared transport drastically reduces per-person emissions' }];
  }
  if (category === 'product') {
    return [{ name: 'Secondhand Item', co2Reduction_percent: 70, reason: 'Reuse avoids new manufacturing entirely' }];
  }

  return [];
};

module.exports = { getAlternatives };
