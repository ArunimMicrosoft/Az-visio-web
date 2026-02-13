# Comprehensive Icon Audit Script
$ErrorActionPreference = "Stop"

$basePath = "c:\Users\labadmin\Desktop\python-mini\Az visio web"
$publicIcons = Join-Path $basePath "public\icons"
$azureIconsFile = Join-Path $basePath "src\utils\azureIcons.js"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FULL ICON AUDIT - ALL CATEGORIES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get all subdirectories (categories)
$categories = Get-ChildItem -Path $publicIcons -Directory

$totalMissing = 0
$totalFound = 0
$missingIcons = @()

foreach ($category in $categories) {
    $categoryName = $category.Name
    Write-Host "Checking: $categoryName" -ForegroundColor Yellow
    
    # Get all SVG files in this category
    $actualFiles = Get-ChildItem -Path $category.FullName -Filter "*.svg" -File | Select-Object -ExpandProperty Name
    
    # Extract icon paths from azureIcons.js for this category
    $content = Get-Content $azureIconsFile -Raw
    $pattern = "'/icons/$($categoryName -replace '\+', '\+' -replace ' ', ' ')/([^']+)'"
    $matches = [regex]::Matches($content, $pattern)
    
    $configuredFiles = @()
    foreach ($match in $matches) {
        $filename = $match.Groups[1].Value
        $configuredFiles += $filename
    }
    
    Write-Host "  Actual files: $($actualFiles.Count)" -ForegroundColor Gray
    Write-Host "  Configured: $($configuredFiles.Count)" -ForegroundColor Gray
    
    # Check for missing files
    $categoryMissing = @()
    foreach ($configFile in $configuredFiles) {
        if ($actualFiles -notcontains $configFile) {
            $categoryMissing += $configFile
            $missingIcons += @{
                Category = $categoryName
                ConfiguredFile = $configFile
                Path = "/icons/$categoryName/$configFile"
            }
        }
    }
    
    if ($categoryMissing.Count -gt 0) {
        Write-Host "  ❌ MISSING: $($categoryMissing.Count) files" -ForegroundColor Red
        $totalMissing += $categoryMissing.Count
    } else {
        Write-Host "  ✅ All files present" -ForegroundColor Green
        $totalFound += $configuredFiles.Count
    }
    Write-Host ""
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Working icons: $totalFound" -ForegroundColor Green
Write-Host "❌ Missing icons: $totalMissing" -ForegroundColor Red
Write-Host ""

if ($missingIcons.Count -gt 0) {
    Write-Host "DETAILED MISSING ICONS LIST:" -ForegroundColor Red
    Write-Host "===========================`n" -ForegroundColor Red
    
    $missingIcons | ForEach-Object {
        Write-Host "Category: $($_.Category)" -ForegroundColor Yellow
        Write-Host "  File: $($_.ConfiguredFile)" -ForegroundColor Gray
        Write-Host "  Path: $($_.Path)" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Save to file for analysis
    $outputFile = Join-Path $basePath "MISSING_ICONS_REPORT.txt"
    $missingIcons | ConvertTo-Json | Out-File $outputFile
    Write-Host "Report saved to: MISSING_ICONS_REPORT.txt" -ForegroundColor Cyan
}

Write-Host "`nAudit complete!`n" -ForegroundColor Green
