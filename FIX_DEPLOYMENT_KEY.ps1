# Get the correct Azure Static Web Apps API Token

# Method 1: Using Azure CLI
Write-Host "`n=== Getting Azure Static Web Apps API Token ===" -ForegroundColor Cyan
Write-Host ""

# Login to Azure (if not already logged in)
Write-Host "Step 1: Login to Azure" -ForegroundColor Yellow
Write-Host "Run: az login" -ForegroundColor Gray
Write-Host ""

# List your static web apps
Write-Host "Step 2: Find your Static Web App" -ForegroundColor Yellow
Write-Host "Run: az staticwebapp list --output table" -ForegroundColor Gray
Write-Host ""

# Get the API key
Write-Host "Step 3: Get the deployment token (API key)" -ForegroundColor Yellow
Write-Host "Run: az staticwebapp secrets list --name <your-app-name> --query 'properties.apiKey' --output tsv" -ForegroundColor Gray
Write-Host ""
Write-Host "Example:" -ForegroundColor Green
Write-Host "az staticwebapp secrets list --name blue-wave-09ee22700 --query 'properties.apiKey' --output tsv" -ForegroundColor Gray
Write-Host ""

# Alternative: Get from Azure Portal
Write-Host "`n=== OR Get from Azure Portal ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://portal.azure.com" -ForegroundColor White
Write-Host "2. Search for 'Static Web Apps' in the top search bar" -ForegroundColor White
Write-Host "3. Click on your app (blue-wave-09ee22700 or similar)" -ForegroundColor White
Write-Host "4. In the left menu, click 'Overview'" -ForegroundColor White
Write-Host "5. Click 'Manage deployment token' button" -ForegroundColor White
Write-Host "6. Copy the deployment token" -ForegroundColor White
Write-Host ""

# Update GitHub Secret
Write-Host "`n=== Update GitHub Secret ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Once you have the API key, update it in GitHub:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://github.com/ArunimMicrosoft/Az-visio-web/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Find: AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700" -ForegroundColor White
Write-Host "3. Click 'Update' or 'Remove' then 'Add'" -ForegroundColor White
Write-Host "4. Paste the NEW deployment token" -ForegroundColor White
Write-Host "5. Click 'Update secret'" -ForegroundColor White
Write-Host ""

Write-Host "Then push any commit to trigger a new deployment!" -ForegroundColor Green
Write-Host ""
