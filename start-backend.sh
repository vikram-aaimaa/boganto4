#!/bin/bash

# Boganto Blog Backend Startup Script
# This script starts the PHP development server for the backend

echo "Starting Boganto Blog Backend..."

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "Error: PHP is not installed or not in PATH"
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if config.php exists
if [ ! -f "config.php" ]; then
    echo "Error: config.php not found. Please ensure backend files are properly set up."
    exit 1
fi

# Kill any existing PHP server on port 8000
echo "Checking for existing PHP server on port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start PHP built-in server
echo "Starting PHP server on http://localhost:8000"
echo "Backend will be available at: http://localhost:8000"
echo "API endpoints:"
echo "  - GET /api/blogs - List all blogs"
echo "  - GET /api/blogs/{id} - Get blog by ID"
echo "  - GET  /{slug} - Get blog by slug"
echo "  - GET /api/categories - List all categories"
echo "  - GET /api/banner - Get banner images"
echo "  - POST /api/admin/blogs - Create new blog"
echo "  - PUT /api/admin/blogs - Update blog"
echo "  - DELETE /api/admin/blogs?id={id} - Delete blog"
echo ""
echo "Press Ctrl+C to stop the server"
echo "-----------------------------------"

php -S localhost:8000 server.php