#!/bin/bash

echo "🚀 Deploying Scholargy MVP to Azure App Service..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
cd frontend && npm ci && cd ..
cd backend && npm ci && cd ..

# Build frontend
echo "🔨 Building frontend..."
cd frontend && npm run build && cd ..

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deploy
cp -r backend deploy/
cp -r frontend/build deploy/frontend/
cp package*.json deploy/
cp startup.js deploy/
cp web.config deploy/

echo "✅ Deployment package ready!"
echo "📁 Contents of deploy directory:"
ls -la deploy/

echo "🚀 Ready for Azure App Service deployment!" 