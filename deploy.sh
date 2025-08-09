#!/bin/bash
# This script uses absolute paths for maximum reliability on Azure.

# Exit immediately if any command fails.
set -e

echo "--- Starting post-build script ---"

# Define the root directory for the application.
APP_ROOT="/home/site/wwwroot"

# 1. Build the frontend using its absolute path.
echo "Building frontend at ${APP_ROOT}/frontend..."
cd "${APP_ROOT}/frontend"
npm install
npm run build --if-present

# 2. Return to the root directory.
cd "${APP_ROOT}"

# 3. Move the built frontend files to the backend's public directory.
echo "Moving frontend build to ${APP_ROOT}/backend/public..."
mkdir -p "${APP_ROOT}/backend/public"
cp -r "${APP_ROOT}/frontend/build/"* "${APP_ROOT}/backend/public/"

echo "--- Post-build script finished successfully! ---"