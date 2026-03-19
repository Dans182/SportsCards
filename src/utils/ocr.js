const TESSERACT_SCRIPT_ID = 'tesseract-js-cdn';
const TESSERACT_CDN_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

function injectScript() {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(TESSERACT_SCRIPT_ID);

    if (existing && window.Tesseract) {
      resolve(window.Tesseract);
      return;
    }

    if (existing) {
      existing.addEventListener('load', () => resolve(window.Tesseract), { once: true });
      existing.addEventListener('error', () => reject(new Error('The OCR engine failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TESSERACT_SCRIPT_ID;
    script.src = TESSERACT_CDN_URL;
    script.async = true;
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error('The OCR engine failed to load.'));
    document.body.appendChild(script);
  });
}

export async function recognizeCardText(imageSource, onProgress) {
  const Tesseract = await injectScript();

  if (!Tesseract?.recognize) {
    throw new Error('Tesseract is not available in this environment.');
  }

  const result = await Tesseract.recognize(imageSource, 'eng', {
    logger: (message) => {
      if (message.status === 'recognizing text' && typeof onProgress === 'function') {
        onProgress(Math.round((message.progress || 0) * 100));
      }
    }
  });

  return result?.data?.text || '';
}
