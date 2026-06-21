const sharp = require('sharp');
const Tesseract = require('tesseract.js');

/**
 * Runs OCR on the provided image buffer.
 * Preprocesses the image using sharp to optimize OCR accuracy.
 *
 * NOTE: The first time this runs, tesseract.js downloads English trained data (.traineddata)
 * from a CDN automatically. This is normal and free, but it requires internet access
 * and might take a few extra seconds on the very first invocation. Subsequent runs use cached data.
 *
 * @param {Buffer} imageBuffer - The image file buffer.
 * @returns {Promise<{text: string, confidence: number}>} - OCR result with extracted text and confidence.
 */
async function runOCR(imageBuffer) {
  let processedBuffer = imageBuffer;

  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    let pipeline = image.grayscale().normalise();

    // Resize so the longer side is max 1600px if it exceeds 1600px
    const maxSide = 1600;
    if (metadata.width > maxSide || metadata.height > maxSide) {
      if (metadata.width > metadata.height) {
        pipeline = pipeline.resize({ width: maxSide });
      } else {
        pipeline = pipeline.resize({ height: maxSide });
      }
    }

    processedBuffer = await pipeline.toBuffer();
  } catch (err) {
    console.warn('[OCR Engine] Sharp preprocessing failed, falling back to original buffer:', err.message);
    processedBuffer = imageBuffer;
  }

  try {
    const { data: { text, confidence } } = await Tesseract.recognize(processedBuffer, 'eng');
    return {
      text: text || '',
      confidence: typeof confidence === 'number' ? confidence : 0
    };
  } catch (err) {
    console.error('[OCR Engine] Tesseract.recognize failed:', err.message);
    throw new Error('OCR processing failed');
  }
}

module.exports = { runOCR };
