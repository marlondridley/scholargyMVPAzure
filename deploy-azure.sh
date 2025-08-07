#!/bin/bash

# Scholargy Azure App Service Deployment Script
# This script builds and deploys the application to Azure App Service

set -e  # Exit on any error

echo "🚀 Starting Scholargy deployment to Azure App Service..."

# Check if required environment variables are set
if [ -z "$AZURE_WEBAPP_NAME" ]; then
    echo "❌ Error: AZURE_WEBAPP_NAME environment variable is not set"
    echo "Please set it to your Azure App Service name"
    exit 1
fi

if [ -z "$AZURE_RESOURCE_GROUP" ]; then
    echo "❌ Error: AZURE_RESOURCE_GROUP environment variable is not set"
    echo "Please set it to your Azure resource group name"
    exit 1
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Error: Azure CLI is not installed"
    echo "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged into Azure
if ! az account show &> /dev/null; then
    echo "❌ Error: Not logged into Azure"
    echo "Please run: az login"
    exit 1
fi

echo "✅ Azure CLI is available and user is logged in"

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf frontend/build
rm -f deploy.zip

# Install dependencies
echo "📦 Installing root dependencies..."
npm ci

echo "📦 Installing frontend dependencies..."
cd frontend
npm ci

# Build frontend
echo "🔨 Building frontend..."
if [ -n "$REACT_APP_SUPABASE_URL" ] && [ -n "$REACT_APP_SUPABASE_ANON_KEY" ]; then
    echo "Using environment variables for frontend build"
    npm run build
else
    echo "⚠️ Warning: Supabase environment variables not set for frontend build"
    echo "Frontend will be built with default values"
    npm run build
fi

cd ..

echo "📦 Installing backend dependencies..."
cd backend
npm ci
cd ..

# Create deployment package
echo "📦 Creating deployment package..."
# Remove node_modules and other unnecessary files
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".git" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".github" -type d -exec rm -rf {} + 2>/dev/null || true

# Create zip package
zip -r deploy.zip . -x "*.git*" "*.github*" "deploy.zip" "node_modules/*" "frontend/node_modules/*"

echo "📦 Deployment package created: deploy.zip"

# Deploy to Azure App Service
echo "🚀 Deploying to Azure App Service..."
az webapp deployment source config-zip \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --name "$AZURE_WEBAPP_NAME" \
    --src deploy.zip

echo "✅ Deployment completed successfully!"

# Get the app URL
APP_URL=$(az webapp show --resource-group "$AZURE_RESOURCE_GROUP" --name "$AZURE_WEBAPP_NAME" --query "defaultHostName" -o tsv)
echo "🌐 Your application is available at: https://$APP_URL"

# Check deployment status
echo "🔍 Checking deployment status..."
sleep 10
if curl -f "https://$APP_URL" > /dev/null 2>&1; then
    echo "✅ Application is responding successfully!"
else
    echo "⚠️ Application may still be starting up. Please check the Azure Portal for logs."
fi

echo "🎉 Deployment completed! Please check the Azure Portal for any issues." 