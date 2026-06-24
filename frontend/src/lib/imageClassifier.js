import { pipeline, env } from '@huggingface/transformers';

// Always fetch models from the Hugging Face Hub CDN — never look for local files.
env.allowLocalModels = false;

/**
 * Singleton promise: created once on first call, reused for every subsequent
 * classifyImage() call.  Holds a resolved ImageClassificationPipeline.
 * If pipeline creation fails, this is reset to null so the next page load
 * can retry (e.g., after a network timeout on first model download).
 */
let classifierPromise = null;

/**
 * Returns (and lazily creates) the singleton pipeline promise.
 * We try mobilevit-small first; if that fails we fall back to vit-base-patch16-224.
 */
function getClassifier() {
  if (classifierPromise) return classifierPromise;

  classifierPromise = (async () => {
    // Primary model: MobileViT-Small (~20 MB, fast in-browser)
    try {
      console.log('[imageClassifier] Loading Xenova/mobilevit-small …');
      const classifier = await pipeline(
        'image-classification',
        'Xenova/mobilevit-small'
      );
      console.log('[imageClassifier] Xenova/mobilevit-small loaded ✓');
      return classifier;
    } catch (primaryErr) {
      console.warn(
        '[imageClassifier] mobilevit-small failed, falling back to vit-base-patch16-224:',
        primaryErr?.message
      );
    }

    // Fallback model: ViT-Base patch16-224 (~330 MB, larger but very reliable)
    try {
      console.log('[imageClassifier] Loading Xenova/vit-base-patch16-224 …');
      const classifier = await pipeline(
        'image-classification',
        'Xenova/vit-base-patch16-224'
      );
      console.log('[imageClassifier] Xenova/vit-base-patch16-224 loaded ✓');
      return classifier;
    } catch (fallbackErr) {
      console.warn(
        '[imageClassifier] Both models failed to load:',
        fallbackErr?.message
      );
      // Reset so the next session can retry
      classifierPromise = null;
      throw fallbackErr;
    }
  })();

  return classifierPromise;
}

/**
 * Trigger the singleton pipeline creation early (fire-and-forget).
 * Call this when the Upload Center mounts or when the Quick Scan modal
 * reaches the 'select-file' step for product type.
 * Do NOT await — just warm the model in the background.
 */
export function warmUpClassifier() {
  getClassifier().catch(() => {
    // Silently swallow — classifyImage() will return [] gracefully
  });
}

/**
 * Classifies an image File, returning top-5 results as { label, score }[].
 * Returns an empty array if the model is unavailable or classification fails.
 * This must never throw — image classification failure must not block a scan.
 *
 * @param {File} file - The image file to classify
 * @returns {Promise<Array<{ label: string, score: number }>>}
 */
export async function classifyImage(file) {
  let objectUrl = null;
  try {
    const classifier = await getClassifier();
    objectUrl = URL.createObjectURL(file);
    const results = await classifier(objectUrl, { topk: 5 });
    console.log('[imageClassifier] Classification results:', results);
    return results;
  } catch (err) {
    console.warn('[imageClassifier] Classification failed:', err?.message);
    return [];
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
