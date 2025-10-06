# Boganto - Premium Bookstore Blog

A comprehensive full-stack blog website built with React, PHP, and MySQL, featuring responsive design, advanced filtering, and a user-friendly admin panel.

![Boganto Preview](/uploads/1758779936_a-book-1760998_1280.jpg)

## 🎯 Project Overview

**Boganto** is a modern, responsive blog website designed for book lovers and literary enthusiasts. It combines elegant design with powerful functionality to create an engaging reading experience.

### ✨ Key Features

- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **🎠 Auto-scroll Banner**: Interactive carousel with 4-5 featured articles
- **🗂️ Advanced Filtering**: 50+ categories with expandable filter system
- **📚 Rich Content**: Featured and latest articles with smart pagination
- **📖 Detailed Blog Pages**: Table of contents, social sharing, related books
- **⚙️ Admin Panel**: User-friendly content management system
- **🛒 Related Books**: External purchase links for book recommendations
- **🔍 Search Functionality**: Full-text search across all content
- **🏷️ Tag System**: Clickable tags for content discovery

## 🚀 Quick Start

### Prerequisites
- PHP 7.4+
- MySQL 5.7+
- Node.js 16+
- npm 7+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webapp
   ```

2. **Set up the database**
   ```sql
   CREATE DATABASE boganto_blog;
   mysql -u root -p boganto_blog < backend/database.sql
   ```

3. **Configure backend**
   ```bash
   # Edit backend/config.php with your database credentials
   ```

4. **Start the backend**
   ```bash
   ./start-backend.sh
   # Backend available at: http://localhost:8000
   ```

5. **Start the frontend**
   ```bash
   ./start-frontend.sh
   # Frontend available at: http://localhost:5173
   ```

## 🎨 Design & Technology

### Frontend Stack
- **React 19**: Modern UI library with hooks
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Lucide React**: Beautiful icon library
- **Vite**: Fast build tool and dev server

### Backend Stack
- **PHP 8**: Server-side scripting
- **MySQL**: Relational database
- **PDO**: Database abstraction layer
- **RESTful APIs**: Clean API architecture

### Key Design Elements
- **Color Palette**: Warm orange primary (#f97316) with navy accents
- **Typography**: Playfair Display (headings) + Inter (body)
- **Layout**: Card-based design with elegant shadows
- **Responsive**: Mobile-first approach with breakpoints

## 📋 Features in Detail

### 🏠 Homepage Features
- **Hero Banner**: Auto-scrolling carousel with manual controls
- **Category Filter**: Expandable sidebar with all categories
- **Featured Articles**: Highlighted content with "See More" functionality
- **Latest Articles**: Chronological content display
- **Sidebar**: Popular articles and latest updates

### 📄 Blog Detail Features
- **Breadcrumb Navigation**: Clear page hierarchy
- **Table of Contents**: Auto-generated from headings
- **Social Sharing**: Twitter, Facebook, LinkedIn integration
- **Related Books**: Purchase links with descriptions
- **Tag Navigation**: Clickable tags for content discovery
- **View Counter**: Article popularity metrics

### ⚙️ Admin Panel Features
- **Blog Management**: Create, edit, delete articles
- **Rich Text Editor**: HTML content support
- **Category System**: 50+ predefined categories
- **Tag Management**: Flexible tagging system
- **Image Upload**: Featured image handling
- **SEO Options**: Meta titles and descriptions
- **Status Control**: Draft, published, archived states
- **Related Books**: Dynamic book recommendations

## 🗂️ Project Structure

```
webapp/
├── 📁 frontend/           # React application
│   ├── 📁 src/
│   │   ├── 📁 components/ # Reusable UI components
│   │   ├── 📁 pages/      # Main page components
│   │   └── 📁 utils/      # API and utility functions
│   ├── 📁 public/         # Static assets
│   └── 📄 package.json    # Dependencies and scripts
├── 📁 backend/            # PHP API server
│   ├── 📄 config.php      # Database configuration
│   ├── 📄 getBlogs.php    # Blog retrieval API
│   ├── 📄 addBlog.php     # Blog management API
│   ├── 📄 getCategories.php # Categories API
│   └── 📄 database.sql    # Database schema
├── 📁 uploads/            # File storage
├── 📁 docs/               # Documentation
├── 📄 start-backend.sh    # Backend startup script
├── 📄 start-frontend.sh   # Frontend startup script
└── 📄 README.md           # This file
```

## 🌐 API Endpoints

### Blog APIs
- `GET /api/blogs` - List all blogs with filtering
- `GET /api/blogs/{id}` - Get specific blog by ID
- `GET /api/blogs/slug/{slug}` - Get blog by URL slug
- `POST /api/admin/blogs` - Create new blog
- `PUT /api/admin/blogs` - Update existing blog
- `DELETE /api/admin/blogs?id={id}` - Delete blog

### Category APIs
- `GET /api/categories` - List all categories with counts
- `GET /api/categories?limit=4` - Get limited categories

### Banner APIs
- `GET /api/banner` - Get carousel banner images

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile (< 768px)**: Single column layout
- **Tablet (768px - 1024px)**: Two column layout
- **Desktop (> 1024px)**: Full multi-column layout

### Mobile Optimizations
- Touch-friendly navigation
- Collapsible sidebar
- Optimized image sizes
- Smooth scrolling
- Gesture support

## 🔧 Configuration

### Frontend Configuration
```javascript
// vite.config.js - Development proxy
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

