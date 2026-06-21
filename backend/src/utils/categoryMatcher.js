/**
 * Matches a receipt/store text to a spend category based on keywords.
 * Defaults to 'general'.
 *
 * @param {string} text - The input text to search
 * @returns {string} - The matched spend category key
 */
function matchSpendCategory(text = '') {
  const normalized = text.toLowerCase();

  const rules = [
    { key: 'groceries', keywords: ['walmart', 'kroger', 'whole foods', 'safeway', 'grocery', 'supermarket', 'market', 'trader joe'] },
    { key: 'restaurant', keywords: ['restaurant', 'cafe', 'diner', 'grill', 'kitchen', 'bistro', 'eatery', 'starbucks', 'mcdonald'] },
    { key: 'fuel', keywords: ['shell', 'chevron', 'exxon', 'bp', 'gas station', 'fuel', 'petrol'] },
    { key: 'electronics', keywords: ['best buy', 'apple store', 'electronics', 'computer'] },
    { key: 'clothing', keywords: ['h&m', 'zara', 'clothing', 'apparel', 'fashion', 'nike', 'gap'] },
    { key: 'pharmacy', keywords: ['cvs', 'walgreens', 'pharmacy', 'drug store'] },
    { key: 'homeGoods', keywords: ['ikea', 'home depot', 'furniture', 'lowes'] }
  ];

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword)) {
        return rule.key;
      }
    }
  }

  return 'general';
}

/**
 * Matches a product description text to a material category based on keywords.
 * Defaults to 'general'.
 *
 * @param {string} text - The input text to search
 * @returns {string} - The matched material category key
 */
function matchMaterialCategory(text = '') {
  const normalized = text.toLowerCase();

  const rules = [
    { key: 'leather', keywords: ['leather', 'hide'] },
    { key: 'cotton', keywords: ['cotton'] },
    { key: 'syntheticTextile', keywords: ['polyester', 'nylon', 'synthetic', 'acrylic'] },
    { key: 'plastic', keywords: ['plastic'] },
    { key: 'bambooWood', keywords: ['bamboo', 'wood', 'timber', 'wooden'] },
    { key: 'glass', keywords: ['glass'] },
    { key: 'metal', keywords: ['metal', 'steel', 'aluminum', 'aluminium'] },
    { key: 'paper', keywords: ['paper', 'cardboard'] },
    { key: 'electronicsLaptop', keywords: ['laptop', 'macbook', 'notebook computer'] },
    { key: 'electronicsPhone', keywords: ['phone', 'iphone', 'smartphone', 'galaxy'] },
    { key: 'electronicsSmall', keywords: ['charger', 'cable', 'adapter', 'earbuds', 'headphone'] }
  ];

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword)) {
        return rule.key;
      }
    }
  }

  return 'general';
}

module.exports = {
  matchSpendCategory,
  matchMaterialCategory
};
