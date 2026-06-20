const Scan = require('../models/Scan');
const User = require('../models/User');
const aiService = require('../services/aiService');
const carbonService = require('../services/carbonService');
const sustainabilityService = require('../services/sustainabilityService');
const alternativesService = require('../services/alternativesService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Award badges based on user stats
 */
const checkAndAwardBadges = (user) => {
  const badges = new Set(user.badges || []);
  if (user.totalScans === 1) badges.add('First Scan 🌱');
  if (user.totalScans >= 10) badges.add('Carbon Tracker 🔍');
  if (user.totalScans >= 50) badges.add('Eco Champion 🏆');
  if (user.totalCO2 >= 100) badges.add('Eco Warrior ⚡');
  return [...badges];
};

/**
 * @desc   Upload image and get CO2 result
 * @route  POST /api/scan/upload
 * @access Private
 */
const uploadScan = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'Please upload an image');

    const imageUrl = req.file.path;
    const type = req.body.type || 'product';
    let recognizedItem = { name: 'Unknown', category: 'product', weight: 1, quantity: 1, confidence: 0 };
    let aiFailed = false;

    // Step 1: AI Recognition
    try {
      if (type === 'product' || type === 'food' || type === 'barcode') {
        const aiResult = await aiService.identifyProduct(imageUrl);
        recognizedItem = aiResult;
      } else if (type === 'receipt') {
        const text = await aiService.extractTextFromImage(imageUrl);
        const items = aiService.parseReceiptText(text);
        recognizedItem = {
          name: items[0]?.item || 'Receipt Item',
          category: 'product',
          weight: 1,
          quantity: items[0]?.quantity || 1,
          confidence: 70,
        };
      } else if (type === 'flight') {
        const text = await aiService.extractTextFromImage(imageUrl);
        const flightInfo = aiService.parseFlightText(text);
        recognizedItem = {
          name: `Flight ${flightInfo.from} → ${flightInfo.to}`,
          category: 'transport',
          weight: flightInfo.distanceKm,
          quantity: 1,
          confidence: 80,
          flightData: flightInfo,
        };
      }
    } catch (aiError) {
      console.warn('AI Recognition failed:', aiError.message);
      aiFailed = true;
    }

    // Step 2: Carbon Calculation
    const co2Result = await carbonService.calculateCO2(
      recognizedItem.name,
      recognizedItem.category,
      recognizedItem.weight || 1,
      recognizedItem.category === 'transport' ? 'km' : 'kg'
    );

    // Step 3: Sustainability Index
    const sustainability = sustainabilityService.calculateIndex(co2Result.co2e, recognizedItem.category);

    // Step 4: Equivalents
    const equivalent = sustainabilityService.getEquivalent(co2Result.co2e);

    // Step 5: Alternatives
    const alternatives = alternativesService.getAlternatives(recognizedItem.name, recognizedItem.category);

    // Step 6: Save Scan
    const scan = await Scan.create({
      userId: req.user._id,
      type,
      uploadedImageUrl: imageUrl,
      recognizedItem,
      co2Estimate: { value: co2Result.co2e, unit: co2Result.unit, source: co2Result.source },
      sustainabilityIndex: sustainability,
      alternatives,
      aiFailed,
    });

    // Step 7: Update User Stats
    const user = await User.findById(req.user._id);
    user.totalScans += 1;
    user.totalCO2 = parseFloat((user.totalCO2 + co2Result.co2e).toFixed(2));
    user.carbonHistory.push({
      date: new Date(),
      co2: co2Result.co2e,
      category: recognizedItem.category,
      item: recognizedItem.name,
    });

    // Step 8: Badges
    if (sustainability.label === 'green') {
      const b = new Set(user.badges || []);
      b.add('Green Scout 🌿');
      user.badges = [...b];
    }
    user.badges = checkAndAwardBadges(user);
    user.lastScanDate = new Date();
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 201, 'Scan completed successfully', {
      scan,
      equivalent,
      newBadges: user.badges,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get user scan history
 * @route  GET /api/scan/history
 * @access Private
 */
const getScanHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const scans = await Scan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Scan.countDocuments({ userId: req.user._id });

    return sendSuccess(res, 200, 'Scan history fetched', {
      scans,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single scan
 * @route  GET /api/scan/:id
 * @access Private
 */
const getScan = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!scan) return sendError(res, 404, 'Scan not found');
    return sendSuccess(res, 200, 'Scan fetched', { scan });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete a scan
 * @route  DELETE /api/scan/:id
 * @access Private
 */
const deleteScan = async (req, res, next) => {
  try {
    const scan = await Scan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!scan) return sendError(res, 404, 'Scan not found');
    return sendSuccess(res, 200, 'Scan deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadScan, getScanHistory, getScan, deleteScan };
