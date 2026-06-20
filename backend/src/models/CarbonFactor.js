const mongoose = require('mongoose');

const carbonFactorSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    item: { type: String, required: true },
    emissionFactor: { type: Number, required: true },
    unit: { type: String, default: 'kg CO2e per kg' },
    source: { type: String, default: 'local_estimate' },
    region: { type: String, default: 'global' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CarbonFactor', carbonFactorSchema);
