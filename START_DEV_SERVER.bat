@echo off
echo ========================================
echo  Starting Azure Designer Dev Server
echo ========================================
echo.
echo Opening http://localhost:5173 in 5 seconds...
echo.
cd /d "%~dp0"
start /B cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:5173"
npm run dev
