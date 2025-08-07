# 🚀 Azure App Service Deployment Guide for Scholargy

## Overview
This guide covers deploying the Scholargy MVP to Azure App Service with environment variables configured through Azure App Settings.

## 📋 Prerequisites

### Azure Resources Required:
- **Azure App Service Plan**: B1 or higher (recommended)
- **Azure App Service**: Web App with Node.js 22 LTS runtime
- **Azure Cosmos DB**: For user profiles and application data
- **Azure Redis Cache**: For session management and caching (optional)
- **Azure OpenAI**: For AI-powered features
- **Supabase**: For authentication

### Environment Variables (App Settings):
Configure these in Azure Portal → App Service → Configuration → Application settings:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Configuration
COSMOS_DB_CONNECTION_STRING=your_cosmos_db_connection_string
DB_NAME=scholargy-db

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_openai_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME=text-embedding-ada-002

# Frontend Environment Variables
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional Redis Configuration
AZURE_REDIS_CONNECTION_STRING=your_redis_connection_string

# App Configuration
NODE_ENV=production
PORT=8080
```

## 🔧 Azure App Service Configuration

### 1. Create Azure App Service

#### Using Azure CLI:
```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name scholargy-rg --location eastus

# Create App Service Plan
az appservice plan create --name scholargy-plan --resource-group scholargy-rg --sku B1 --is-linux

# Create Web App
az webapp create --name scholargy-mvp-azure --resource-group scholargy-rg --plan scholargy-plan --runtime "NODE|22-lts"

# Configure startup command
az webapp config set --name scholargy-mvp-azure --resource-group scholargy-rg --startup-file "npm start"
```

#### Using Azure Portal:
1. Go to Azure Portal → App Services → Create
2. Select "Web App"
3. Choose Node.js 22 LTS runtime
4. Select B1 or higher SKU
5. Configure startup command: `npm start`

### 2. Configure Environment Variables (App Settings)

#### Using Azure CLI to set App Settings:
```bash
# Set required environment variables
az webapp config appsettings set --name scholargy-mvp-azure --resource-group scholargy-rg --settings \
  SUPABASE_URL="https://your-project.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="your_service_role_key" \
  COSMOS_DB_CONNECTION_STRING="your_cosmos_db_connection_string" \
  DB_NAME="scholargy-db" \
  AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/" \
  AZURE_OPENAI_API_KEY="your_openai_api_key" \
  AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o" \
  AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME="text-embedding-ada-002" \
  REACT_APP_SUPABASE_URL="https://your-project.supabase.co" \
  REACT_APP_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Set optional Redis configuration
az webapp config appsettings set --name scholargy-mvp-azure --resource-group scholargy-rg --settings \
  AZURE_REDIS_CONNECTION_STRING="your_redis_connection_string"
```

## 🚀 Deployment Methods

### Method 1: GitHub Actions (Recommended)

#### 1. Create GitHub Secrets:
Go to your GitHub repository → Settings → Secrets and variables → Actions
Add these secrets:
- `AZURE_WEBAPP_PUBLISH_PROFILE`: Download from Azure Portal
- `AZURE_WEBAPP_NAME`: Your app service name
- `AZURE_WEBAPP_URL`: Your app service URL
- `REACT_APP_SUPABASE_URL`: Supabase URL for frontend build
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anon key for frontend build

### Method 2: Manual Deployment

#### 1. Build the Application:
```bash
# Install dependencies
npm ci
cd frontend && npm ci && cd ..

# Build frontend
cd frontend
npm run build
cd ..
```

#### 2. Deploy to Azure:
```bash
# Create deployment package
zip -r deploy.zip . -x "node_modules/*" "frontend/node_modules/*" ".git/*"

# Deploy to Azure App Service
az webapp deployment source config-zip --resource-group scholargy-rg --name scholargy-mvp-azure --src deploy.zip
```



## 📁 Application Structure

```
scholargy-mvp-azure/
├── backend/           # Express.js API server
├── frontend/          # React.js application
├── frontend/build/    # Built React app (served by Azure)
├── startup.js         # Azure startup script
├── web.config         # IIS configuration (Windows)
├── package.json       # Root package.json
└── .deployment        # Azure deployment config
```

## 🔄 Deployment Process

### GitHub Actions Workflow:
1. **Checkout**: Clone repository
2. **Setup Node.js 22**: Install Node.js 22 LTS
3. **Install Dependencies**: Install all npm packages
4. **Build Frontend**: Build React application
5. **Prepare Package**: Create deployment package
6. **Deploy**: Deploy to Azure App Service

### Manual Deployment:
```bash
# Run deployment script
chmod +x deploy-azure.sh
./deploy-azure.sh

