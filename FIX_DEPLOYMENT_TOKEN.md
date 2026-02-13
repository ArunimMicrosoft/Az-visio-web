# Fix Azure Static Web Apps Deployment Token

## Issue
Error: `No matching Static Web App was found or the api key was invalid`

## Solution Steps

### Option 1: Get Deployment Token from Existing Resource

1. **Open Azure Portal**: https://portal.azure.com
2. **Navigate to your Static Web App**:
   - Go to "All resources"
   - Find: `blue-wave-09ee22700` (or your Static Web App name)
   - Click on it

3. **Get the Deployment Token**:
   - In the left menu, click **"Overview"**
   - Click **"Manage deployment token"** button at the top
   - Click **"Reset deployment token"** (this generates a new token)
   - **Copy the token** (it will look like: `abc123def456...`)

4. **Update GitHub Secret**:
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Find secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700`
   - Click **"Update"** or **"Edit"**
   - Paste the new deployment token
   - Click **"Update secret"**

5. **Re-run the Workflow**:
   - Go to **Actions** tab in GitHub
   - Find the failed workflow run
   - Click **"Re-run all jobs"**

---

### Option 2: Create New Static Web App (If Resource Was Deleted)

If the resource doesn't exist, create a new one:

#### A. Using Azure Portal

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create Static Web App**:
   - Click **"+ Create a resource"**
   - Search for **"Static Web App"**
   - Click **"Create"**

3. **Fill in Details**:
   ```
   Subscription: [Your Subscription]
   Resource Group: [Create new or use existing]
   Name: azure-visio-web-app
   Region: (Choose closest to you)
   Plan type: Free
   
   Deployment Details:
   Source: GitHub
   Organization: [Your GitHub username]
   Repository: [Your repo name]
   Branch: main
   
   Build Details:
   Build Presets: Custom
   App location: /
   Api location: (leave empty)
   Output location: build
   ```

4. **Review + Create**:
   - Click **"Review + create"**
   - Click **"Create"**
   - Wait for deployment (2-3 minutes)

5. **Get Deployment Token**:
   - After creation, go to the resource
   - Click **"Manage deployment token"**
   - Copy the token

6. **Update GitHub Secret**:
   - Create or update secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Paste the deployment token

#### B. Using Azure CLI (Faster)

```powershell
# Login to Azure
az login

# Create resource group (if needed)
az group create --name rg-azure-visio --location eastus

# Create Static Web App
az staticwebapp create \
  --name azure-visio-web-app \
  --resource-group rg-azure-visio \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location "build" \
  --login-with-github

# Get deployment token
az staticwebapp secrets list \
  --name azure-visio-web-app \
  --resource-group rg-azure-visio \
  --query "properties.apiKey" -o tsv
```

---

### Option 3: Use Azure CLI to Get Token (Quickest)

If you have Azure CLI installed and logged in:

```powershell
# Login
az login

# List all Static Web Apps (find your app name)
az staticwebapp list --output table

# Get the deployment token
az staticwebapp secrets list \
  --name blue-wave-09ee22700 \
  --resource-group [YOUR_RESOURCE_GROUP] \
  --query "properties.apiKey" -o tsv
```

Copy the token and update GitHub secret.

---

## Workflow File Location
`.github/workflows/azure-static-web-apps.yml`

## GitHub Secret Name
`AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700`

## App URL (Once Fixed)
https://blue-wave-09ee22700.1.azurestaticapps.net

---

## Quick Checklist

- [ ] Check if Static Web App exists in Azure Portal
- [ ] Get/regenerate deployment token
- [ ] Update GitHub secret with new token
- [ ] Re-run GitHub Actions workflow
- [ ] Verify deployment succeeds
- [ ] Test app URL

---

## Need Help?

If you're stuck, let me know:
1. Can you access Azure Portal?
2. Do you see the Static Web App resource?
3. Do you have permissions to manage the resource?
