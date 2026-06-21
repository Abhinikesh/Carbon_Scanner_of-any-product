const Scan = require('../models/Scan');
const { runOCR } = require('../utils/ocrEngine');
const { parseFields } = require('../utils/parseScanText');

/**
 * Creates a scan (OCR image upload or Barcode value).
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

      const scan = await Scan.create({
        user: req.user.id,
        type,
        barcodeValue,
        status: 'ocr_done',
        parsedFields: {}
      });

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

      try {
        // Run OCR and parse text
        const ocrResult = await runOCR(req.file.buffer);
        const parsed = parseFields(type, ocrResult.text);

        // Update the scan document on success
        scan.rawText = ocrResult.text;
        scan.parsedFields = parsed;
        scan.status = 'ocr_done';
        await scan.save();

        return res.status(201).json(scan);
      } catch (ocrError) {
        // Update status to failed and save the error message
        scan.status = 'failed';
        scan.errorMessage = ocrError.message || 'OCR processing failed';
        await scan.save();

        return res.status(500).json({
          success: false,
          message: 'OCR processing failed',
          scanId: scan._id
        });
      }
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Lists all scans for the authenticated user, sorted by date descending.
 * Optional query parameter 'limit' to restrict output.
 *
 * @route GET /api/scans
 * @access Private
 */
async function listScans(req, res, next) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    let query = Scan.find({ user: req.user.id }).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(limit);
    }

    const scans = await query;
    return res.status(200).json(scans);
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

module.exports = {
  createScan,
  listScans,
  getScan
};
