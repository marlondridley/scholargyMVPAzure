#!/bin/bash

# This script runs on the Azure server from the /backend directory.

# Exit immediately if any command fails.
set -e

echo "--- Starting post-build script from /backend ---"

# 1. Navigate up to the root and into the frontend directory to build.
echo "Navigating to /frontend to build..."
cd /home/site/wwwroot/frontend
npm install
npm run build --if-present

# 2. Navigate back to the root.
cd /home/site/wwwroot

# 3. Move the built frontend files into the backend's public directory.
echo "Moving frontend build to backend/public..."
mkdir -p backend/public
cp -r frontend/build/* backend/public/

echo "--- Post-build script finished successfully! ---"