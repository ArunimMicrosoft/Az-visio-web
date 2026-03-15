@echo off
cd /d "c:\Users\labadmin\Desktop\python-mini\Az visio web"
echo === GIT STATUS ===
git status --short
echo.
echo === STAGING ALL ===
git add -A
echo.
echo === COMMITTING ===
git commit -m "fix: Razorpay live mode, remove hardcoded key, test-mode banner, cost calculator improvements"
echo.
echo === PUSHING ===
git push origin main
echo.
echo === DONE - CHECK ABOVE FOR ERRORS ===
echo GitHub Actions will now build and deploy automatically.
echo Live URL: https://purple-pebble-081ef0400.4.azurestaticapps.net
pause
