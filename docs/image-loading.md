# Blog Image Loading System

The blog system uses a combination of Next.js Image optimization and a dedicated backend image serving endpoint for secure and performant image delivery.

## Architecture

1. Image Storage
   - Images are stored in the `/uploads` directory on the backend
   - Each image has a unique filename with timestamp prefix

2. Image Serving 
   - Backend serves images through `server.php` route handler
   - Images are accessible via `/uploads/filename.jpg` route
   - Frontend constructs image URLs using the filename
   - Next.js Image component handles optimization

## Security

1. Image Access
   - Only files from `/uploads` directory are accessible
   - File extension validation enforced
   - MIME type checking implemented

2. Error Handling
   - Invalid images show fallback
   - Network errors gracefully handled
   - Empty images hidden

## Usage

1. Frontend
   ```jsx
   import Image from 'next/image'
   
   // Use getImageUrl helper for consistent URL generation
   const getImageUrl = (img) => {
     if (!img) return '';
     if (img.startsWith('http')) return img;
     return `http://localhost:8000/uploads/${img.replace(/^.*[\\/]/, '')}`;
   }

   // Use in components
   <Image 
     src={getImageUrl(blog.featured_image)}
     alt={blog.title}
     fill
     className="object-cover"
     onError={(e) => e.target.style.display = 'none'}
   />
   ```

2. Backend
   - Upload files to `/uploads`
   - Return relative path in API responses
   - Handle MIME types correctly