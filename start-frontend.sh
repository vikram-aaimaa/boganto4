#!/bin/bash

# Boganto Blog Frontend Startup Script
# This script starts the Next.js development server on port 5173

echo "Starting Boganto Blog Frontend (Next.js) on port 5173..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Node modules not found. Installing dependencies..."
    npm install
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please ensure frontend files are properly set up."
    exit 1
fi

# Kill any existing Node servers
echo "Checking for existing Node servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "Starting development server..."
echo "Frontend will be available at: http://localhost:5173"
echo "Make sure the backend is running on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "-----------------------------------"

# Start development server on port 5173
npm run dev