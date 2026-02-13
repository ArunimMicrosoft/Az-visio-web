# Update GitHub Secret Script
$token = "bdff35b553e987540c5f729b6b11b0a53a442d412c78292fe53caac7c19023a101-4b703e8e-be15-494f-ae7e-abf157e068f3000022309ee22700"
$secretName = "AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700"

Write-Host "`n=== Updating GitHub Secret ===" -ForegroundColor Cyan

# Get repo info
$repoUrl = git config --get remote.origin.url
if ($repoUrl -match "github.com[:/](.+?)/(.+?)(?:\.git)?$") {
    $owner = $matches[1]
    $repo = $matches[2]
    
    Write-Host "Repository: $owner/$repo" -ForegroundColor Yellow
    Write-Host "Secret Name: $secretName" -ForegroundColor Yellow
    
    # Check if GitHub CLI is installed
    $ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
    
    if ($ghInstalled) {
        Write-Host "`nUpdating secret via GitHub CLI..." -ForegroundColor Yellow
        
        # Update the secret
        $token | gh secret set $secretName --repo "$owner/$repo"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Secret updated successfully!" -ForegroundColor Green
            Write-Host "`nTriggering workflow re-run..." -ForegroundColor Yellow
            
            # Get latest workflow run
            $runId = gh run list --limit 1 --json databaseId --jq '.[0].databaseId'
            if ($runId) {
                gh run rerun $runId --repo "$owner/$repo"
                Write-Host "✅ Workflow re-run triggered!" -ForegroundColor Green
            }
        } else {
            Write-Host "`n❌ Failed to update secret" -ForegroundColor Red
        }
    } else {
        Write-Host "`n⚠️  GitHub CLI not installed" -ForegroundColor Yellow
        Write-Host "`nManual steps:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://github.com/$owner/$repo/settings/secrets/actions" -ForegroundColor White
        Write-Host "2. Click 'New repository secret' or edit existing" -ForegroundColor White
        Write-Host "3. Name: $secretName" -ForegroundColor White
        Write-Host "4. Value: [API key copied to clipboard]" -ForegroundColor White
        Write-Host "5. Click 'Add secret' or 'Update secret'" -ForegroundColor White
        
        # Copy to clipboard
        $token | Set-Clipboard
        Write-Host "`n✅ API key copied to clipboard!" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Could not determine GitHub repository" -ForegroundColor Red
}
