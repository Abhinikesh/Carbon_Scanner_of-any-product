/**
 * imageClassifier.js — STUB
 *
 * Client-side Transformers.js classification has been removed.
 * Product identification is now handled server-side by Gemini Vision
 * (gemini-1.5-flash) in scanController.js.
 *
 * These no-op exports are kept so any existing import statements don't
 * cause build errors during the transition.
 */

/** No-op: Gemini Vision runs on the backend now. */
export function warmUpClassifier() {
  // intentional no-op
}

/**
 * No-op: returns empty array. scanSubmission.js no longer calls this,
 * but the export is preserved for safety.
 * @returns {Promise<[]>}
 */
export async function classifyImage() {
  return [];
}
