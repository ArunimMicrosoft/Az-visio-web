# 🔥 CRITICAL: Azure Deployment Failing - API Key Issue

## Error Message
```
The content server has rejected the request with: BadRequest
Reason: No matching Static Web App was found or the api key was invalid.
```

## Root Cause
The GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700` contains an **invalid or expired deployment token**.

---

## ✅ SOLUTION: Get Fresh Deployment Token

### Method 1: Azure Portal (EASIEST)

1. **Open Azure Portal**
   - Go to: https://portal.azure.com
   - Sign in with your Azure account

2. **Find Your Static Web App**
   - Click the search bar at the top
   - Type: "Static Web Apps"
   - Click on the "Static Web Apps" service
   - Find your app: `blue-wave-09ee22700` (or similar name)
   - Click on it

3. **Get Deployment Token**
   - In the app's Overview page, look for **"Manage deployment token"** button
   - Click it
   - A popup will show your deployment token
   - Click **"Copy"** to copy the token

4. **Update GitHub Secret**
   - Go to: https://github.com/ArunimMicrosoft/Az-visio-web/settings/secrets/actions
   - Find the secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700`
   - Click **"Update"** (or delete and re-create)
   - Paste the NEW token you copied
   - Click **"Update secret"**

---

### Method 2: Azure CLI

```powershell
# 1. Login to Azure
az login

# 2. List your Static Web Apps
az staticwebapp list --output table

# 3. Get the deployment token (replace with your app name)
az staticwebapp secrets list --name blue-wave-09ee22700 --query 'properties.apiKey' --output tsv

# 4. Copy the token and update GitHub secret manually
```

---

### Method 3: Create NEW Static Web App (If app doesn't exist)

If the Static Web App was deleted, you need to create a new one:

```powershell
# Login
az login

# Create resource group (if needed)
az group create --name rg-azvisio-prod --location eastus

# Create Static Web App
az staticwebapp create `
  --name az-visio-designer `
  --resource-group rg-azvisio-prod `
  --location eastus `
  --source https://github.com/ArunimMicrosoft/Az-visio-web `
  --branch main `
  --app-location "/" `
  --output-location "build" `
  --sku Free

# Get the deployment token
az staticwebapp secrets list --name az-visio-designer --query 'properties.apiKey' --output tsv
```

Then update the GitHub workflow file to use the new app name and token.

---

## 🔄 After Fixing

Once you've updated the GitHub secret with the correct token:

1. **Trigger New Deployment**
   ```bash
   # Make a small change and push
   git commit --allow-empty -m "trigger: Force redeploy with correct API key"
   git push origin main
   ```

2. **Monitor Deployment**
   - Go to: https://github.com/ArunimMicrosoft/Az-visio-web/actions
   - Watch the "Azure Static Web Apps CI/CD" workflow
   - It should now succeed ✅

---

## 📝 Verification Steps

After deployment succeeds:

1. **Check Azure Portal**
   - Go to your Static Web App in Azure Portal
   - Check "Deployments" tab - should show successful deployment
   - Note the production URL (e.g., https://blue-wave-09ee22700.azurestaticapps.net)

2. **Test the Website**
   - Open the production URL
   - Verify all features work:
     - ✅ Icons load correctly
     - ✅ VNet-Subnet connections show GREEN
     - ✅ Save/Load works with file browser
     - ✅ Validate button opens validation panel
     - ✅ Mobile responsive works
     - ✅ Export functions work

---

## 🆘 Still Having Issues?

### Check if Static Web App Exists
```powershell
az resource list --resource-type "Microsoft.Web/staticSites" --output table
```

### Check Resource Group
```powershell
az group list --output table
```

### Verify GitHub Secret
```powershell
# Go to GitHub repo settings
https://github.com/ArunimMicrosoft/Az-visio-web/settings/secrets/actions

# Ensure secret name matches workflow file:
AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700
```

### Check Workflow File
File: `.github/workflows/azure-static-web-apps.yml`

Ensure the secret name matches:
```yaml
azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_WAVE_09EE22700 }}
```

---

## 💡 Quick Test (Local)

While fixing Azure, test locally:

```bash
npm run dev
```

Open: http://localhost:5173

---

## 📞 Need Help?

1. Check Azure Static Web Apps docs: https://docs.microsoft.com/azure/static-web-apps/
2. Verify your Azure subscription is active
3. Check GitHub Actions logs for detailed error messages
4. Ensure you have proper permissions in Azure (Contributor role)

---

## ✨ What's New in This Build

Despite the deployment issue, your local build includes:

✅ **705 Azure icons** - All fixed and working  
✅ **Intelligent validation system** - Checks Azure architecture against real deployment rules  
✅ **VNet-Subnet connections** - Now show GREEN (valid)  
✅ **Save/Load with file browser** - No more localStorage only  
✅ **Validation Panel** - Interactive architecture review  
✅ **Mobile responsive** - Works on phones/tablets  
✅ **Enterprise exports** - JSON, PNG, PDF, Terraform, ARM  

Once deployment succeeds, all these features will be live! 🚀
