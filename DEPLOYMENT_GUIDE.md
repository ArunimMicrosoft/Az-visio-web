# 🚀 Azure Architecture Designer - Deployment Guide

## 📋 Deployment Options Comparison

| Platform | Cost | Difficulty | Best For |
|----------|------|------------|----------|
| **Azure Static Web Apps** ⭐ | Free | Easy | Production, Azure users |
| GitHub Pages | Free | Very Easy | Demo, Portfolio |
| Netlify | Free | Easy | Quick deployment |
| Vercel | Free | Easy | React apps |
| Azure App Service | $13/mo | Medium | Enterprise |

---

## 🎯 Option 1: Azure Static Web Apps (RECOMMENDED)

### Prerequisites:
- ✅ Azure account ([free tier available](https://azure.microsoft.com/free/))
- ✅ GitHub account
- ✅ Your code in a GitHub repository

### Step 1: Prepare Your App

1. **Update `package.json`** (already configured):
   ```json
   {
     "scripts": {
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

2. **Test production build locally:**
   ```bash
   npm run build
   npm run preview
   ```

3. **Verify the `dist/` folder is created** with your app.

### Step 2: Deploy to Azure Static Web Apps

#### Option A: Using Azure Portal (GUI)

1. **Go to Azure Portal:** https://portal.azure.com
2. **Create a new resource** → Search for "Static Web App"
3. **Click "Create"**
4. **Fill in details:**
   - **Resource Group:** Create new or select existing
   - **Name:** `azure-architecture-designer`
   - **Region:** Choose closest to you
   - **Plan:** Free (0 GB bandwidth)
   - **Source:** GitHub
   - **Organization:** Your GitHub username
   - **Repository:** Your repo name
   - **Branch:** `main`
   - **Build Presets:** Vite
   - **App location:** `/`
   - **Output location:** `dist`

5. **Click "Review + Create"**
6. **Wait 2-3 minutes** for deployment
7. **Your app is live!** Azure provides a URL like: `https://xyz.azurestaticapps.net`

#### Option B: Using VS Code Extension

1. **Install Extension:** "Azure Static Web Apps" in VS Code
2. **Open Command Palette** (Ctrl+Shift+P)
3. **Run:** "Static Web Apps: Create Static Web App..."
4. **Follow the prompts** (same as above)
5. **Automatic deployment** via GitHub Actions

#### Option C: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name rg-azure-designer --Deployment/westus2

# Create static web app
az staticwebapp create \
  --name azure-architecture-designer \
  --resource-group rg-azure-designer \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --location "westus2" \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

### Step 3: Configure Custom Domain (Optional)

1. **Go to your Static Web App** in Azure Portal
2. **Click "Custom domains"**
3. **Add your domain** (e.g., `azure-designer.yourdomain.com`)
4. **Add DNS records** as instructed
5. **Free SSL certificate** is automatically provisioned

### Step 4: Environment Variables (if needed)

If you add any API keys or configs in the future:

1. **Go to Configuration** in Azure Portal
2. **Add application settings**
3. **Restart the app**

---

## 🎯 Option 2: GitHub Pages (EASIEST)

### Step 1: Update `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/YOUR_REPO_NAME/',  // Change this to your repo name
})
```

### Step 2: Install gh-pages package

```bash
npm install --save-dev gh-pages
```

### Step 3: Update `package.json`

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Step 4: Deploy

```bash
npm run deploy
```

### Step 5: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages` → `/ (root)`
4. **Save**
5. **Your app is live at:** `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

## 🎯 Option 3: Netlify (DRAG & DROP)

### Method 1: Drag & Drop

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Go to:** https://app.netlify.com/drop
3. **Drag the `dist/` folder** to the browser
4. **Done!** Your app is live at: `https://random-name.netlify.app`

### Method 2: GitHub Integration

1. **Go to:** https://app.netlify.com
2. **Click:** "Add new site" → "Import an existing project"
3. **Connect to GitHub**
4. **Select your repository**
5. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Deploy!**

---

