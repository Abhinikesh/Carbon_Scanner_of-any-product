const axios = require('axios');

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * Detect labels in an image using Google Vision API
 * @param {string} imageUrl - public image URL
 * @returns {object} recognized item info
 */
const identifyProduct = async (imageUrl) => {
  try {
    const response = await axios.post(
      `${VISION_API_URL}?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        requests: [
          {
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
            ],
          },
        ],
      }
    );

    const labels = response.data.responses[0].labelAnnotations || [];
    const objects = response.data.responses[0].localizedObjectAnnotations || [];

    const topLabel = labels[0]?.description || 'Unknown item';
    const confidence = labels[0]?.score || 0;

    // Determine category from labels
    const category = detectCategory(labels.map((l) => l.description.toLowerCase()));

    return {
      name: topLabel,
      category,
      weight: estimateWeight(topLabel, category),
      quantity: 1,
      confidence: parseFloat((confidence * 100).toFixed(1)),
      rawLabels: labels.slice(0, 5).map((l) => ({ label: l.description, score: l.score })),
    };
  } catch (error) {
    throw new Error(`AI Service failed: ${error.message}`);
  }
};

/**
 * Extract text from image using Google Vision OCR
 * @param {string} imageUrl - public image URL
 * @returns {string} extracted text
 */
const extractTextFromImage = async (imageUrl) => {
  try {
    const response = await axios.post(
      `${VISION_API_URL}?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        requests: [
          {
            image: { source: { imageUri: imageUrl } },
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      }
    );
    const text = response.data.responses[0].fullTextAnnotation?.text || '';
    return text;
  } catch (error) {
    throw new Error(`OCR Service failed: ${error.message}`);
  }
};

/**
 * Parse receipt text to extract items
 * @param {string} text - raw OCR text
 * @returns {Array} array of { item, quantity }
 */
const parseReceiptText = (text) => {
  const lines = text.split('\n').filter((line) => line.trim().length > 2);
  const items = [];
  const priceRegex = /\d+[.,]\d{2}/;
  const qtyRegex = /^(\d+)\s*[xX]/;

  for (const line of lines) {
    if (priceRegex.test(line) && line.length > 4) {
      const qty = qtyRegex.exec(line);
      const cleanName = line.replace(/\d+[.,]\d{2}/, '').replace(/[^a-zA-Z\s]/g, '').trim();
      if (cleanName.length > 2) {
        items.push({ item: cleanName, quantity: qty ? parseInt(qty[1]) : 1 });
      }
    }
  }
  return items;
};

/**
 * Parse flight ticket text to extract route info
 * @param {string} text - raw OCR text
 * @returns {object} flight info
 */
const parseFlightText = (text) => {
  const airportCode = /\b[A-Z]{3}\b/g;
  const codes = text.match(airportCode) || [];

  const flightClass = text.toLowerCase().includes('business')
    ? 'business'
    : text.toLowerCase().includes('first')
    ? 'first'
    : 'economy';

  return {
    from: codes[0] || 'Unknown',
    to: codes[1] || 'Unknown',
    airline: 'Unknown',
    class: flightClass,
    distanceKm: estimateFlightDistance(codes[0], codes[1]),
  };
};

// ─── Helpers ─────────────────────────────────────────────

const detectCategory = (labels) => {
  const foodKeywords = ['food', 'burger', 'chicken', 'beef', 'vegetable', 'fruit', 'meal', 'dish', 'cuisine', 'drink', 'beverage', 'meat', 'fish'];
  const transportKeywords = ['car', 'vehicle', 'airplane', 'flight', 'bus', 'train', 'motorcycle', 'transport'];
  const productKeywords = ['bottle', 'clothing', 'shirt', 'shoe', 'electronics', 'phone', 'laptop', 'plastic', 'packaging'];

  for (const label of labels) {
    if (foodKeywords.some((k) => label.includes(k))) return 'food';
    if (transportKeywords.some((k) => label.includes(k))) return 'transport';
    if (productKeywords.some((k) => label.includes(k))) return 'product';
  }
  return 'product';
};

const estimateWeight = (name, category) => {
  if (category === 'food') return 0.25;
  if (category === 'product') return 0.5;
  return 1;
};

const estimateFlightDistance = (from, to) => {
  // Average approximation — real app should use distance matrix API
  if (!from || !to || from === 'Unknown') return 1000;
  return 2500; // default average
};

module.exports = { identifyProduct, extractTextFromImage, parseReceiptText, parseFlightText };
