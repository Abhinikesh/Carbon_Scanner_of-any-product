const mongoose = require('mongoose');

const alternativeSchema = new mongoose.Schema({
  name: String,
  co2Reduction_percent: Number,
  reason: String,
});

const scanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['product', 'food', 'receipt', 'flight', 'barcode'],
      required: true,
    },
    uploadedImageUrl: { type: String, required: true },
    recognizedItem: {
      name: { type: String, default: 'Unknown' },
      category: { type: String, default: 'general' },
      weight: { type: Number, default: 1 },
      quantity: { type: Number, default: 1 },
      confidence: { type: Number, default: 0 },
    },
    co2Estimate: {
      value: { type: Number, default: 0 },
      unit: { type: String, default: 'kg CO2e' },
      source: { type: String, default: 'local_estimate' },
    },
    sustainabilityIndex: {
      score: { type: Number, default: 0 },
      label: { type: String, default: 'unknown' },
      color: { type: String, default: '#A8B2C1' },
    },
    alternatives: [alternativeSchema],
    rawAIResponse: { type: Object },
    aiFailed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scan', scanSchema);
