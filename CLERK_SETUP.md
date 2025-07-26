# 🔐 Clerk Authentication Setup Guide

## Overview
This guide will help you set up Clerk.dev authentication for your Ravens TimeSheet application.

## 📋 Prerequisites
- Clerk.dev account (free tier available)
- Ravens TimeSheet project already deployed to Railway
- Access to your environment variables

## 🚀 Step 1: Create Clerk Application

### 1.1 Sign up for Clerk
1. Go to [https://dashboard.clerk.dev/](https://dashboard.clerk.dev/)
2. Sign up for a free account using GitHub, Google, or email
3. Create a new application

### 1.2 Configure Your Application
1. **Application Name**: "Ravens TimeSheet"
2. **Sign-in Options**: 
   - ✅ Email address
   - ✅ Google (recommended)
   - ✅ Phone number (optional)
3. **Choose your instance type**: Development (free)

## 🔑 Step 2: Get Your API Keys

### 2.1 From Clerk Dashboard
1. Go to **"API Keys"** in the left sidebar
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

### 2.2 Add to Environment Variables

#### For Local Development (.env):
```bash
# Add to your .env file
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

#### For Railway Production:
1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Variables** tab
4. Add these environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your publishable key
   - `CLERK_SECRET_KEY`: Your secret key

## 🌐 Step 3: Configure Allowed Origins

### 3.1 In Clerk Dashboard
1. Go to **"Domains"** in the left sidebar
2. Add your allowed domains:
   - `http://localhost:5173` (for development)
   - `http://localhost:3001` (for API)
   - `https://your-railway-app.up.railway.app` (your production URL)

### 3.2 Sign-in/Sign-up URLs
1. Go to **"Paths"** in Clerk dashboard
2. Configure redirect URLs:
   - **Sign-in URL**: `/sign-in` (or use modal mode)
   - **Sign-up URL**: `/sign-up` (or use modal mode)
   - **User Profile URL**: `/user-profile`

## 🎨 Step 4: Customize Authentication UI (Optional)

### 4.1 Appearance
1. Go to **"Customization" → "Appearance"**
2. Choose theme: Light/Dark
3. Customize colors to match Ravens Marine brand:
   - Primary: `#1e40af` (blue)
   - Background: `#f8f9fa`

### 4.2 Branding
1. Upload Ravens Marine logo
2. Set application name: "Ravens TimeSheet"
3. Add company information

## 🔧 Step 5: Test Authentication

### 5.1 Local Testing
1. Start your development server:
   ```bash
   npm run dev:full
   ```
2. Open `http://localhost:5173`
3. You should see a "Sign In" button
4. Click it and test the sign-up/sign-in flow

### 5.2 Production Testing
1. Deploy your changes to Railway
2. Test authentication on your live URL
3. Verify protected routes work correctly

## 📊 Step 6: User Management Features

### 6.1 Available Features
- ✅ **User Registration**: Automatic with email verification
- ✅ **Password Reset**: Built-in functionality
- ✅ **Profile Management**: Users can update their info
- ✅ **Session Management**: Automatic token refresh
- ✅ **Multi-factor Authentication**: Optional 2FA

### 6.2 Admin Features
- **User Dashboard**: View/manage users in Clerk dashboard
- **Analytics**: User sign-up and activity metrics
- **Webhooks**: Get notified of user events

## 🛡️ Step 7: Security Configuration

### 7.1 Session Settings
1. Go to **"Sessions"** in Clerk dashboard
2. Configure session duration:
   - **Inactive session**: 7 days
   - **Maximum session**: 30 days

### 7.2 Password Requirements
1. Go to **"User & Authentication" → "Email, Phone, Username"**
2. Set password requirements:
   - Minimum 8 characters
   - Require special characters
   - Require numbers

## 🚀 Step 8: Production Deployment

### 8.1 Environment Variables for Production
Ensure these are set in Railway:
```bash
NODE_ENV=production
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_key
```

### 8.2 Domain Configuration
1. Add your custom domain to Clerk
2. Update CORS settings if needed
3. Test authentication flow on production

## 📱 Step 9: Mobile Considerations

### 9.1 Mobile Authentication
- Works automatically with responsive design
- Touch-optimized sign-in modal
- Supports mobile browsers and PWA installation

### 9.2 Testing on Mobile
1. Access your Railway URL on mobile
2. Test sign-up/sign-in flow
3. Verify camera and other features work when authenticated

## 🔍 Step 10: Troubleshooting

### Common Issues:

#### 10.1 "Invalid publishable key"
- Check environment variable spelling
- Ensure key starts with `pk_test_` or `pk_live_`
- Restart development server after adding .env

#### 10.2 CORS errors
- Add your domain to Clerk dashboard
- Check Railway environment variables
- Verify API URLs in Clerk settings

#### 10.3 Authentication not working
- Check browser console for errors
- Verify secret key is set on backend
- Test with incognito/private browsing

### Debug Mode:
Add this to your .env for debugging:
```bash
CLERK_DEBUG=true
```

## 📞 Support

### Get Help:
- **Clerk Documentation**: [https://clerk.dev/docs](https://clerk.dev/docs)
- **Clerk Discord**: Community support
- **Ravens TimeSheet Issues**: Create GitHub issue if needed

## ✅ Success Checklist

- [ ] Clerk application created
- [ ] API keys configured in Railway
- [ ] Domains added to Clerk
- [ ] Local authentication tested
- [ ] Production authentication tested
- [ ] User management working
- [ ] Mobile authentication verified
- [ ] All timesheet features working with auth

**Congratulations! 🎉 Your Ravens TimeSheet application now has secure user authentication!** 