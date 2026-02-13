# Update GitHub Secret with Azure Static Web Apps API Token

$apiKey = "bdff35b553e987540c5f729b6b11b0a53a442d412c78292fe53caac7c19023a101-4b703e8e-be15-494f-ae7e-abf157e068f3000022309ee22700"
$secretName = "AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700"

Write-Host "🔐 Updating GitHub Secret: $secretName" -ForegroundColor Cyan
Write-Host ""

# Method 1: Using gh CLI (if authenticated)
Write-Host "📝 Attempting with GitHub CLI..." -ForegroundColor Yellow
try {
    echo $apiKey | gh secret set $secretName --repo Cdaprod/az-visio-web
    Write-Host "✅ Secret updated successfully via gh CLI!" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "❌ gh CLI failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 MANUAL STEPS:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/Cdaprod/az-visio-web/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Click 'Update' on: $secretName" -ForegroundColor White
Write-Host "3. Paste this API key:" -ForegroundColor White
Write-Host ""
Write-Host $apiKey -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Click 'Update secret'" -ForegroundColor White
Write-Host "5. Go to Actions tab and manually trigger workflow" -ForegroundColor White
Write-Host ""
Write-Host "OR run this command after gh auth:" -ForegroundColor Yellow
Write-Host "echo `"$apiKey`" | gh secret set $secretName --repo Cdaprod/az-visio-web" -ForegroundColor Cyan
