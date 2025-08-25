# GitHub Actions Workflow

This directory contains the GitHub Actions workflow for automated deployment to Azure App Service.

## Workflow File

- `azure-app-service.yml` - Main workflow for building and deploying to Azure App Service

## Setup Instructions

### 1. Azure App Service Publish Profile

1. Go to your Azure App Service in the Azure Portal
2. Navigate to "Deployment Center" → "Local Git/FTPS credentials"
3. Download the publish profile
4. In your GitHub repository, go to Settings → Secrets and variables → Actions
5. Create a new secret named `AZURE_PUBLISH_PROFILE`
6. Paste the entire content of the publish profile file

### 2. App Service Name

Update the `app-name` in the workflow file to match your Azure App Service name:

```yaml
app-name: 'your-app-service-name'
```

### 3. Environment Variables

Make sure your Azure App Service has all the required environment variables configured in the App Settings.

## Workflow Features

- ✅ **Automatic builds** on push to main branch
- ✅ **Frontend build** with React
- ✅ **Test execution** before deployment
- ✅ **Health checks** after deployment
- ✅ **Deployment package** creation
- ✅ **Azure App Service** deployment

## Troubleshooting

### Common Issues

1. **Publish Profile Error**: Ensure the `AZURE_PUBLISH_PROFILE` secret is correctly set
2. **Build Failures**: Check Node.js version compatibility
3. **Deployment Failures**: Verify Azure App Service configuration
4. **Health Check Failures**: Check application logs in Azure Portal

### Logs

- GitHub Actions logs are available in the Actions tab of your repository
- Azure App Service logs are available in the Azure Portal under "Log stream"
