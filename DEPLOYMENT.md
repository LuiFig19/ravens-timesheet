# 🚀 Ravens TimeSheet - Deployment Guide

This guide provides instructions for deploying Ravens TimeSheet to reliable, free hosting services.

## 🎯 Recommended Services (Free & Reliable)

### 1. **Railway** (Recommended)
- ✅ **Free Tier**: $5 worth of usage per month
- ✅ **PostgreSQL**: Included
- ✅ **99.9% Uptime**
- ✅ **Auto-scaling**
- ✅ **Git integration**

### 2. **Render**
- ✅ **Free Tier**: 750 hours/month
- ✅ **PostgreSQL**: Included
- ✅ **Auto-deploys from Git**
- ✅ **SSL certificates**

### 3. **Fly.io** (Alternative)
- ✅ **Free Tier**: 3 shared VMs
- ✅ **PostgreSQL**: Available
- ✅ **Global edge network**

## 🚀 Deploy to Railway (Recommended)

### Step 1: Prepare Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Push to GitHub (create repo first)
git remote add origin https://github.com/yourusername/ravens-timesheet.git
git push -u origin main
```

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your ravens-timesheet repository
5. Railway will automatically:
   - Detect the Dockerfile
   - Create PostgreSQL database
   - Deploy the application

### Step 3: Configure Environment Variables
In Railway dashboard:
1. Go to your project
2. Click "Variables" tab
3. Add these variables:
   ```
   NODE_ENV=production
   DATABASE_URL=[automatically set by Railway]
   PORT=3001
   ```

### Step 4: Access Your App
- Railway will provide a URL like: `https://ravens-timesheet-production.up.railway.app`
- Your app will be live and accessible worldwide!

## 🎨 Deploy to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create Database
1. Click "New" → "PostgreSQL"
2. Name: `ravens-timesheet-db`
3. Plan: Free
4. Create database

### Step 3: Deploy Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configuration:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`
   - **Environment**: Node
   - **Plan**: Free

### Step 4: Environment Variables
Add in Render dashboard:
```
NODE_ENV=production
DATABASE_URL=[copy from your PostgreSQL service]
PORT=3001
```

## 🛠️ Pre-Deployment Checklist

- ✅ `package.json` has "start" script
- ✅ `Dockerfile` is configured
- ✅ Database connection uses environment variables
- ✅ CORS is configured for production
- ✅ Frontend build works (`npm run build`)

## 🔧 Production Environment Variables

```bash
# Required
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
PORT=3001

# Optional
VITE_API_URL=https://your-app-domain.com
```

## 📊 Post-Deployment Setup

### 1. Initialize Database
The database will be automatically set up on first run.

### 2. Test the Application
- Visit your deployed URL
- Test all features:
  - Employee management
  - Timesheet processing
  - Job management
  - Mobile responsiveness

### 3. Configure Custom Domain (Optional)
Both Railway and Render support custom domains in their free tiers.

## 🔒 Security Notes

- ✅ **HTTPS**: Automatically provided
- ✅ **Environment Variables**: Secure storage
- ✅ **Database**: Managed and backed up
- ✅ **CORS**: Properly configured

## 📱 Mobile Access

Your deployed app will be accessible from any device:
- **Desktop**: Full functionality
- **Mobile**: Responsive design
- **Offline**: localStorage fallback

## 🚨 Troubleshooting

### Build Fails
```bash
# Test locally first
npm ci
npm run build
npm run start
```

### Database Connection Issues
- Check DATABASE_URL format
- Ensure database is created
- Verify network connectivity

### CORS Errors
- Check origin configuration in server/index.js
- Ensure HTTPS is used in production

## 📈 Monitoring & Uptime

### Railway
- Built-in metrics dashboard
- Automatic health checks
- 99.9% uptime SLA

### Render
- Service status dashboard
- Automatic restarts on failure
- Health check endpoints

## 💰 Cost Optimization

### Railway Free Tier
- $5/month usage allowance
- PostgreSQL included
- Sufficient for moderate traffic

### Render Free Tier
- 750 hours/month (can cover 24/7)
- Auto-sleep after 15 min inactivity
- PostgreSQL included

## 🔄 Updates & Maintenance

### Automatic Deployments
Both services auto-deploy when you push to your main branch.

### Manual Deployment
```bash
git add .
git commit -m "Update application"
git push origin main
```

## 🎯 Final Result

Your Ravens TimeSheet will be:
- ✅ **Globally accessible**
- ✅ **99.9% uptime**
- ✅ **Auto-scaling**
- ✅ **HTTPS enabled**
- ✅ **Mobile-responsive**
- ✅ **Database backed**

Perfect for production use! 🚀 