import api from './api';
import { convertPdfFirstPageToFile } from './pdfToImage';
import { decodeBarcodeFromFile } from './barcodeScanner';
import { classifyImage } from './imageClassifier';

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

      // For product scans only: run client-side AI image classification.
      // The resulting labels feed into the backend keyword matcher as extra
      // search text — they never bypass or replace the honest-null OCR logic.
      if (type === 'product') {
        try {
          const rawResults = await classifyImage(fileToUpload);

          // Keep only confident predictions (score >= 0.15), take top 3 labels
          const filteredLabels = rawResults
            .filter((r) => r.score >= 0.15)
            .slice(0, 3)
            .map((r) => r.label);

          if (filteredLabels.length > 0) {
            console.log('[scanSubmission] Sending aiLabels:', filteredLabels);
            formData.append('aiLabels', JSON.stringify(filteredLabels));
          }
          // If empty (model failure or low confidence), simply don't append the field.
        } catch (classifyErr) {
          // Classification failure must never block the scan — continue without labels
          console.warn('[scanSubmission] classifyImage error (ignored):', classifyErr?.message);
        }
      }

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
