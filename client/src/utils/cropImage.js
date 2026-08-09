function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (err) => reject(err));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

/**
 * Crops an image (given as an object URL) to the pixel area described by
 * `cropAreaPixels` (as provided by react-easy-crop's onCropComplete) and
 * returns the result as a Blob.
 */
export async function getCroppedImageBlob(imageSrc, cropAreaPixels, mimeType = 'image/jpeg') {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = cropAreaPixels.width;
  canvas.height = cropAreaPixels.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    cropAreaPixels.x,
    cropAreaPixels.y,
    cropAreaPixels.width,
    cropAreaPixels.height,
    0,
    0,
    cropAreaPixels.width,
    cropAreaPixels.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Le recadrage de l\'image a échoué.'));
        return;
      }
      resolve(blob);
    }, mimeType, 0.92);
  });
}
