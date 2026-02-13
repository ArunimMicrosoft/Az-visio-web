# Azure Static Web Apps - Local Deployment Test Script (PowerShell)
# This script helps you test the build locally before deploying to Azure

Write-Host "🚀 Azure Architecture Designer - Deployment Test" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Step 1: Check Node.js version
Write-Host "📋 Step 1: Checking Node.js version..."
try {
    $nodeVersion = node --version
    Print-Success "Node.js version: $nodeVersion"
} catch {
    Print-Error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
}

# Step 2: Install dependencies
Write-Host ""
Write-Host "📦 Step 2: Installing dependencies..."
npm ci
if ($LASTEXITCODE -eq 0) {
    Print-Success "Dependencies installed successfully"
} else {
    Print-Error "Failed to install dependencies"
    exit 1
}

# Step 3: Run build
Write-Host ""
Write-Host "🏗️  Step 3: Building application..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Print-Success "Build completed successfully"
} else {
    Print-Error "Build failed"
    exit 1
}

# Step 4: Verify build output
Write-Host ""
Write-Host "🔍 Step 4: Verifying build output..."
if (Test-Path "build") {
    Print-Success "Build directory exists"
    
    if (Test-Path "build/index.html") {
        Print-Success "index.html found"
    } else {
        Print-Error "index.html not found in build directory"
        exit 1
    }
    
    if (Test-Path "build/assets") {
        Print-Success "Assets directory found"
    } else {
        Print-Warning "Assets directory not found (may be normal)"
    }
    
    # Show build output structure
    Write-Host ""
    Write-Host "📂 Build directory contents:"
    Get-ChildItem -Path "build" -Recurse | Format-Table Name, Length, LastWriteTime
    
    # Show total size
    $buildSize = (Get-ChildItem -Path "build" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host ""
    Write-Host "📊 Total build size: $([math]::Round($buildSize, 2)) MB"
    
} else {
    Print-Error "Build directory not found"
    exit 1
}

# Step 5: Check for common issues
Write-Host ""
Write-Host "🔍 Step 5: Checking for common issues..."

# Check for large files that might cause issues
$largeFiles = Get-ChildItem -Path "build" -Recurse -File | Where-Object { $_.Length -gt 10MB }
if ($largeFiles) {
    Print-Warning "Found files larger than 10MB:"
    $largeFiles | Format-Table Name, @{Name="Size (MB)";Expression={[math]::Round($_.Length / 1MB, 2)}}
    Write-Host "Consider optimizing these files." -ForegroundColor Yellow
}

# Step 6: Test local server (optional)
Write-Host ""
Write-Host "🌐 Step 6: Testing with local server..."
Write-Host ""
$response = Read-Host "Do you want to test the build locally? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Starting local server..." -ForegroundColor Cyan
    Write-Host "Open your browser to: http://localhost:4173" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npx vite preview
}

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Print-Success "All checks passed!"
Write-Host ""
Write-Host "📋 Next Steps:"
Write-Host "1. Ensure your Azure deployment token is up to date"
Write-Host "2. Push your changes to trigger GitHub Actions deployment"
Write-Host "3. Monitor deployment at: https://github.com/your-repo/actions"
Write-Host ""
Write-Host "📚 For deployment troubleshooting, see: AZURE_DEPLOYMENT_FIX.md"
Write-Host ""
