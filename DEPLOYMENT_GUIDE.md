# Deployment Guide for Render.com

This guide will help you deploy the Veritas Blue Web App to Render.com with the optimized configuration that excludes heavy dependencies for faster deployment.

## 🚀 Quick Deployment Steps

### 1. **Prepare Your Repository**
Ensure your latest changes are pushed to GitHub:
```bash
git add .
git commit -m "Deploy-ready configuration with optional graph generation"
git push origin main
```

### 2. **Create a New Web Service on Render.com**
1. Go to [Render.com](https://render.com) and log in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your `veritas-blue-web-clean` repository

### 3. **Configure Build & Deploy Settings**

**Basic Settings:**
- **Name**: `veritas-blue-web` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: (leave empty)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Auto-Deploy**: `Yes`
- **Node Version**: Latest (or specify `18.x` if needed)

### 4. **Set Environment Variables**

In the Render dashboard, add these environment variables:

#### **🔧 Essential Variables (Required)**
```
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
```

#### **🔥 Firebase Admin SDK (Required)**
You need to extract values from your `ultrasat-5e4c4-369f564bdaef.json` file:

```
FIREBASE_PROJECT_ID=ultrasat-5e4c4
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_from_json
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour_private_key_here\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ultrasat-5e4c4.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id_from_json
```

**⚠️ Important:** For `FIREBASE_PRIVATE_KEY`, copy the entire private key including the BEGIN/END lines, and replace actual line breaks with `\n`.

#### **🎨 Optional Variables (For Enhanced Features)**
```
REACT_APP_API_URL=https://your-app-name.onrender.com/api
ASSISTANT_DAILY_QUOTA=10000
ASSISTANT_MAX_TOKENS=1000
```

#### **❌ Do NOT Set These (To Keep Deployment Lightweight)**
- `ENABLE_GRAPH_GENERATION` - Leave unset to disable heavy dependencies
- `OPENAI_API_KEY` - Only needed for graph generation
- `CHROME_PATH` - Only needed for Puppeteer

### 5. **Deploy**
Click "Create Web Service" and wait for deployment (usually 5-10 minutes).

## 🔧 Post-Deployment Configuration

### Update Frontend API URL
After deployment, update your frontend to point to the correct API:
1. Note your Render app URL (e.g., `https://veritas-blue-web.onrender.com`)
2. Add this environment variable in Render:
   ```
   REACT_APP_API_URL=https://your-app-name.onrender.com/api
   ```
3. Redeploy the service

### Verify Deployment
Visit your app URL and check:
- ✅ App loads without errors
- ✅ Authentication works
- ✅ Database operations work
- ✅ Graph generation shows as "disabled" (this is expected)

## 🏠 Local Development Setup

### 1. **Clone and Install**
```bash
git clone your-repo-url
cd veritas-blue-web-clean
npm install
```

### 2. **Environment Setup**
Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` file with your actual API keys:
```bash
ENABLE_GRAPH_GENERATION=true
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

### 3. **Run Locally**
```bash
# Development mode (frontend + backend)
npm run dev

# Or run separately:
npm run start-frontend  # React app on port 3000
npm run start-api      # API server on port 3001
```

## 🎨 Enabling Graph Generation (Optional)

If you want to enable graph generation features later:

### On Render.com:
1. Add environment variable: `ENABLE_GRAPH_GENERATION=true`
2. Add API keys: `OPENAI_API_KEY` and/or `GEMINI_API_KEY`
3. Redeploy the service

### Locally:
1. Set `ENABLE_GRAPH_GENERATION=true` in your `.env` file
2. Install optional dependencies: `npm install puppeteer`
3. Restart your development server

## 🐛 Troubleshooting

### **Build Failures**
- Check that all required environment variables are set
- Ensure Firebase credentials are correctly formatted
- Check build logs for specific errors

### **Runtime Errors**
- Verify Firebase Admin initialization in logs
- Check that `NODE_ENV=production` is set
- Ensure API endpoints return 200/503 status appropriately

### **Graph Generation Issues**
- If enabled but not working, check API key environment variables
- For local development, ensure Chrome/Puppeteer is installed
- Graph generation is intentionally disabled in production for performance

### **Common Environment Variable Issues**
- `FIREBASE_PRIVATE_KEY` must have `\n` for line breaks
- Don't include quotes around environment variable values in Render
- Case sensitivity matters for all variable names

## 📊 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Express API    │    │   Firebase      │
│   (Frontend)    │◄──►│   (Backend)      │◄──►│   (Database)    │
│   Port 3000     │    │   Port 3001      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         │                        │                       │
    Static Build              Environment           Admin SDK
    (Production)               Variables           (Auth/Firestore)
```

## 🔄 Update Deployment

To update your deployed app:
1. Push changes to GitHub
2. Render will auto-deploy (if enabled)
3. Or manually trigger deploy in Render dashboard

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test locally first
4. Check Firebase console for auth/database issues

---

**Your app is now ready for production deployment! 🎉** 