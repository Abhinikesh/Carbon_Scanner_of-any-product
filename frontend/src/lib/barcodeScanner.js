import { BrowserMultiFormatReader } from '@zxing/library';

/**
 * Decodes a barcode from an image File object client-side.
 *
 * @param {File} imageFile - The uploaded image file containing a barcode
 * @returns {Promise<string>} - A Promise resolving to the decoded barcode string
 * @throws {Error} - If no barcode is detected or decoding fails
 */
export async function decodeBarcodeFromFile(imageFile) {
  const codeReader = new BrowserMultiFormatReader();
  const imageUrl = URL.createObjectURL(imageFile);

  try {
    const result = await codeReader.decodeFromImageUrl(imageUrl);
    if (!result || !result.getText()) {
      throw new Error('No barcode text found');
    }
    return result.getText();
  } catch (error) {
    console.error('[barcodeScanner] Barcode decoding failed:', error);
    throw new Error('Could not detect a barcode in this image — try a clearer, closer photo');
  } finally {
    URL.revokeObjectURL(imageUrl);
    codeReader.reset();
  }
}
