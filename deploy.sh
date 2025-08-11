#!/bin/bash

# Exit immediately if any command fails
set -e

echo "--- Starting post-build script from /backend ---"

# 1. Navigate to the frontend directory to build
FRONTEND_PATH="/home/site/wwwroot/frontend"
if [ -d "$FRONTEND_PATH" ]; then
    echo "Navigating to /frontend to build..."
    cd "$FRONTEND_PATH"
    npm install
    npm run build --if-present
else
    echo "⚠️ Frontend folder not found at $FRONTEND_PATH — skipping frontend build."
fi

# 2. Navigate back to the root
cd /home/site/wwwroot

# 3. Move the built frontend files into backend/public if they exist
BUILD_PATH="frontend/build"
if [ -d "$BUILD_PATH" ]; then
    echo "Moving frontend build to backend/public..."
    mkdir -p backend/public
    cp -r $BUILD_PATH/* backend/public/
else
    echo "⚠️ No frontend build found at $BUILD_PATH — skipping copy."
fi

echo "--- Post-build script finished successfully! ---"
