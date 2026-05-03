# Azure Deployment Guide for AyushCare

This guide walks through deploying the AyushCare application to Azure.

## Prerequisites
- Azure subscription
- GitHub account with repository access
- Azure CLI installed locally (`az` command)
- Node.js 18+ and Python 3.9+

## Step 1: Create Azure Resources

### 1.1 Create Resource Group
```bash
az group create --name ayushcare-rg --location eastus
```

### 1.2 Create Azure App Service for Backend (Python Flask)
```bash
# Create App Service Plan
az appservice plan create \
  --name ayushcare-plan \
  --resource-group ayushcare-rg \
  --sku B1 \
  --is-linux

# Create App Service
az webapp create \
  --resource-group ayushcare-rg \
  --plan ayushcare-plan \
  --name ayushcare-api \
  --runtime "PYTHON|3.9"

# Configure deployment
az webapp up \
  --resource-group ayushcare-rg \
  --name ayushcare-api \
  --runtime PYTHON:3.9
```

### 1.3 Create Azure Static Web App for Frontend
```bash
az staticwebapp create \
  --name ayushcare-web \
  --resource-group ayushcare-rg \
  --source https://github.com/YOUR_GITHUB_USERNAME/ayushcare \
  --location eastus \
  --branch main \
  --token YOUR_GITHUB_TOKEN
```

### 1.4 Create Cosmos DB for Database
```bash
# Create Cosmos DB Account
az cosmosdb create \
  --name ayushcare-db \
  --resource-group ayushcare-rg \
  --default-consistency-level Eventual \
  --locations regionName=eastus failoverPriority=0

# Create Database
az cosmosdb database create \
  --account-name ayushcare-db \
  --resource-group ayushcare-rg \
  --name ayushcare

# Create Container
az cosmosdb collection create \
  --account-name ayushcare-db \
  --database-name ayushcare \
  --resource-group ayushcare-rg \
  --name patients \
  --partition-key-path /phone
```

## Step 2: Configure GitHub Actions

1. In your GitHub repository, go to **Settings > Secrets and variables > Actions**
2. Add the following secrets:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: Get this from Azure Static Web Apps in the portal
   - `AZURE_RESOURCE_GROUP`: `ayushcare-rg`
   - `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID

## Step 3: Configure Environment Variables

### For Frontend (app/.env)
```
REACT_APP_API_BASE_URL=https://ayushcare-api.azurewebsites.net
```

### For Backend (api_py/.env)
```
COSMOS_DB_CONNECTION=<connection-string-from-portal>
FLASK_ENV=production
```

## Step 4: Deploy

### Automatic Deployment (GitHub Actions)
Push to main branch - GitHub Actions will automatically:
1. Build the frontend (Expo/React Native Web)
2. Deploy to Azure Static Web Apps
3. Build the backend
4. Deploy to Azure App Service

### Manual Deployment

**Frontend:**
```bash
cd app
npm install
npm run build
az staticwebapp upload \
  --name ayushcare-web \
  --source-location dist
```

**Backend:**
```bash
cd api_py
# Deploy to App Service
az webapp up --resource-group ayushcare-rg --name ayushcare-api
```

## Step 5: Domain Configuration

### Connect GoDaddy Domain
1. In Azure portal, go to Static Web App > Custom domains
2. Add custom domain (e.g., `ayushcare.com`)
3. Copy the DNS TXT record
4. In GoDaddy DNS settings, add the TXT record for verification
5. Once verified, Azure will auto-manage the domain

## Step 6: Verify Deployment

1. **Frontend**: Navigate to `https://ayushcare-web.azurestaticapps.net`
2. **Backend**: Test API at `https://ayushcare-api.azurewebsites.net/api/sendOtp`
3. **Health Check**: Run full end-to-end testing

## Troubleshooting

### Build Failures
- Check GitHub Actions logs in repository
- Verify Python 3.9 and Node.js 18+ compatibility
- Ensure all dependencies are in `requirements.txt` and `package.json`

### API Connection Issues
- Verify frontend environment variables point to correct backend URL
- Check CORS settings in Flask backend
- Verify firewall rules in Azure

### Database Connection Issues
- Verify Cosmos DB connection string in App Service settings
- Check authentication credentials
- Ensure container schema matches application requirements

## Next Steps

1. Monitor application in Azure Portal
2. Set up Application Insights for monitoring
3. Configure auto-scaling for production traffic
4. Set up backup and disaster recovery
5. Implement CI/CD pipeline for testing before deployment
