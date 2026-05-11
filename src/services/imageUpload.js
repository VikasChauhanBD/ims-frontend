/**
 * Image Upload Helper
 * Supports: Cloudinary (production) and Base64 (development)
 */

export const uploadImage = async (file, options = {}) => {
  if (!file) return null;

  const { allowBase64Fallback = true } = options;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Prefer Vercel Blob for device images when the upload endpoint is available.
  try {
    return await uploadToVercelBlob(file);
  } catch (error) {
    console.warn("Vercel Blob upload failed, falling back.", error);
  }

  // Use Cloudinary if configured
  if (cloudName && uploadPreset) {
    return await uploadToCloudinary(file, cloudName, uploadPreset);
  }

  if (!allowBase64Fallback) {
    throw new Error(
      "Image upload is not configured. Please enable Vercel Blob or Cloudinary.",
    );
  }

  // Fallback to base64 conversion for development
  return await convertToBase64(file);
};

/**
 * Upload to Vercel Blob via serverless API
 */
const uploadToVercelBlob = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/blob/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Upload failed");
  }

  const data = await response.json();
  if (!data?.url) throw new Error("Upload failed: missing url");
  return data.url;
};

/**
 * Upload to Cloudinary (Free tier, no backend needed)
 */
const uploadToCloudinary = async (file, cloudName, uploadPreset) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'ims-system/uploads');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url; // Cloudinary HTTPS URL
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Convert image to Base64 (for development/testing)
 * Note: Not recommended for production
 */
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  if (!file) return { valid: true };

  const maxSize = maxSizeMB * 1024 * 1024;
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, WebP, and GIF formats are supported',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

export default uploadImage;
