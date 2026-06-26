import api from './api';
import { convertPdfFirstPageToFile } from './pdfToImage';
import { decodeBarcodeFromFile } from './barcodeScanner';

/**
 * Handles the preparation and backend submission of a scan (Product, Receipt, Flight, or Barcode).
 *
 * @param {Object} params
 * @param {string} params.type - 'product' | 'receipt' | 'flight' | 'barcode'
 * @param {File} [params.file] - The uploaded file (image or PDF)
 * @param {string} [params.barcodeValueOverride] - Override barcode value (skip decoding)
 * @returns {Promise<{ success: boolean, scan?: Object, newBadges?: Array, error?: string }>}
 */
export async function submitScan({ type, file, barcodeValueOverride }) {
  try {
    let response;

    if (type === 'barcode') {
      let barcodeValue = barcodeValueOverride;
      if (!barcodeValue) {
        if (!file) {
          return { success: false, error: 'No file provided for barcode decoding' };
        }
        try {
          barcodeValue = await decodeBarcodeFromFile(file);
        } catch (decodeError) {
          return { success: false, error: decodeError.message };
        }
      }

      response = await api.post('/scans', {
        type: 'barcode',
        barcodeValue: barcodeValue.trim()
      });
    } else {
      if (!file) {
        return { success: false, error: 'No file provided for upload' };
      }

      let fileToUpload = file;
      if (fileToUpload.type === 'application/pdf') {
        fileToUpload = await convertPdfFirstPageToFile(fileToUpload);
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('type', type);

      // File + type are all the backend needs — Gemini Vision identifies the product server-side.
      response = await api.post('/scans', formData);
    }

    if (response && response.data && response.data.success) {
      return {
        success: true,
        scan: response.data.scan,
        newBadges: response.data.newBadges || []
      };
    } else if (response && response.data) {
      // Handles cases where backend returns 200/201 but success: false
      return {
        success: false,
        error: response.data.message || 'Something went wrong processing this scan.'
      };
    } else {
      return {
        success: false,
        error: 'Something went wrong processing this scan.'
      };
    }
  } catch (err) {
    console.error('[scanSubmission] API error:', err);
    const errorMsg = err.response?.data?.message || err.message || 'Something went wrong processing this scan.';
    return {
      success: false,
      error: errorMsg
    };
  }
}
