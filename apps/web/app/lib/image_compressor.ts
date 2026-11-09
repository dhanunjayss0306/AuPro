/**
 * AuPro Client-Side Image Compression & Modern WebP Engine
 * 
 * Automatically downsizes large camera photos (e.g. 12MP-48MP iPhone/Android captures)
 * to crisp mobile-optimized web dimensions (max 1280px, WebP format with JPEG fallback).
 * 
 * Benefits:
 * 1. 25-35% smaller payload than JPEG for instant mobile uploads.
 * 2. Stays comfortably under Next.js 4.5MB payload cap.
 * 3. Prevents HTML5 localStorage 5MB quota crashes.
 * 4. Enables smooth rendering on budget phones without memory spikes.
 */

export async function compressImageFile(
  file: File,
  maxDimension: number = 1280,
  quality: number = 0.82
): Promise<string> {
  // If not an image, return empty
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image');
  }

  // If it's a GIF or SVG, don't rasterize, keep original vector/animation
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale maintaining aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw if canvas context is unavailable
          resolve(rawDataUrl);
          return;
        }

        // High quality bicubic image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP if supported by mobile browser, else fallback to JPEG
        let optimizedDataUrl = canvas.toDataURL('image/webp', quality);
        if (!optimizedDataUrl || !optimizedDataUrl.startsWith('data:image/webp')) {
          optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(optimizedDataUrl);
      };

      img.onerror = () => {
        // Fallback to raw data url if Image failed to load
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
