# Azure App Service Environment Deployment Guide

This guide explains how to deploy the Scholargy MVP application to Azure App Service Environment with Ubuntu.

## Project Structure

```
scholargyMVPAzure/
├── package.json              # Consolidated package.json for both frontend and backend
├── server.js                 # Main Express.js server
├── web.config               # IIS configuration for Azure
├── .deployment              # Azure deployment configuration
├── deploy-azure.ps1         # PowerShell deployment script
├── public/                  # Frontend build output (created during build)
├── frontend/                # React frontend application
│   ├── package.json         # Frontend dependencies
│   ├── src/                 # React source code
│   └── public/              # Frontend static assets
├── routes/                  # Backend API routes
├── services/                # Backend business logic
├── middleware/              # Express middleware
└── utils/                   # Utility functions
```

## Prerequisites

1. **Azure CLI** installed and configured
2. **Node.js 18+** installed locally
3. **Git** for version control
4. **PowerShell** (for Windows deployment script)

## Quick Deployment

### 1. Run the Deployment Script

```powershell
# Navigate to the project root
cd scholargyMVPAzure

# Run the deployment script
.\deploy-azure.ps1 -ResourceGroupName "scholargy-rg" -AppServiceName "scholargy-app"
```

### 2. Set Up Git Remote

```bash
# Add Azure git remote (URL will be provided by the deployment script)
git remote add azure <git-url-from-script>

# Deploy (Azure will handle the build automatically)
git add .
git commit -m "Deploy to Azure"
git push azure main
```

## Manual Deployment Steps

### 1. Create Azure Resources

```bash
# Create resource group
az group create --name scholargy-rg --location "East US"

# Create App Service Plan (Linux)
az appservice plan create \
  --name scholargy-plan \
  --resource-group scholargy-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name scholargy-app \
  --resource-group scholargy-rg \
  --plan scholargy-plan \
  --runtime "NODE|18-lts"
```

### 2. Configure App Settings

```bash
# Set Node.js version
az webapp config appsettings set \
  --name scholargy-app \
  --resource-group scholargy-rg \
  --settings WEBSITE_NODE_DEFAULT_VERSION=18.17.0

# Set startup command (PM2 for production)
az webapp config set \
  --name scholargy-app \
  --resource-group scholargy-rg \
  --startup-file "pm2 start ecosystem.config.js --no-daemon"
```

### 3. Configure Environment Variables

See the "Environment Variables" section below for detailed instructions on setting up environment variables.

### 4. Deploy the Application

```bash
# Enable local git deployment
az webapp deployment source config-local-git \
  --name scholargy-app \
  --resource-group scholargy-rg

# Get the git URL
gitUrl=$(az webapp deployment source config-local-git \
  --name scholargy-app \
  --resource-group scholargy-rg \
  --query url \
  --output tsv)

# Add remote and deploy
git remote add azure $gitUrl
git add .
git commit -m "Deploy to Azure"
git push azure main
```

## Azure App Service & Oryx Build Process

Azure App Service uses Oryx for automated build processes. The build sequence is:

1. **Oryx Detection**: Automatically detects Node.js runtime
2. **Pre-build Script**: Runs if `PRE_BUILD_SCRIPT_PATH` is set
3. **npm install**: Installs all dependencies (including devDependencies)
4. **npm run build**: Runs if `build` script exists in package.json
5. **npm run build:azure**: Runs if `build:azure` script exists in package.json
6. **Post-build Script**: Runs if `POST_BUILD_SCRIPT_PATH` is set
7. **PM2 Startup**: Starts the app with PM2 process manager

