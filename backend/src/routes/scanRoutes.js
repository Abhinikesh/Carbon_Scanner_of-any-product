const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');
const uploadSingle = require('../middleware/upload');

// Protect all routes
router.use(protect);

// GET /api/scans/stats - Get stats aggregation
router.get('/stats', scanController.getScanStats);

// GET /api/scans/chart - Get chart data aggregation
router.get('/chart', scanController.getScanChart);

// GET /api/scans - List all scans for user
router.get('/', scanController.listScans);

// GET /api/scans/:id - Get single scan details
router.get('/:id', scanController.getScan);

// POST /api/scans - Upload scan (file or barcode JSON)
router.post('/', uploadSingle, scanController.createScan);

// PATCH /api/scans/:id/category - Update scan category and recalculate CO2
router.patch('/:id/category', scanController.updateScanCategory);

module.exports = router;
