# PowerShell Script to Start Dev Server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting Azure Designer Dev Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will start on: http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start dev server
npm run dev
