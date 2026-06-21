const express = require('express');
const router = express.Router();
const recycleController = require('../controllers/recycleController');
const { protect } = require('../middleware/authMiddleware');

// Protect all endpoints
router.use(protect);

// POST /api/recycle/lookup - Lookup disposal instructions
router.post('/lookup', recycleController.lookupDisposal);

// GET /api/recycle/geocode - Geocode address proxy to OSM Nominatim
router.get('/geocode', recycleController.geocodeAddress);

// GET /api/recycle/centers - Get nearby centers proxy to OSM Overpass
router.get('/centers', recycleController.findNearbyCenters);

module.exports = router;
