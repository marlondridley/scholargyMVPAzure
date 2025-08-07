# 🔐 OAuth Redirect URL Setup Guide

## **Supabase Configuration**

### 1. **Login to Supabase Dashboard**
- Go to [supabase.com](https://supabase.com)
- Select your Scholargy project

### 2. **Configure Authentication Settings**
1. Navigate to **Authentication** → **Settings**
2. Scroll down to **URL Configuration**
3. Add your redirect URLs:

#### **For Development:**
```
http://localhost:3000/auth/callback
```

#### **For Production (Azure App Service):**
```
https://your-app-name.azurewebsites.net/auth/callback
```

### 3. **Google OAuth Provider Setup**
1. Go to **Authentication** → **Providers**
2. Click on **Google**
3. Enable Google provider
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Set the redirect URL in Google Cloud Console to match your Supabase redirect URL

### 4. **Google Cloud Console Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select your project
3. Go to **APIs & Services** → **Credentials**
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

## **Environment Variables**

Make sure these are set in your Azure App Settings:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key

# Backend Supabase (for server-side auth)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## **Testing the OAuth Flow**

1. **Development Testing:**
   ```bash
   npm start
   ```
   - Go to `http://localhost:3000`
   - Click "Sign in with Google"
   - Should redirect to `http://localhost:3000/auth/callback`

2. **Production Testing:**
   - Deploy to Azure App Service
   - Test OAuth flow at your production URL
   - Verify redirect to `/auth/callback` works

## **Troubleshooting**

### **Common Issues:**

1. **"Invalid redirect URI" error:**
   - Check that the redirect URL in Supabase matches exactly
   - Ensure no trailing slashes or typos

2. **"OAuth provider not configured":**
   - Verify Google provider is enabled in Supabase
   - Check that Client ID and Secret are correct

3. **Callback not working:**
   - Ensure `/auth/callback` route is properly set up in your app
   - Check that AuthCallback component is imported and rendered

### **Debug Steps:**
1. Check browser console for errors
2. Verify URL parameters in callback
3. Test with different browsers
4. Check Supabase logs for authentication events

## **Security Notes**

- Never expose your service role key in frontend code
- Use environment variables for all sensitive configuration
- Regularly rotate OAuth client secrets
- Monitor authentication logs for suspicious activity

---

**Last Updated**: December 2024
**Status**: Ready for deployment
