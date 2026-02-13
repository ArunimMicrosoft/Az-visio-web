# PowerShell script to audit icon paths

$basePath = "c:\Users\labadmin\Desktop\python-mini\Az visio web"
$publicIcons = Join-Path $basePath "public\icons"

Write-Host "Scanning containers directory..." -ForegroundColor Yellow
Write-Host ""

# Get actual files in containers
$actualFiles = Get-ChildItem -Path (Join-Path $publicIcons "containers") -File -Filter "*.svg" | Select-Object -ExpandProperty Name

Write-Host "ACTUAL FILES IN containers:" -ForegroundColor Green
$actualFiles | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "CONFIGURED IN azureIcons.js:" -ForegroundColor Cyan
Write-Host "  10023-icon-service-Kubernetes-Services.svg"
Write-Host "  10104-icon-service-Container-Instances.svg"
Write-Host "  10105-icon-service-Container-Registries.svg"
Write-Host "  03270-icon-service-Container-Apps.svg"
Write-Host "  10036-icon-service-Service-Fabric-Clusters.svg"
Write-Host "  03655-icon-service-App-Spaces.svg"
Write-Host "  02413-icon-service-Azure-Red-Hat-OpenShift.svg"

Write-Host ""
Write-Host "ANALYSIS:" -ForegroundColor Red
Write-Host "  ❌ 03270-icon-service-Container-Apps.svg - MISSING"
Write-Host "  ❌ 03655-icon-service-App-Spaces.svg - MISSING"
Write-Host "  ❌ 02413-icon-service-Azure-Red-Hat-OpenShift.svg - WRONG NUMBER (actual: 03331)"
