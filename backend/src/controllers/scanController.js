const mongoose = require('mongoose');
const Scan = require('../models/Scan');
const { runOCR } = require('../utils/ocrEngine');
const { parseFields } = require('../utils/parseScanText');
const {
  calculateCarbon,
  calculateReceiptCarbon,
  calculateProductCarbon
} = require('../utils/carbonEngine');
const emissionFactors = require('../data/emissionFactors.json');

/**
 * Creates a scan (OCR image upload or Barcode value) and runs carbon calculation.
 *
 * @route POST /api/scans
 * @access Private
 */
async function createScan(req, res, next) {
  try {
    const { type } = req.body;

    const allowedTypes = ['product', 'receipt', 'flight', 'barcode'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid scan type' });
    }

    if (type === 'barcode') {
      const { barcodeValue } = req.body;
      if (!barcodeValue) {
        return res.status(400).json({ success: false, message: 'barcodeValue is required for barcode scans' });
      }

      const scan = new Scan({
        user: req.user.id,
        type,
        barcodeValue,
        status: 'processing'
      });

      try {
        const carbonResult = await calculateCarbon(type, {}, barcodeValue);
        scan.category = carbonResult.category;
        scan.categoryKey = carbonResult.categoryKey;
        scan.co2Kg = carbonResult.co2Kg;
        scan.score = carbonResult.score;
        scan.parsedFields = carbonResult.note ? { note: carbonResult.note } : {};
        
        const details = {};
        const extraKeys = ['distanceKm', 'estimatedAmount', 'note', 'calculationMethod'];
        for (const k of extraKeys) {
          if (carbonResult[k] !== undefined) {
            details[k] = carbonResult[k];
          }
        }
        scan.calculationDetails = details;
        scan.status = 'ocr_done';
      } catch (calcError) {
        console.error('[Carbon Engine] Barcode calculation error:', calcError.message);
        scan.category = 'Unknown product';
        scan.categoryKey = null;
        scan.co2Kg = null;
        scan.score = null;
        scan.parsedFields = { note: `Carbon calculation failed: ${calcError.message}` };
        scan.calculationDetails = {};
        scan.status = 'ocr_done';
      }

      await scan.save();

      if (scan.status === 'ocr_done') {
        const User = require('../models/User');
        const { updateStreak } = require('../utils/streakEngine');
        const { checkAndAwardBadges } = require('../utils/badgeEngine');
        
        const user = await User.findById(req.user.id);
        if (user) {
          updateStreak(user);
          const newBadges = await checkAndAwardBadges(user);
          await user.save({ validateBeforeSave: false });
          
          return res.status(201).json({
            success: true,
            scan,
            newBadges
          });
        }
      }

      return res.status(201).json(scan);
    } else {
      // product / receipt / flight scans require an uploaded file
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Create scan document with status 'processing'
      const scan = new Scan({
        user: req.user.id,
        type,
        originalFilename: req.file.originalname,
        status: 'processing'
      });
      await scan.save();

      let ocrResult;
      try {
        // Run OCR
        ocrResult = await runOCR(req.file.buffer);
        scan.rawText = ocrResult.text;
      } catch (ocrError) {
        // Mark scan as failed if OCR itself failed
        scan.status = 'failed';
        scan.errorMessage = ocrError.message || 'OCR processing failed';
        await scan.save();

        return res.status(500).json({
          success: false,
          message: 'OCR processing failed',
          scanId: scan._id
        });
      }

      // Parse fields from OCR text
      const parsed = parseFields(type, ocrResult.text);

      // Run Carbon Engine calculations
      try {
        const carbonResult = await calculateCarbon(type, parsed, null);
        scan.category = carbonResult.category;
        scan.categoryKey = carbonResult.categoryKey;
        scan.co2Kg = carbonResult.co2Kg;
        scan.score = carbonResult.score;
        
        // Save travel distance info or other attributes returned from engine if present
        scan.parsedFields = {
          ...parsed,
          ...(carbonResult.distanceKm != null ? { distanceKm: carbonResult.distanceKm } : {}),
          ...(carbonResult.note ? { note: carbonResult.note } : {})
        };

        const details = {};
        const extraKeys = ['distanceKm', 'estimatedAmount', 'note', 'calculationMethod'];
        for (const k of extraKeys) {
          if (carbonResult[k] !== undefined) {
            details[k] = carbonResult[k];
          }
        }
        scan.calculationDetails = details;
        scan.status = 'ocr_done';
      } catch (calcError) {
        console.error('[Carbon Engine] Calculation error:', calcError.message);
        scan.category = null;
        scan.categoryKey = null;
        scan.co2Kg = null;
        scan.score = null;
        scan.parsedFields = {
          ...parsed,
          note: `Carbon calculation failed: ${calcError.message}`
        };
        scan.calculationDetails = {};
        scan.status = 'ocr_done'; // OCR succeeded, so set scan to done
      }

      await scan.save();

      if (scan.status === 'ocr_done') {
        const User = require('../models/User');
        const { updateStreak } = require('../utils/streakEngine');
        const { checkAndAwardBadges } = require('../utils/badgeEngine');
        
        const user = await User.findById(req.user.id);
        if (user) {
          updateStreak(user);
          const newBadges = await checkAndAwardBadges(user);
          await user.save({ validateBeforeSave: false });
          
          return res.status(201).json({
            success: true,
            scan,
            newBadges
          });
        }
      }

      return res.status(201).json(scan);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Lists all scans for the authenticated user, sorted by date descending.
 * Optional query parameter 'limit' to restrict output (max 50).
 *
 * @route GET /api/scans
 * @access Private
 */
async function listScans(req, res, next) {
  try {
    const limitQuery = req.query.limit;
    let limit;
    if (limitQuery) {
      const parsed = parseInt(limitQuery, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 50);
      }
    }

    let query = Scan.find({ user: req.user.id }).sort({ createdAt: -1 });

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const scans = await query;
    return res.status(200).json(scans);
  } catch (error) {
    next(error);
  }
}

/**
 * Aggregates statistics for the user's scans (total count, total CO2, this month's CO2, and avg score).
 *
 * @route GET /api/scans/stats
 * @access Private
 */
async function getScanStats(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { getTotalScans, getAverageScore } = require('../utils/scanStatsHelper');

    // 1. Total scans count
    const totalScans = await getTotalScans(userId);

    // 2. Total CO2 emissions
    const totalCo2Pipeline = [
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$co2Kg", 0] } } } }
    ];
    const totalCo2Result = await Scan.aggregate(totalCo2Pipeline);
    const totalCo2Kg = totalCo2Result.length > 0 ? parseFloat(totalCo2Result[0].total.toFixed(1)) : 0.0;

    // 3. This month's CO2 emissions
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCo2Pipeline = [
      {
        $match: {
          user: userId,
          createdAt: { $gte: startOfMonth, $lte: now }
        }
      },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$co2Kg", 0] } } } }
    ];
    const thisMonthCo2Result = await Scan.aggregate(thisMonthCo2Pipeline);
    const thisMonthCo2Kg = thisMonthCo2Result.length > 0 ? parseFloat(thisMonthCo2Result[0].total.toFixed(1)) : 0.0;

    // 4. Average Sustainability Score (exclude nulls, return null if no scans have a score)
    const sustainabilityScore = await getAverageScore(userId);

    return res.status(200).json({
      success: true,
      totalScans,
      totalCo2Kg,
      thisMonthCo2Kg,
      sustainabilityScore
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Aggregates monthly CO2 emissions over a historical range (3m, 6m, 1y).
 *
 * @route GET /api/scans/chart
 * @access Private
 */
async function getScanChart(req, res, next) {
  try {
    const range = req.query.range || '6m';
    if (!['3m', '6m', '1y'].includes(range)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid range. Must be 3m, 6m, or 1y.'
      });
    }

    let monthsBack;
    if (range === '3m') monthsBack = 3;
    else if (range === '6m') monthsBack = 6;
    else if (range === '1y') monthsBack = 12;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startMonthIndex = currentMonth - (monthsBack - 1);
    const startDate = new Date(currentYear, startMonthIndex, 1, 0, 0, 0, 0);

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const chartPipeline = [
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalCo2: { $sum: { $ifNull: ["$co2Kg", 0] } }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ];

    const aggResults = await Scan.aggregate(chartPipeline);

    const aggMap = {};
    aggResults.forEach((item) => {
      if (item._id && item._id.year && item._id.month) {
        aggMap[`${item._id.year}-${item._id.month}`] = item.totalCo2;
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = [];

    for (let i = 0; i < monthsBack; i++) {
      const targetDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const yr = targetDate.getFullYear();
      const mIndex = targetDate.getMonth();
      const monthNum = mIndex + 1; // 1-indexed for matching Mongo $month

      const key = `${yr}-${monthNum}`;
      const value = aggMap[key] != null ? parseFloat(aggMap[key].toFixed(1)) : 0.0;

      data.push({
        month: monthNames[mIndex],
        year: yr,
        co2Kg: value
      });
    }

    return res.status(200).json({
      success: true,
      range,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves a single scan by ID for the authenticated user.
 *
 * @route GET /api/scans/:id
 * @access Private
 */
async function getScan(req, res, next) {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, user: req.user.id });
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }
    return res.status(200).json(scan);
  } catch (error) {
    next(error);
  }
}

/**
 * Updates the category of a scan and recomputes its carbon emission and score.
 *
 * @route PATCH /api/scans/:id/category
 * @access Private
 */
async function updateScanCategory(req, res, next) {
  try {
    const { newCategory } = req.body;
    if (!newCategory) {
      return res.status(400).json({ success: false, message: 'newCategory is required' });
    }

    const scan = await Scan.findOne({ _id: req.params.id, user: req.user.id });
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    if (scan.type === 'receipt') {
      let matchedKey = null;
      for (const [key, value] of Object.entries(emissionFactors.spendCategories)) {
        if (key === newCategory || value.label === newCategory) {
          matchedKey = key;
          break;
        }
      }

      if (!matchedKey) {
        const validOptions = Object.values(emissionFactors.spendCategories).map((c) => c.label);
        return res.status(400).json({
          success: false,
          message: 'Invalid category option',
          validOptions
        });
      }

      const amount = parseFloat(scan.parsedFields?.totalAmount) || 25.0;
      const calc = calculateReceiptCarbon(matchedKey, amount);

      scan.category = calc.category;
      scan.categoryKey = matchedKey;
      scan.co2Kg = calc.co2Kg;
      scan.score = calc.score;
      scan.manuallyCorrected = true;

      // Retain parsedFields but remove any previous calculation failure notes
      const updatedFields = { ...scan.parsedFields };
      delete updatedFields.note;
      scan.parsedFields = updatedFields;

      await scan.save();
      return res.status(200).json(scan);
    }

    if (scan.type === 'product' || scan.type === 'barcode') {
      // Look up first in material categories
      let matchedKey = null;
      let isMaterial = false;
      for (const [key, value] of Object.entries(emissionFactors.materialCategories)) {
        if (key === newCategory || value.label === newCategory) {
          matchedKey = key;
          isMaterial = true;
          break;
        }
      }

      // If not in material categories, check food categories
      let isFood = false;
      if (!matchedKey) {
        for (const key of Object.keys(emissionFactors.foodPerKg)) {
          if (key === newCategory || key.toLowerCase() === newCategory.toLowerCase()) {
            matchedKey = key;
            isFood = true;
            break;
          }
        }
      }

      if (!matchedKey) {
        const validMaterialOptions = Object.values(emissionFactors.materialCategories).map((c) => c.label);
        const validFoodOptions = Object.keys(emissionFactors.foodPerKg);
        return res.status(400).json({
          success: false,
          message: 'Invalid category option',
          validOptions: [...validMaterialOptions, ...validFoodOptions]
        });
      }

      if (isMaterial) {
        const calc = calculateProductCarbon(matchedKey);
        scan.category = calc.category;
        scan.categoryKey = matchedKey;
        scan.co2Kg = calc.co2Kg;
        scan.score = calc.score;
      } else if (isFood) {
        const co2Kg = emissionFactors.foodPerKg[matchedKey];
        // Score: lower CO2 = higher score
        const score = Math.min(Math.max(Math.round(100 - (co2Kg / 60) * 90), 10), 95);
        scan.category = matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1);
        scan.categoryKey = matchedKey;
        scan.co2Kg = co2Kg;
        scan.score = score;
      }

      scan.manuallyCorrected = true;

      // Retain parsedFields but remove any previous calculation failure notes
      const updatedFields = { ...scan.parsedFields };
      delete updatedFields.note;
      scan.parsedFields = updatedFields;

      await scan.save();
      return res.status(200).json(scan);
    }

    return res.status(400).json({
      success: false,
      message: 'Category correction not supported for this scan type'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves a calculated greener alternative swap for a scan by ID.
 *
 * @route GET /api/scans/:id/alternative
 * @access Private
 */
async function getScanAlternative(req, res, next) {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, user: req.user.id });
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    const { getAlternative } = require('../utils/alternativeEngine');
    const result = await getAlternative(scan);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createScan,
  listScans,
  getScan,
  updateScanCategory,
  getScanStats,
  getScanChart,
  getScanAlternative
};

