// Re-export image utilities for backward compatibility
// Default images for the application
export const DEFAULT_IMAGES = {
  BLOG_BANNER: '/uploads/1758873063_a-book-1760998_1280.jpg',
  HERO_BANNER: '/uploads/1758801057_a-book-759873_640.jpg',
  ARTICLE_THUMBNAIL: '/uploads/1758801057_book-419589_640.jpg',
  BUILDING_LIBRARY: '/uploads/1758779936_a-book-1760998_1280.jpg'
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';