import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker source using Vite-compatible asset URL resolver
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Converts the first page of a PDF File object to a PNG File object.
 *
 * @param {File} pdfFile - The uploaded PDF File object
 * @returns {Promise<File>} - A Promise resolving to a PNG File object containing the rendered first page
 */
export async function convertPdfFirstPageToFile(pdfFile) {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    if (pdf.numPages < 1) {
      throw new Error('PDF file has no pages');
    }

    // Get page 1
    const page = await pdf.getPage(1);

    // Set scale to 2 for crisp OCR text recognition
    const scale = 2;
    const viewport = page.getViewport({ scale });

    // Create an offscreen canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    // Render the page contents into the canvas context
    await page.render(renderContext).promise;

    // Convert the canvas to a PNG Blob and wrap in a File object
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error('Failed to render PDF page onto canvas blob'));
        }
        const convertedFile = new File([blob], 'converted.png', {
          type: 'image/png'
        });
        resolve(convertedFile);
      }, 'image/png');
    });
  } catch (error) {
    console.error('[pdfToImage] Error converting PDF to image:', error);
    throw new Error(`PDF conversion failed: ${error.message}`);
  }
}
