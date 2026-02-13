# Quick Azure Token Retrieval
# Just run this script and it will get your deployment token

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Azure Static Web App - Get Token" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Step 1: List Static Web Apps
Write-Host "`nStep 1: Finding your Static Web Apps...`n" -ForegroundColor Yellow

$apps = az staticwebapp list --output json 2>&1 | ConvertFrom-Json

if (-not $apps -or $apps.Count -eq 0) {
    Write-Host "❌ No Static Web Apps found in your Azure subscription.`n" -ForegroundColor Red
    Write-Host "You need to create one first. Here's the command:`n" -ForegroundColor Yellow
    Write-Host "az staticwebapp create ``" -ForegroundColor Cyan
    Write-Host "  --name azure-visio-web-app ``" -ForegroundColor Cyan
    Write-Host "  --resource-group rg-azure-visio ``" -ForegroundColor Cyan
    Write-Host "  --location eastus ``" -ForegroundColor Cyan
    Write-Host "  --sku Free`n" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Found $($apps.Count) Static Web App(s):`n" -ForegroundColor Green

$index = 1
foreach ($app in $apps) {
    Write-Host "[$index] $($app.name)" -ForegroundColor Cyan
    Write-Host "    Resource Group: $($app.resourceGroup)" -ForegroundColor Gray
    Write-Host "    Location: $($app.location)" -ForegroundColor Gray
    Write-Host "    URL: https://$($app.defaultHostname)" -ForegroundColor Gray
    Write-Host ""
    $index++
}

# Step 2: Get token
$selectedApp = $null

if ($apps.Count -eq 1) {
    $selectedApp = $apps[0]
    Write-Host "Using: $($selectedApp.name)`n" -ForegroundColor Yellow
} else {
    $selection = Read-Host "Enter the number [1-$($apps.Count)]"
    $selectedApp = $apps[[int]$selection - 1]
}

Write-Host "Getting deployment token for: $($selectedApp.name)...`n" -ForegroundColor Yellow

$token = az staticwebapp secrets list `
    --name $selectedApp.name `
    --resource-group $selectedApp.resourceGroup `
    --query "properties.apiKey" -o tsv 2>&1

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ Failed to get token. Try manually from Azure Portal.`n" -ForegroundColor Red
    exit 1
}

# Display token
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT TOKEN (API KEY)" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host $token -ForegroundColor White
Write-Host "==================================" -ForegroundColor Cyan

# Copy to clipboard
try {
    $token | Set-Clipboard
    Write-Host "`n✅ Token copied to clipboard!`n" -ForegroundColor Green
} catch {
    Write-Host "`n⚠️  Please copy the token manually`n" -ForegroundColor Yellow
}

# Next steps
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Find or create secret: AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700" -ForegroundColor White
Write-Host "3. Paste the token above" -ForegroundColor White
Write-Host "4. Save" -ForegroundColor White
Write-Host "5. Go to Actions tab and re-run the failed workflow`n" -ForegroundColor White

Write-Host "App URL: https://$($selectedApp.defaultHostname)`n" -ForegroundColor Cyan
