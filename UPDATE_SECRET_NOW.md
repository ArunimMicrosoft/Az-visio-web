# URGENT: Update GitHub Secret with New API Key

## Your Deployment Token (API Key)
```
bdff35b553e987540c5f729b6b11b0a53a442d412c78292fe53caac7c19023a101-4b703e8e-be15-494f-ae7e-abf157e068f3000022309ee22700
```

## Quick Fix Steps (2 minutes)

### 1. Update GitHub Secret

**Go to:** https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/settings/secrets/actions

**Steps:**
1. Find the secret named: `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700`
2. Click the **"Update"** button (or **"New repository secret"** if it doesn't exist)
3. Paste this value:
   ```
   bdff35b553e987540c5f729b6b11b0a53a442d412c78292fe53caac7c19023a101-4b703e8e-be15-494f-ae7e-abf157e068f3000022309ee22700
   ```
4. Click **"Update secret"** (or **"Add secret"**)

### 2. Re-run GitHub Actions Workflow

**Go to:** https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions

**Steps:**
1. Click on the most recent failed workflow run
2. Click **"Re-run all jobs"** button (top right)
3. Wait 2-3 minutes for deployment to complete

### 3. Verify Deployment

Once the workflow succeeds:
- **App URL:** https://blue-wave-09ee22700.1.azurestaticapps.net
- Test the mobile drag-and-drop functionality
- Verify all features work

---

## Secret Configuration

**Secret Name:**
```
AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700
```

**Secret Value:**
```
bdff35b553e987540c5f729b6b11b0a53a442d412c78292fe53caac7c19023a101-4b703e8e-be15-494f-ae7e-abf157e068f3000022309ee22700
```

---

## Expected Result

After updating and re-running:
✅ Build succeeds
✅ Deployment completes successfully  
✅ App is live at: https://blue-wave-09ee22700.1.azurestaticapps.net
✅ Mobile drag-and-drop works
✅ All 300+ Azure icons available

---

## If You Need Direct Link

Click here to go directly to secrets page:
`https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/settings/secrets/actions`

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.
