import { AWS_S3_BASE_URL } from "../constants";

/**
 * Get proper image URL
 * - If URL is absolute (starts with http/https), return as-is
 * - If URL is relative, prepend AWS_S3_BASE_URL
 * - If URL is empty/null, return placeholder
 */
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) {
    return "/placeholder.png";
  }
  
  // If already absolute URL (Cloudinary, etc.), use directly
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  
  // Otherwise, prepend S3 base URL
  return (AWS_S3_BASE_URL || "") + imageUrl;
};