### Build Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm run build:frontend && npm run copy-frontend",
    "build:azure": "npm run build:frontend && npm run copy-frontend",
    "build:frontend": "cd frontend && npm install && npm run build",
    "copy-frontend": "shx cp -r frontend/build/* public/",
    "postinstall": "npm run build:frontend && npm run copy-frontend"
  }
}
```



## Server Configuration

The `server.js` is configured to:

1. **Serve API routes** under `/api/*`
2. **Serve static files** from the `public/` directory
3. **Handle URL rewrites** for Azure App Service Linux
4. **Fallback to React app** for client-side routing
5. **Handle health checks** at `/health`

### URL Rewrites for Azure App Service Linux

Since Azure App Service for Linux doesn't use IIS, URL rewrites are handled directly in the Node.js application using `express-urlrewrite`:

```javascript
// API routes
app.use(rewrite('/api/*', '/api/$1'));

// Static assets
app.use(rewrite('/static/*', '/static/$1'));
app.use(rewrite('/js/*', '/js/$1'));
app.use(rewrite('/css/*', '/css/$1'));

// React Router paths
app.use(rewrite('/dashboard', '/'));
app.use(rewrite('/profile', '/'));
app.use(rewrite('/scholarships', '/'));
// ... other React routes
```

## Web.config Configuration (Windows Only)

The `web.config` file configures IIS for Windows deployments:

1. **Route API requests** to Node.js
2. **Serve static files** directly
3. **Handle React routing** with fallback to `index.html`

**Note**: For Azure App Service Linux (Ubuntu), URL rewrites are handled by the Node.js application using `express-urlrewrite` middleware instead of IIS configuration.

## Environment Variables

Azure App Service environment variables are accessed using standard Node.js `process.env` pattern:

```javascript
// Access environment variables
const nodeEnv = process.env.NODE_ENV;
const port = process.env.PORT || 8080;
const mongoUri = process.env.MONGODB_URI;
```

### Backend Variables
- `NODE_ENV`: Set to `production`
- `PORT`: Server port (default: 8080)
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY`: Azure OpenAI API key

### Frontend Variables
- `REACT_APP_SUPABASE_URL`: Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth client ID

### Setting Environment Variables

Set environment variables in Azure Portal or via Azure CLI:

```bash
az webapp config appsettings set \
  --name scholargy-app \
  --resource-group scholargy-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    MONGODB_URI="your-mongodb-connection-string" \
    REDIS_URL="your-redis-connection-string" \
    SUPABASE_URL="your-supabase-url" \
    SUPABASE_ANON_KEY="your-supabase-anon-key" \
    OPENAI_API_KEY="your-openai-api-key" \
    AZURE_OPENAI_ENDPOINT="your-azure-openai-endpoint" \
    AZURE_OPENAI_API_KEY="your-azure-openai-key" \
    REACT_APP_SUPABASE_URL="your-supabase-url" \
    REACT_APP_SUPABASE_ANON_KEY="your-supabase-anon-key" \
    REACT_APP_API_URL="https://scholargy-app.azurewebsites.net" \
    REACT_APP_GOOGLE_CLIENT_ID="your-google-client-id"
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version compatibility
2. **Environment Variables**: Ensure all required variables are set
3. **CORS Issues**: Verify CORS configuration in `server.js`
4. **Static File Serving**: Check `public/` directory exists and contains build files

### Logs

View application logs in Azure Portal:
1. Go to your App Service
2. Navigate to "Log stream"
3. Monitor real-time logs

### Health Check

Test the application health:
```bash
curl https://your-app-name.azurewebsites.net/health
```

## Monitoring

- **Application Insights**: Enable for detailed monitoring
- **Log Analytics**: Configure for centralized logging
- **Azure Monitor**: Set up alerts for performance issues

## Security Considerations

1. **Environment Variables**: Store sensitive data in Azure Key Vault
2. **HTTPS**: Azure App Service provides SSL certificates
3. **CORS**: Configure allowed origins properly
4. **Rate Limiting**: Already configured in `server.js`

## Scaling

- **Vertical Scaling**: Upgrade App Service Plan tier
- **Horizontal Scaling**: Enable auto-scaling rules
- **Load Balancing**: Use Azure Application Gateway if needed
