const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');
const uploadSingle = require('../middleware/upload');

// Protect all routes
router.use(protect);

// POST /api/scans - Upload scan (file or barcode JSON)
router.post('/', uploadSingle, scanController.createScan);

// GET /api/scans - List all scans for user
router.get('/', scanController.listScans);

// GET /api/scans/:id - Get single scan details
router.get('/:id', scanController.getScan);

module.exports = router;