## 🎯 Option 4: Vercel (OPTIMIZED FOR REACT)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up and deploy: Y
# - Scope: Your username
# - Link to existing project: N
# - Project name: azure-architecture-designer
# - Directory: ./
# - Override settings: N
```

### Step 3: Production Deployment

```bash
vercel --prod
```

**Your app is live!** Vercel provides a URL like: `https://azure-architecture-designer.vercel.app`

---

## 🎯 Option 5: Azure App Service

### Using Azure CLI:

```bash
# Create App Service Plan
az appservice plan create \
  --name asp-azure-designer \
  --resource-group rg-azure-designer \
  --sku F1 --is-linux

# Create Web App
az webapp create \
  --name azure-architecture-designer \
  --resource-group rg-azure-designer \
  --plan asp-azure-designer \
  --runtime "NODE|18-lts"

# Deploy from local git
npm run build
cd dist
git init
git add -A
git commit -m "Initial commit"
az webapp deployment source config-local-git \
  --name azure-architecture-designer \
  --resource-group rg-azure-designer
git remote add azure <GIT_URL_FROM_ABOVE>
git push azure master
```

---

## 📊 Cost Comparison

| Platform | Free Tier | Paid Tier | Custom Domain | SSL |
|----------|-----------|-----------|---------------|-----|
| **Azure Static Web Apps** | 100 GB/mo | $9/mo | ✅ | ✅ Free |
| **GitHub Pages** | 100 GB/mo | N/A | ✅ | ✅ Free |
| **Netlify** | 100 GB/mo | $19/mo | ✅ | ✅ Free |
| **Vercel** | 100 GB/mo | $20/mo | ✅ | ✅ Free |
| **Azure App Service** | None | $13/mo | ✅ | ✅ Free |

---

## 🔧 Pre-Deployment Checklist

Before deploying, ensure:

- ✅ `npm run build` works without errors
- ✅ All icon paths are correct (already fixed)
- ✅ No console errors in production build
- ✅ All features work in preview mode (`npm run preview`)
- ✅ Remove any `console.log()` debug statements (optional)
- ✅ Update `README.md` with live demo link

---

## 🎨 Post-Deployment Tasks

After deployment:

1. **Test all features:**
   - ✅ Drag and drop icons
   - ✅ Create connections
   - ✅ LED validation works
   - ✅ Export PNG/PDF
   - ✅ Save/Load diagrams
   - ✅ Help overlay

2. **Add custom domain** (optional)
3. **Set up monitoring** (Azure Application Insights)
4. **Add analytics** (Google Analytics or Azure)
5. **Share the link!** 🎉

---

## 📝 GitHub Actions CI/CD (Auto-Deploy)

Azure Static Web Apps automatically creates a GitHub Actions workflow.

The file is created at: `.github/workflows/azure-static-web-apps-<name>.yml`

Every time you push to `main` branch, your app auto-deploys!

---

## 🆘 Troubleshooting

### Issue: Blank page after deployment
**Solution:** Check `base` in `vite.config.js` - should be `/` for root deployments

### Issue: Icons not loading
**Solution:** Ensure `public/icons/` folder is included in the build

### Issue: 404 on refresh
**Solution:** Add redirect rules (already handled by SPA frameworks in Azure Static Web Apps)

### Issue: Build fails
**Solution:** 
```bash
# Test locally first
npm ci
npm run build
npm run preview
```

---

## 🎯 Recommended Approach

**For your Azure Architecture Designer app, I recommend:**

1. **Development/Testing:** Deploy to **GitHub Pages** (free & fast)
2. **Production:** Deploy to **Azure Static Web Apps** (professional & Azure-themed)
3. **Alternative:** **Netlify** (if you want drag-drop simplicity)

---

## 🚀 Quick Start Commands

### Azure Static Web Apps:
```bash
# Option 1: Use VS Code extension
# Option 2: Use Azure Portal GUI
# Option 3: Use Azure CLI (see above)
```

### GitHub Pages:
```bash
npm install --save-dev gh-pages
# Update vite.config.js and package.json
npm run deploy
```

### Netlify:
```bash
npm run build
# Drag dist/ folder to https://app.netlify.com/drop
```

### Vercel:
```bash
npm install -g vercel
vercel
```

---

**Need help?** Let me know which platform you want to deploy to, and I can create the specific configuration files! 🎉
