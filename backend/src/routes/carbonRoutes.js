const express = require('express');
const router = express.Router();
const { getFactors, compareItems } = require('../controllers/carbonController');

router.get('/factors', getFactors);
router.get('/compare', compareItems);

module.exports = router;
