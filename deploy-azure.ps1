# Azure App Service Environment Deployment Script
# This script deploys the Scholargy MVP application to Azure App Service Environment

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$AppServiceName,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US",
    
    [Parameter(Mandatory=$false)]
    [string]$NodeVersion = "18.17.0"
)

Write-Host "🚀 Starting Azure App Service Environment Deployment..." -ForegroundColor Green

# Check if Azure CLI is installed
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

# Check if user is logged in
$account = az account show 2>$null
if (-not $account) {
    Write-Host "Please log in to Azure..." -ForegroundColor Yellow
    az login
}

# Create resource group if it doesn't exist
Write-Host "📦 Creating/checking resource group: $ResourceGroupName" -ForegroundColor Blue
az group create --name $ResourceGroupName --location $Location --output none

# Create App Service Plan (Linux)
Write-Host "📋 Creating App Service Plan..." -ForegroundColor Blue
az appservice plan create `
    --name "$AppServiceName-plan" `
    --resource-group $ResourceGroupName `
    --sku B1 `
    --is-linux `
    --output none

# Create Web App
Write-Host "🌐 Creating Web App..." -ForegroundColor Blue
az webapp create `
    --name $AppServiceName `
    --resource-group $ResourceGroupName `
    --plan "$AppServiceName-plan" `
    --runtime "NODE|18-lts" `
    --output none

# Configure Node.js version
Write-Host "⚙️ Configuring Node.js version..." -ForegroundColor Blue
az webapp config appsettings set `
    --name $AppServiceName `
    --resource-group $ResourceGroupName `
    --settings WEBSITE_NODE_DEFAULT_VERSION=$NodeVersion `
    --output none

# Configure startup command (PM2 for production)
Write-Host "🔧 Configuring startup command..." -ForegroundColor Blue
az webapp config set `
    --name $AppServiceName `
    --resource-group $ResourceGroupName `
    --startup-file "pm2 start ecosystem.config.js --no-daemon" `
    --output none

# Enable continuous deployment from local git
Write-Host "📤 Setting up deployment..." -ForegroundColor Blue
az webapp deployment source config-local-git `
    --name $AppServiceName `
    --resource-group $ResourceGroupName `
    --output none

# Get the git remote URL
$gitUrl = az webapp deployment source config-local-git `
    --name $AppServiceName `
    --resource-group $ResourceGroupName `
    --query url `
    --output tsv

Write-Host "✅ Deployment setup complete!" -ForegroundColor Green
Write-Host "🌐 Your app will be available at: https://$AppServiceName.azurewebsites.net" -ForegroundColor Cyan
Write-Host "📤 Git remote URL: $gitUrl" -ForegroundColor Cyan

Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Add the git remote: git remote add azure $gitUrl" -ForegroundColor White
Write-Host "2. Deploy: git add . && git commit -m 'Deploy to Azure' && git push azure main" -ForegroundColor White
Write-Host "3. Set environment variables in Azure Portal or using Azure CLI" -ForegroundColor White
Write-Host "4. Azure will automatically run: npm install && npm run build:azure" -ForegroundColor White