### Backend Configuration
```php
// config.php - Database settings
private $host = 'localhost';
private $db_name = 'boganto_blog';
private $username = 'root';
private $password = 'your_password';
```

## 🛡️ Security Features

- **SQL Injection Protection**: Prepared statements
- **XSS Prevention**: Input sanitization
- **File Upload Security**: Type and size validation
- **CORS Configuration**: Proper cross-origin handling
- **Error Handling**: Graceful error responses

## 📈 Performance Optimizations

### Frontend
- Code splitting with Vite
- Lazy loading for images
- Efficient component re-rendering
- Optimized bundle size

### Backend
- Database indexing
- Efficient SQL queries
- Image compression
- Caching headers

## 🚀 Deployment

### Production Build
```bash
# Frontend build
cd frontend && npm run build

# Backend deployment
# Copy backend files to web server
# Update database configuration
# Set proper file permissions
```

### Hosting Requirements
- **Web Server**: Apache/Nginx
- **PHP**: 7.4+ with PDO extension
- **MySQL**: 5.7+ database server
- **SSL**: HTTPS recommended

## 📊 Current Status

### ✅ Completed Features
- Responsive React frontend with TailwindCSS
- PHP backend with RESTful APIs
- MySQL database with comprehensive schema
- Admin panel for content management
- Category filtering system
- Blog detail pages with rich features
- Image upload and management
- Search functionality
- Social sharing integration

### 🚧 Recommended Next Steps
1. **SEO Optimization**: Add meta tags and structured data
2. **Performance**: Implement caching strategies
3. **Analytics**: Add Google Analytics integration
4. **Comments**: User comment system
5. **Newsletter**: Email subscription functionality
6. **RSS Feed**: XML feed generation
7. **PWA**: Progressive Web App features

## 🔗 URLs and Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:5173/admin
- **Documentation**: `/docs/setup.md`

## 📚 Category System

The platform supports 50+ categories including:
- Fiction, History, Science, Self-Help
- Children's Fiction & Nonfiction
- Business & Economics, Health & Fitness
- Technology & Engineering, Travel & Tourism
- And many more specialized categories

## 🎯 Target Audience

- Book enthusiasts and readers
- Literary bloggers and content creators
- Bookstore owners and managers
- Educational institutions
- Publishing companies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For setup assistance or technical questions:
- Check `/docs/setup.md` for detailed instructions
- Review API documentation in backend files
- Ensure all prerequisites are installed
- Verify database and server configurations

---

**🎨 Built with passion for book lovers and literary communities**

**📚 Boganto - Where stories come to life**