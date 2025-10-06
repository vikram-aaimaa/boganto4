import axios from 'axios'

// API base URL with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Log the API base URL in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Using API base URL:', API_BASE_URL)
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Enable credentials for session cookies
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.method.toUpperCase(), config.baseURL + config.url)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Received response from:', response.config.url, 'Status:', response.status)
    return response.data
  },
  (error) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      // Clear any stored auth state and redirect to login
      import('./auth').then(({ authManager }) => {
        authManager.clearUser()
      })
    }
    
    console.error('API Error for URL:', error.config?.url)
    console.error('Status:', error.response?.status)
    console.error('Response data:', error.response?.data)
    console.error('Error message:', error.message)
    return Promise.reject(error.response?.data || error)
  }
)

// Blog API functions
export const blogAPI = {
  // Get all blogs with optional filters
  getBlogs: (params = {}) => {
    return api.get('/api/blogs', { params })
  },
  
  // Get single blog by slug
  getBlogBySlug: (slug) => {
    return api.get(`/api/blogs/slug/${slug}`)
  },
  
  // Get single blog by ID
  getBlogById: (id) => {
    console.log('Making API request for blog ID:', id);
    const url = `/api/blogs/${id}`;
    console.log('Full request URL:', API_BASE_URL + url);
    return api.get(url).then(response => {
      console.log('API response for blog:', response);
      if (!response || !response.blog) {
        throw new Error('Invalid blog response format');
      }
      return response;
    }).catch(error => {
      console.error('API error for blog:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    });
  },
  
  // Create new blog (admin)
  createBlog: (formData) => {
    return api.post('/api/admin/blogs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // Update blog (admin)
  updateBlog: (blogData) => {
    return api.put('/api/admin/blogs', blogData)
  },
  
  // Delete blog (admin)
  deleteBlog: (id) => {
    return api.delete(`/api/admin/blogs/${id}`)
  }
}

// Category API functions
export const categoryAPI = {
  // Get all categories
  getCategories: (params = {}) => {
    return api.get('/api/categories', { params })
  }
}

// Banner API functions
export const bannerAPI = {
  // Get banner images
  getBanners: () => {
    return api.get('/api/banner')
  }
}

// Utility functions
export const utils = {
  // Get full image URL
  getImageUrl: (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    // Handle both full paths and just filenames
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    return `${API_BASE_URL}/uploads/${imagePath.replace(/^.*[\/]/, '')}`;
  },

  // Format date
  formatDate: (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },
  
  // Generate excerpt
  generateExcerpt: (content, maxLength = 150) => {
    const text = content.replace(/<[^>]*>/g, '') // Remove HTML tags
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  },
  
  // Generate slug
  generateSlug: (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }
}

export default api