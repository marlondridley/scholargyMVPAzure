# Test Build Script for Azure Deployment
# This script tests the build process locally before deployment

Write-Host "🧪 Testing Azure deployment build process..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "❌ package.json not found. Please run this script from the project root."
    exit 1
}

# Check if frontend directory exists
if (-not (Test-Path "frontend")) {
    Write-Error "❌ frontend directory not found."
    exit 1
}

Write-Host "✅ Project structure looks good" -ForegroundColor Green

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Blue
if (Test-Path "public") {
    Remove-Item -Recurse -Force "public"
}
if (Test-Path "frontend/build") {
    Remove-Item -Recurse -Force "frontend/build"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ npm install failed"
    exit 1
}

# Test the build process
Write-Host "🔨 Testing Ubuntu build process..." -ForegroundColor Blue
npm run build:ubuntu

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Build failed"
    exit 1
}

# Check if public directory was created
if (-not (Test-Path "public")) {
    Write-Error "❌ public directory was not created"
    exit 1
}

# Check if index.html exists
if (-not (Test-Path "public/index.html")) {
    Write-Error "❌ index.html not found in public directory"
    exit 1
}

Write-Host "✅ Build test completed successfully!" -ForegroundColor Green
Write-Host "📁 Public directory contents:" -ForegroundColor Cyan
Get-ChildItem "public" | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }

Write-Host "`n🚀 Ready for Azure deployment!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\deploy-azure.ps1 -ResourceGroupName 'your-rg' -AppServiceName 'your-app'" -ForegroundColor White
Write-Host "2. Set environment variables in Azure" -ForegroundColor White
Write-Host "3. Deploy with: git push azure main" -ForegroundColor White