# Deploy to Azure
az webapp deployment source config-zip --resource-group scholargy-rg --name scholargy-mvp-azure --src deploy.zip
```

## 🛠️ Configuration Files

### web.config (IIS Configuration)
- Routes API requests to backend
- Serves static files from frontend/build
- Handles React routing

### startup.js (Node.js Startup)
- Initializes backend server
- Sets environment variables
- Handles graceful shutdown

### .deployment
- Configures Azure deployment command

## 🔍 Monitoring & Logging

### Azure Application Insights:
```bash
# Enable Application Insights
az monitor app-insights component create --app scholargy-insights --location eastus --resource-group scholargy-rg --application-type web
```

### Log Streaming:
```bash
# Stream application logs
az webapp log tail --name scholargy-mvp-azure --resource-group scholargy-rg
```

## 🚨 Common Issues and Solutions

### 1. Environment Variable Issues:
**Problem**: Application fails to start due to missing environment variables
**Solution**: 
- Verify all required app settings are configured in Azure Portal
- Check that variable names match exactly (case-sensitive)
- Restart the app service after adding new settings

### 2. Build Failures:
**Problem**: Frontend build fails during deployment
**Solution**:
- Ensure all frontend dependencies are installed
- Check that build script exists in `frontend/package.json`
- Verify Node.js version compatibility

### 3. Database Connection Issues:
**Problem**: Application can't connect to Cosmos DB
**Solution**:
- Verify `COSMOS_DB_CONNECTION_STRING` is correct
- Check that `DB_NAME` is set
- Ensure Cosmos DB is accessible from App Service

### 4. Authentication Issues:
**Problem**: Supabase authentication not working
**Solution**:
- Verify Supabase URL and keys are correct
- Check that both frontend and backend Supabase variables are set
- Ensure Supabase project is properly configured

### Debug Commands:
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List installed packages
npm ls --depth=0

# Test startup script
node startup.js
```

## 📊 Performance Optimization

### Azure App Service Recommendations:
1. **Use B1 or higher SKU** for better performance
2. **Enable Application Insights** for monitoring
3. **Configure auto-scaling** based on CPU/memory
4. **Use Azure CDN** for static assets
5. **Enable compression** for better response times

### Node.js Optimization:
1. **Set NODE_ENV=production**
2. **Use PM2** for process management (optional)
3. **Enable gzip compression**
4. **Optimize database connections**

## 🔐 Security

### Azure Security Features:
1. **HTTPS Only**: Enable in Azure Portal
2. **Authentication**: Configure Azure AD if needed
3. **Network Security**: Use VNet integration if required
4. **Secrets Management**: Use Azure Key Vault for sensitive data

### Application Security:
1. **Environment Variables**: Store secrets in Azure App Settings
2. **CORS Configuration**: Configure in backend/server.js
3. **Input Validation**: Implement in API routes
4. **Rate Limiting**: Consider implementing

## 📈 Scaling

### Horizontal Scaling:
```bash
# Scale to multiple instances
az appservice plan update --name scholargy-plan --resource-group scholargy-rg --sku S1
```

### Auto-scaling Rules:
1. **CPU-based**: Scale when CPU > 70%
2. **Memory-based**: Scale when memory > 80%
3. **Time-based**: Scale during peak hours

## 🎯 Success Metrics

### Deployment Success:
- ✅ Application starts without errors
- ✅ All API endpoints responding
- ✅ Frontend loads correctly
- ✅ Authentication working
- ✅ Database operations successful
- ✅ AI features functional

### Performance Metrics:
- **Response Time**: < 2 seconds for API calls
- **Uptime**: > 99.9%
- **Error Rate**: < 1%
- **Memory Usage**: < 80% of allocated memory

## 📞 Support

For deployment issues:
1. Check Azure App Service logs
2. Verify environment variables
3. Test locally with same configuration
4. Review GitHub Actions workflow logs

---

**Last Updated**: December 2024
**Node.js Version**: 22.17.1 LTS
**Runtime**: Azure App Service (Linux)
**Environment**: Production with Azure App Settings 