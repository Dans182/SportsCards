const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_WIDTH = 900;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 0.78;

export function validateImageFile(file) {
  if (!file) {
    throw new Error('Select an image before continuing.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('The selected file is not an image.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('The image must be smaller than 5MB.');
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('The image could not be processed.'));
    };

    image.src = objectUrl;
  });
}

function getDimensions(width, height) {
  let nextWidth = width;
  let nextHeight = height;

  if (nextWidth > nextHeight && nextWidth > MAX_WIDTH) {
    nextHeight = Math.round((nextHeight * MAX_WIDTH) / nextWidth);
    nextWidth = MAX_WIDTH;
  }

  if (nextHeight >= nextWidth && nextHeight > MAX_HEIGHT) {
    nextWidth = Math.round((nextWidth * MAX_HEIGHT) / nextHeight);
    nextHeight = MAX_HEIGHT;
  }

  return { width: nextWidth, height: nextHeight };
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to generate a preview for the selected image.'));
    reader.readAsDataURL(blob);
  });
}

export async function prepareImageAsset(file) {
  validateImageFile(file);

  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  const dimensions = getDimensions(image.width, image.height);

  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  context.drawImage(image, 0, 0, dimensions.width, dimensions.height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
  });

  if (!blob) {
    throw new Error('The image could not be compressed.');
  }

  const previewUrl = await blobToDataUrl(blob);

  return {
    blob,
    previewUrl,
    fileName: file.name.replace(/\.[^.]+$/, '.jpg')
  };
}
