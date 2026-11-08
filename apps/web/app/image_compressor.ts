/**
 * AuPro Client-Side Image Compression & Downscaling Engine
 * 
 * Automatically downsizes large camera photos (e.g. 12MP-48MP iPhone/Android captures)
 * to crisp mobile-optimized web dimensions (max 1200px, 85% JPEG).
 * 
 * Prevents:
 * 1. Next.js 4.5MB payload exceeded errors.
 * 2. HTML5 localStorage 5MB quota exceeded crashes.
 * 3. Mobile network upload freezes and high latency.
 */

export async function compressImageFile(
  file: File,
  maxDimension: number = 1280,
  quality: number = 0.85
): Promise<string> {
  // If not an image, return empty
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image');
  }

  // If it's a GIF or SVG, don't rasterize to JPEG, keep as-is
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

        // Export as optimized JPEG
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
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
