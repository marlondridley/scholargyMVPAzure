#!/bin/bash

# This script runs on the Azure server after the backend is built.

# Exit immediately if any command fails
set -e

echo "--- Starting post-build script ---"

# 1. Build the frontend
echo "Navigating to frontend directory to build..."
cd ../frontend
npm install
npm run build
cd ..

# 2. Move the built frontend files to the backend's public directory
echo "Moving frontend build to backend/public..."
mkdir -p backend/public
cp -r frontend/build/* backend/public/

echo "--- Post-build script finished successfully! ---"