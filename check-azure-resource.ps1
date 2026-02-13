# Azure Static Web App Token Checker
# This script helps you get the deployment token

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Azure Static Web App Token Checker" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
Write-Host "Checking for Azure CLI..." -ForegroundColor Yellow
$azInstalled = Get-Command az -ErrorAction SilentlyContinue

if (-not $azInstalled) {
    Write-Host "❌ Azure CLI is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Azure CLI from:" -ForegroundColor Yellow
    Write-Host "https://aka.ms/installazurecliwindows" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or use the Azure Portal method in FIX_DEPLOYMENT_TOKEN.md" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Azure CLI is installed" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
$accountInfo = az account show 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Azure" -ForegroundColor Red
    Write-Host ""
    Write-Host "Logging in to Azure..." -ForegroundColor Yellow
    az login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Logged in to Azure" -ForegroundColor Green
Write-Host ""

# List all Static Web Apps
Write-Host "Finding your Static Web Apps..." -ForegroundColor Yellow
Write-Host ""

$staticApps = az staticwebapp list --output json 2>&1 | ConvertFrom-Json

if ($staticApps.Count -eq 0) {
    Write-Host "❌ No Static Web Apps found in your subscription" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to create a new Static Web App." -ForegroundColor Yellow
    Write-Host "See Option 2 in FIX_DEPLOYMENT_TOKEN.md" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Found $($staticApps.Count) Static Web App(s):" -ForegroundColor Green
Write-Host ""

$index = 1
foreach ($app in $staticApps) {
    Write-Host "[$index] Name: $($app.name)" -ForegroundColor Cyan
    Write-Host "    Resource Group: $($app.resourceGroup)" -ForegroundColor Gray
    Write-Host "    Location: $($app.location)" -ForegroundColor Gray
    Write-Host "    URL: https://$($app.defaultHostname)" -ForegroundColor Gray
    Write-Host ""
    $index++
}

# Ask user to select
if ($staticApps.Count -eq 1) {
    $selectedApp = $staticApps[0]
    Write-Host "Using: $($selectedApp.name)" -ForegroundColor Yellow
} else {
    $selection = Read-Host "Enter the number of the app you want to use [1-$($staticApps.Count)]"
    $selectedApp = $staticApps[$selection - 1]
}

Write-Host ""
Write-Host "Getting deployment token for: $($selectedApp.name)..." -ForegroundColor Yellow

# Get deployment token
$token = az staticwebapp secrets list `
    --name $selectedApp.name `
    --resource-group $selectedApp.resourceGroup `
    --query "properties.apiKey" -o tsv

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ Failed to get deployment token" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please try getting it manually from Azure Portal:" -ForegroundColor Yellow
    Write-Host "https://portal.azure.com/#@/resource$($selectedApp.id)/overview" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Successfully retrieved deployment token!" -ForegroundColor Green
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT TOKEN:" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host $token -ForegroundColor White
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy the token above (select and press Enter)" -ForegroundColor White
Write-Host "2. Go to your GitHub repository" -ForegroundColor White
Write-Host "3. Settings → Secrets and variables → Actions" -ForegroundColor White
Write-Host "4. Update secret: AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700" -ForegroundColor White
Write-Host "5. Paste the token and save" -ForegroundColor White
Write-Host "6. Re-run the GitHub Actions workflow" -ForegroundColor White
Write-Host ""
Write-Host "App URL: https://$($selectedApp.defaultHostname)" -ForegroundColor Cyan
Write-Host ""

# Copy to clipboard if possible
try {
    $token | Set-Clipboard
    Write-Host "✅ Token copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not copy to clipboard automatically" -ForegroundColor Yellow
}
