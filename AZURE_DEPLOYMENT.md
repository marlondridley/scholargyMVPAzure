# 🚀 Azure App Service Deployment Guide

## Overview
This guide covers deploying the Scholargy MVP to Azure App Service with Node.js 22 LTS on Ubuntu.

## 📋 Prerequisites

### Azure Resources Required:
- **Azure App Service Plan**: B1 or higher (recommended)
- **Azure App Service**: Web App with Node.js 22 LTS runtime
- **Azure Database**: MongoDB Atlas or Azure Cosmos DB
- **Azure Redis Cache**: For session management and caching
- **Azure Search**: For RAG functionality (optional)

### Environment Variables:
```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# Redis Cache
REDIS_URL=your_redis_connection_string

# Azure OpenAI (for RAG)
AZURE_OPENAI_ENDPOINT=your_openai_endpoint
AZURE_OPENAI_API_KEY=your_openai_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# Azure Search (optional)
AZURE_SEARCH_ENDPOINT=your_search_endpoint
AZURE_SEARCH_API_KEY=your_search_api_key
AZURE_SEARCH_INDEX_NAME=scholargyindex

# App Configuration
NODE_ENV=production
PORT=8080
```

## 🔧 Deployment Steps

### 1. GitHub Actions Deployment (Recommended)

#### Setup GitHub Secrets:
1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Download from Azure Portal

#### Azure App Service Configuration:
1. Create App Service with Node.js 22 LTS
2. Set startup command: `npm start`
3. Configure environment variables in Azure Portal

### 2. Manual Deployment

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

# Set environment variables
az webapp config appsettings set --name scholargy-mvp-azure --resource-group scholargy-rg --settings NODE_ENV=production
```

#### Using Azure Portal:
1. Create App Service with Node.js 22 LTS runtime
2. Configure startup command: `npm start`
3. Set environment variables in Configuration → Application settings

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

## 🚨 Troubleshooting

### Common Issues:

1. **Port Configuration**:
   - Ensure `PORT` environment variable is set
   - Azure App Service uses port 8080 by default

2. **Node.js Version**:
   - Verify Node.js 22 LTS is selected in Azure Portal
   - Check `engines` field in package.json

3. **Environment Variables**:
   - Verify all required environment variables are set in Azure Portal
   - Check Application Settings in Azure Portal

4. **Build Issues**:
   - Ensure frontend builds successfully
   - Check `frontend/build` directory exists

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

### Deployment Success Indicators:
- ✅ GitHub Actions workflow completes successfully
- ✅ Application accessible at Azure URL
- ✅ API endpoints responding correctly
- ✅ Frontend loads without errors
- ✅ Database connections working
- ✅ RAG functionality operational (if configured)

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

**Last Updated**: August 2024
**Node.js Version**: 22.17.1 LTS
**Runtime**: Azure App Service (Linux) 