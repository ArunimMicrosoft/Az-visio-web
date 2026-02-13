# Azure Static Web Apps - Get API Key Commands

## Quick Commands

### 1. Login to Azure
```powershell
az login
```

### 2. List all your Static Web Apps
```powershell
az staticwebapp list --output table
```

### 3. Get Deployment Token (API Key)
```powershell
# Replace with your actual resource group and app name
az staticwebapp secrets list `
  --name YOUR_APP_NAME `
  --resource-group YOUR_RESOURCE_GROUP `
  --query "properties.apiKey" -o tsv
```

---

## Full Example Workflow

```powershell
# Step 1: Login
az login

# Step 2: Find your app (shows all Static Web Apps)
az staticwebapp list --output table

# Step 3: Get the deployment token
# Example if your app is named "blue-wave-09ee22700" in resource group "rg-azure-visio"
az staticwebapp secrets list `
  --name blue-wave-09ee22700 `
  --resource-group rg-azure-visio `
  --query "properties.apiKey" -o tsv
```

---

## If You Don't Know the Resource Group

```powershell
# List all Static Web Apps with full details (including resource group)
az staticwebapp list --output json | ConvertFrom-Json | Select-Object name, resourceGroup, location, defaultHostname | Format-Table
```

---

## Copy Token Directly to Clipboard (Windows)

```powershell
az staticwebapp secrets list `
  --name YOUR_APP_NAME `
  --resource-group YOUR_RESOURCE_GROUP `
  --query "properties.apiKey" -o tsv | Set-Clipboard

Write-Host "✅ Token copied to clipboard!" -ForegroundColor Green
```

---

## Create New Static Web App (If Needed)

```powershell
# Create resource group
az group create --name rg-azure-visio --location eastus

# Create Static Web App
az staticwebapp create `
  --name azure-visio-web-app `
  --resource-group rg-azure-visio `
  --location eastus `
  --source https://github.com/YOUR_USERNAME/YOUR_REPO `
  --branch main `
  --app-location "/" `
  --output-location "build" `
  --sku Free

# Get the deployment token
az staticwebapp secrets list `
  --name azure-visio-web-app `
  --resource-group rg-azure-visio `
  --query "properties.apiKey" -o tsv
```

---

## After Getting the Token

1. **Copy the token** (long string starting with alphanumeric characters)
2. **Go to GitHub**: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
3. **Update Secret**: 
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700`
   - Value: [paste the token]
4. **Re-run GitHub Actions**: Go to Actions tab → Click failed workflow → Re-run all jobs

---

## Troubleshooting

### "Resource not found" error
Your Static Web App might have been deleted. Create a new one using the commands above.

### "Login required" error
Run `az login` again

### "Subscription not found" error
```powershell
# List all subscriptions
az account list --output table

# Set the correct subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

---

## Quick Copy-Paste Script

Save this as `get-token.ps1` and run it:

```powershell
# Quick token retrieval script
Write-Host "=== Azure Static Web App Token Retrieval ===" -ForegroundColor Cyan

# Login
az login

# List apps
Write-Host "`nYour Static Web Apps:" -ForegroundColor Yellow
$apps = az staticwebapp list --output json | ConvertFrom-Json

if ($apps.Count -eq 0) {
    Write-Host "No Static Web Apps found. You need to create one." -ForegroundColor Red
    exit
}

$apps | ForEach-Object {
    Write-Host "Name: $($_.name)" -ForegroundColor Green
    Write-Host "Resource Group: $($_.resourceGroup)" -ForegroundColor Gray
    Write-Host "URL: https://$($_.defaultHostname)" -ForegroundColor Cyan
    Write-Host ""
}

# If only one app, get token automatically
if ($apps.Count -eq 1) {
    Write-Host "Getting token for: $($apps[0].name)..." -ForegroundColor Yellow
    $token = az staticwebapp secrets list `
        --name $apps[0].name `
        --resource-group $apps[0].resourceGroup `
        --query "properties.apiKey" -o tsv
    
    Write-Host "`n=== DEPLOYMENT TOKEN ===" -ForegroundColor Cyan
    Write-Host $token -ForegroundColor White
    Write-Host "========================" -ForegroundColor Cyan
    
    $token | Set-Clipboard
    Write-Host "`n✅ Token copied to clipboard!" -ForegroundColor Green
}
```

Run with:
```powershell
powershell -ExecutionPolicy Bypass -File get-token.ps1
```
