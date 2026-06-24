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
 * Returns null if no keyword matches — callers must handle null explicitly
 * and must NOT default-guess a category.
 *
 * @param {string} text - The input text to search (may include AI-predicted labels)
 * @returns {string|null} - The matched material category key, or null if unidentified
 */
function matchMaterialCategory(text = '') {
  const normalized = text.toLowerCase();

  const rules = [
    {
      key: 'leather',
      keywords: [
        'leather', 'hide',
        // Object-name keywords for AI label matching (Step 6)
        'wallet', 'purse', 'handbag', 'loafer'
      ]
    },
    {
      key: 'cotton',
      keywords: [
        'cotton',
        // Object-name keywords
        't-shirt', 'tshirt', 'jeans', 'denim', 'hoodie'
      ]
    },
    {
      key: 'syntheticTextile',
      keywords: [
        'polyester', 'nylon', 'synthetic', 'acrylic',
        // Object-name keywords for AI label matching
        'backpack', 'running shoe', 'sneaker', 'jersey', 'sweatshirt'
      ]
    },
    {
      key: 'plastic',
      keywords: [
        'plastic',
        // Object-name keywords for AI label matching
        'water bottle', 'pop bottle', 'plastic bag'
      ]
    },
    {
      key: 'bambooWood',
      keywords: [
        'bamboo', 'wood', 'timber', 'wooden',
        // Object-name keywords for AI label matching
        'cutting board', 'wooden spoon'
      ]
    },
    {
      key: 'glass',
      keywords: [
        'glass',
        // Object-name keywords for AI label matching
        'wine bottle', 'beer bottle', 'drinking glass'
      ]
    },
    {
      key: 'metal',
      keywords: [
        'metal', 'steel', 'aluminum', 'aluminium',
        // Object-name keywords
        'can', 'tin', 'kettle'
      ]
    },
    {
      key: 'paper',
      keywords: [
        'paper', 'cardboard',
        // Object-name keywords for AI label matching
        'envelope', 'paper towel', 'magazine', 'newspaper'
      ]
    },
    {
      key: 'electronicsLaptop',
      keywords: [
        'laptop', 'macbook',
        // Object-name keywords for AI label matching
        'notebook computer'
      ]
    },
    {
      key: 'electronicsPhone',
      keywords: [
        'phone', 'iphone', 'smartphone', 'galaxy',
        // Object-name keywords for AI label matching
        'cellular telephone', 'smart phone'
      ]
    },
    {
      key: 'electronicsSmall',
      keywords: [
        'charger', 'cable', 'adapter', 'earbuds', 'headphone',
        // Object-name keywords
        'mouse', 'keyboard'
      ]
    }
  ];

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword)) {
        return rule.key;
      }
    }
  }

  // Return null — do NOT guess. Callers must return an honest "Unidentified" result.
  return null;
}

module.exports = {
  matchSpendCategory,
  matchMaterialCategory
};
