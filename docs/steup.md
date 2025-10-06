# Boganto Blog Setup Guide

A comprehensive full-stack blog website built with React, PHP, and MySQL. This guide provides step-by-step instructions for setting up and running the application.

## 🎯 Project Overview

**Boganto** is a premium bookstore blog featuring:
- **Responsive Design**: Pixel-perfect implementation across desktop, tablet, and mobile
- **Auto-scroll Banner**: 4-5 image carousel with smooth transitions
- **Category Filtering**: Expandable category list with 50+ categories
- **Featured & Latest Articles**: Show/hide more functionality
- **Blog Detail Pages**: Table of contents, related books, social sharing
- **Admin Panel**: Non-technical friendly blog management
- **Related Books**: External purchase links for each blog post

## 📋 System Requirements

- **PHP**: 7.4 or higher
- **MySQL**: 5.7 or higher
- **Node.js**: 16.0 or higher
- **npm**: 7.0 or higher
- **Web Server**: Apache/Nginx (for production) or PHP built-in server (for development)

## 🚀 Quick Start

### 1. Database Setup

```sql
-- Create the database
CREATE DATABASE boganto_blog;

-- Import the schema
mysql -u root -p boganto_blog < backend/database.sql
```

### 2. Backend Configuration

Edit `backend/config.php` with your database credentials:

```php
private $host = 'localhost';
private $db_name = 'boganto_blog';
private $username = 'root';
private $password = 'your_password';
```

### 3. Start Backend Server

```bash
# Start PHP development server
./start-backend.sh

# Or manually:
cd backend
php -S localhost:8000 server.php
```

Backend will be available at: `http://localhost:8000`

### 4. Start Frontend Server

```bash
# Start React development server
./start-frontend.sh

# Or manually:
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 📁 Project Structure

```
webapp/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroBanner.jsx
│   │   │   ├── CategoryFilter.jsx
│   │   │   ├── BlogCard.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/           # Main page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── BlogDetailPage.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── utils/           # Utility functions
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/                  # PHP backend APIs
│   ├── config.php           # Database configuration
│   ├── getBlogs.php         # Blog retrieval API
│   ├── addBlog.php          # Blog management API
│   ├── getCategories.php    # Categories API
│   ├── getBanner.php        # Banner images API
│   ├── server.php           # Development server router
│   ├── database.sql         # Database schema
│   └── .htaccess           # Apache configuration
├── uploads/                  # File upload directory
├── docs/                     # Documentation
│   └── setup.md            # This file
├── assets/                   # Shared assets
├── start-backend.sh         # Backend startup script
├── start-frontend.sh        # Frontend startup script
├── .gitignore
└── README.md
```

## 🔧 Configuration Details

### Frontend Configuration

**Vite Configuration** (`frontend/vite.config.js`):
- Proxy setup for API calls to backend
- Build optimization settings
- Development server configuration

**Tailwind Configuration** (`frontend/tailwind.config.js`):
- Custom color palette (primary orange, navy blue)
- Custom fonts (Playfair Display, Inter)
- Extended theme configuration

**API Configuration** (`frontend/src/utils/api.js`):
- Base URL: `http://localhost:8000`
- Axios interceptors for error handling
- Utility functions for data formatting

### Backend Configuration

**Database Config** (`backend/config.php`):
- PDO connection with error handling
- CORS headers for React frontend
- File upload utilities

**API Endpoints**:
- `GET /api/blogs` - List blogs with filtering
- `GET /api/blogs/{id}` - Get blog by ID
- `GET /api/blogs/slug/{slug}` - Get blog by slug
- `GET /api/categories` - List all categories
- `GET /api/banner` - Get banner images
- `POST /api/admin/blogs` - Create new blog
- `PUT /api/admin/blogs` - Update existing blog
- `DELETE /api/admin/blogs?id={id}` - Delete blog

## 🎨 Design Features

### Responsive Breakpoints
- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (full layout)

### Color Scheme
- **Primary**: Orange (#f97316)
- **Secondary**: Navy Blue (#0f172a)
- **Background**: Light Gray (#f9fafb)
- **Text**: Dark Navy (#1e293b)

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Weight**: 300-700 available

## 📝 Content Management

### Admin Panel Features

Access the admin panel at: `http://localhost:5173/admin`

**Blog Management**:
- Create, edit, and delete blog posts
- Rich text content with HTML support
- Category selection from 50+ categories
- Tag management (comma-separated)
- Featured image upload
- Meta title and description
- Featured article toggle
- Status management (draft, published, archived)

**Related Books**:
- Add multiple related books per blog
- External purchase links
- Book descriptions and pricing
- Dynamic add/remove functionality

### Category System

The system includes 50+ predefined categories:
- Fiction, History, Science, Self-Help
- Children's Fiction/Nonfiction
- Business & Economics
- Health & Fitness
- Technology & Engineering
- And many more...

## 🔒 Security Considerations

### File Upload Security
- Restricted file types (images only)
- File size limits
- Secure filename generation
- Upload directory outside web root

### Database Security
- Prepared statements for all queries
- Input sanitization
- SQL injection prevention
- XSS protection

### CORS Configuration
- Proper CORS headers
- Origin validation
- Method restrictions

## 🚀 Deployment

### Production Deployment

**Frontend (Build for Production)**:
```bash
cd frontend
npm run build
# Deploy dist/ folder to web server
```

**Backend (Apache/Nginx)**:
```bash
# Copy backend files to web server
# Ensure proper .htaccess configuration
# Update database credentials
```

**Database**:
```bash
# Import schema to production database
mysql -u username -p production_db < backend/database.sql
```

### Environment Variables

Create `.env` files for production:

**Backend** (`.env`):
```
DB_HOST=production_host
DB_NAME=production_db
DB_USER=production_user
DB_PASS=production_password
```

## 🐛 Troubleshooting

### Common Issues

**Backend not starting**:
- Check PHP version: `php --version`
- Verify database credentials
- Ensure MySQL is running

**Frontend build errors**:
- Clear node_modules: `rm -rf node_modules && npm install`
- Update dependencies: `npm update`
- Check Node.js version: `node --version`

**Database connection failed**:
- Verify MySQL service is running
- Check database credentials in `config.php`
- Ensure database exists and is accessible

**CORS errors**:
- Verify backend is running on port 8000
- Check proxy configuration in `vite.config.js`
- Ensure proper CORS headers in backend

**File upload issues**:
- Check `uploads/` directory permissions
- Verify file size limits
- Ensure proper MIME type validation

### Performance Optimization

**Frontend**:
- Enable code splitting
- Optimize images
- Use lazy loading for components
- Implement service workers

**Backend**:
- Add database indexing
- Implement caching
- Optimize SQL queries
- Use CDN for static assets

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review the code comments for implementation details
- Ensure all dependencies are properly installed
- Verify configuration files are correctly set up

## 🔄 Updates and Maintenance

### Regular Maintenance
- Update dependencies regularly
- Monitor database performance
- Backup database regularly
- Review and update security measures
- Optimize images and assets

### Version Control
- Use Git for version control
- Create feature branches
- Regular commits with descriptive messages
- Tag releases appropriately

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Author**: Boganto Development Team