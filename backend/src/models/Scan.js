const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['product', 'receipt', 'flight', 'barcode'],
    required: true
  },
  originalFilename: {
    type: String
  },
  status: {
    type: String,
    enum: ['processing', 'ocr_done', 'failed'],
    default: 'processing'
  },
  rawText: {
    type: String,
    default: ''
  },
  barcodeValue: {
    type: String,
    default: null
  },
  parsedFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  errorMessage: {
    type: String,
    default: null
  },
  co2Kg: {
    type: Number,
    default: null
  },
  category: {
    type: String,
    default: null
  },
  score: {
    type: Number,
    default: null
  },
  manuallyCorrected: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scan', scanSchema);
