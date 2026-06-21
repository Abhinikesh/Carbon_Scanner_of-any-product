/**
 * Matches input text (query or scan fields) to a disposal category.
 * Defaults to 'general_landfill'.
 *
 * @param {string} text - The input text to match
 * @returns {string} - The matched disposal category key
 */
function matchDisposalCategory(text = '') {
  const normalized = text.toLowerCase();

  const rules = [
    { key: 'plastic', keywords: ['plastic', 'bottle', 'wrapper', 'packaging'] },
    { key: 'glass', keywords: ['glass', 'jar'] },
    { key: 'paper_cardboard', keywords: ['paper', 'cardboard', 'box', 'newspaper', 'magazine'] },
    { key: 'metal_cans', keywords: ['can', 'tin', 'aluminum', 'aluminium', 'steel', 'scrap metal'] },
    { key: 'electronics_small', keywords: ['charger', 'cable', 'earbuds', 'headphone', 'adapter', 'remote'] },
    { key: 'electronics_large', keywords: ['laptop', 'tv', 'television', 'monitor', 'computer', 'printer'] },
    { key: 'batteries', keywords: ['battery', 'batteries'] },
    { key: 'textile_clothing', keywords: ['clothing', 'shirt', 'jacket', 'leather', 'cotton', 'fabric', 'textile', 'shoes', 'jeans'] },
    { key: 'organic_food_waste', keywords: ['food', 'fruit', 'vegetable', 'leftover', 'organic waste', 'compost'] },
    { key: 'hazardous_chemicals', keywords: ['paint', 'oil', 'pesticide', 'chemical', 'solvent', 'motor oil'] },
    { key: 'light_bulbs_cfl', keywords: ['bulb', 'cfl', 'fluorescent'] },
    { key: 'furniture_large_items', keywords: ['furniture', 'sofa', 'couch', 'mattress', 'table', 'chair'] }
  ];

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword)) {
        return rule.key;
      }
    }
  }

  return 'general_landfill';
}

module.exports = {
  matchDisposalCategory
};
