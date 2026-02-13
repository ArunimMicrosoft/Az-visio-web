# Azure Static Web Apps Deployment Fix Guide

## Current Error
```
The content server has rejected the request with: InternalServerError
```

## Root Causes & Solutions

### 1. ✅ Deployment Token Issue (Most Likely)

The deployment token in GitHub secrets may be expired, invalid, or regenerated in Azure Portal.

#### How to Fix:

1. **Go to Azure Portal**
   - Navigate to: https://portal.azure.com
   - Find your Static Web App: `blue-wave-09ee22700`

2. **Generate New Deployment Token**
   ```
   Azure Portal → Static Web Apps → blue-wave-09ee22700 → Deployment Token
   Click: "Manage deployment token" → "Reset token"
   Copy the new token
   ```

3. **Update GitHub Secret**
   ```
   GitHub Repository → Settings → Secrets and variables → Actions
   Edit secret: AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700
   Paste new token → Save
   ```

4. **Re-run Deployment**
   ```
   GitHub Repository → Actions → Failed workflow → "Re-run all jobs"
   ```

---

### 2. ✅ Build Configuration Check

Verify the build output matches what Azure expects:

#### Current Configuration (CORRECT):
```yaml
# .github/workflows/azure-static-web-apps.yml
app_location: "/"          # ✅ Root directory
output_location: "build"   # ✅ Matches vite.config.js
api_location: ""           # ✅ No API (static only)
```

```javascript
// vite.config.js
build: {
  outDir: 'build',  // ✅ Matches workflow
}
```

#### Verify Build Locally:
```bash
npm install
npm run build
# Check if 'build' folder is created with index.html
```

---

### 3. ✅ Azure Static Web Apps Region/Service Issue

Check if Azure service is experiencing issues:

1. **Azure Status Page**: https://status.azure.com
2. **Check your specific region**: Look for Static Web Apps outages

---

### 4. ✅ GitHub Actions Permissions

Ensure proper permissions are set:

```yaml
permissions:
  id-token: write    # ✅ Required for OIDC
  contents: read     # ✅ Required to checkout code
```

**Current workflow has correct permissions** ✅

---

## Step-by-Step Deployment Fix

### Option A: Regenerate Token (Recommended)

1. **Azure Portal**
   ```
   portal.azure.com → Static Web Apps → blue-wave-09ee22700 
   → Settings → Deployment Token → Reset
   ```

2. **Copy New Token**
   - Save it securely
   - Token looks like: `abcd1234...xyz789`

3. **Update GitHub Secret**
   ```
   github.com/your-repo → Settings → Secrets → Actions
   → AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700
   → Update
   ```

4. **Commit & Push**
   ```bash
   git add .
   git commit -m "Trigger deployment with new token"
   git push origin main
   ```

### Option B: Recreate Workflow

1. **Delete existing workflow file**
   ```bash
   rm .github/workflows/azure-static-web-apps.yml
   git add .
   git commit -m "Remove old workflow"
   git push
   ```

2. **Go to Azure Portal**
   ```
   Static Web Apps → blue-wave-09ee22700 → Settings
   → "Set up GitHub Actions workflow"
   → Follow wizard → It will create new workflow with fresh token
   ```

### Option C: Manual Deployment (Bypass GitHub Actions)

1. **Install Azure Static Web Apps CLI**
   ```bash
   npm install -g @azure/static-web-apps-cli
   ```

2. **Build Locally**
   ```bash
   npm run build
   ```

3. **Deploy Manually**
   ```bash
   swa deploy ./build --deployment-token <your-token>
   ```

---

## Verification Steps

After fixing:

1. ✅ **Check GitHub Actions**
   - Workflow should show green checkmark
   - Build logs should show successful deployment

2. ✅ **Check Azure Portal**
   - Static Web Apps → Overview
   - "Status" should be "Ready"
   - "URL" should be clickable

3. ✅ **Test Live Site**
   - Open: https://blue-wave-09ee22700.azurestaticapps.net
   - Verify drag-and-drop works
   - Test export features (Terraform, ARM, Cost)

4. ✅ **Test Mobile**
   - Open on phone/tablet
   - Test touch drag-and-drop
   - Check console logs (if debugging enabled)

---

## Common Errors & Fixes

### Error: "Deployment token is invalid"
**Fix**: Regenerate token in Azure Portal (see Option A above)

### Error: "Could not find a valid build output"
**Fix**: Ensure `vite.config.js` has `outDir: 'build'`

### Error: "Permission denied"
**Fix**: Check GitHub Actions permissions in workflow file

### Error: "Resource not found"
**Fix**: Verify Static Web App still exists in Azure Portal

---

## Debugging Tips

1. **Enable Verbose Logging**
   ```yaml
   # Add to workflow file
   env:
     ACTIONS_RUNNER_DEBUG: true
   ```

2. **Check Build Output**
   ```bash
   npm run build
   ls -la build/  # Should contain index.html, assets/, etc.
   ```

3. **Validate Workflow Syntax**
   ```bash
   # Use GitHub CLI
   gh workflow view azure-static-web-apps.yml
   ```

4. **Test Locally with SWA CLI**
   ```bash
   npx @azure/static-web-apps-cli start ./build
   # Open http://localhost:4280
   ```

---

## Contact Support

If none of these work:

1. **Azure Support**
   - Portal → Help + Support → New support request
   - Issue type: Technical
   - Service: Static Web Apps

2. **GitHub Support**
   - If Actions are failing
   - https://support.github.com

---

## Expected Successful Deployment

When deployment succeeds, you'll see:

```
✅ Build And Deploy
   Building app...
   Uploading build artifacts...
   App deployed successfully
   
URL: https://blue-wave-09ee22700.azurestaticapps.net
```

---

## Next Steps After Successful Deployment

1. ✅ Test mobile touch drag-and-drop
2. ✅ Verify Terraform export (5 files)
3. ✅ Test ARM template export
4. ✅ Test cost PDF generation
5. ✅ Check save/load functionality
6. ✅ Test zoom/pan controls
7. 🧹 Remove console.log statements (production cleanup)

---

## Quick Reference

| Component | Current Value | Status |
|-----------|---------------|--------|
| Static Web App Name | `blue-wave-09ee22700` | ✅ |
| Workflow File | `.github/workflows/azure-static-web-apps.yml` | ✅ |
| Build Command | `npm run build` | ✅ |
| Output Directory | `build` | ✅ |
| GitHub Secret | `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700` | ⚠️ **Needs Update** |

---

## TL;DR - Quick Fix

**Most likely solution in 3 steps:**

1. Go to Azure Portal → Static Web Apps → Reset deployment token
2. Update GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700`
3. Push a commit to trigger new deployment

**Estimated time: 5 minutes**
