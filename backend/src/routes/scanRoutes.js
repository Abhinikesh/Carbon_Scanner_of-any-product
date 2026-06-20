const express = require('express');
const router = express.Router();
const { uploadScan, getScanHistory, getScan, deleteScan } = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');
const { scanLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, scanLimiter, upload.single('image'), uploadScan);
router.get('/history', protect, getScanHistory);
router.get('/:id', protect, getScan);
router.delete('/:id', protect, deleteScan);

module.exports = router;
