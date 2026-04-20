# Google Authentication Setup Guide

This guide will help you set up Google OAuth 2.0 authentication for your School Registration System.

## 📋 Prerequisites

- A Google account
- Access to Google Cloud Console
- Your application running on a web server (localhost or production)

## 🚀 Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: "School Registration System"
5. Click "Create"

### Step 2: Enable Google Identity Services

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Identity Services"
3. Click on it and click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: School Registration System
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. Skip "Scopes" (click "Save and Continue")
7. Add test users if needed (your email)
8. Click "Save and Continue"

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "OAuth client ID"
3. Select **Application type**: Web application
4. **Name**: School Registration System Web Client
5. **Authorized JavaScript origins**: Add these URLs:
   ```
   http://localhost
   http://localhost:8000
   http://localhost:3000
   http://127.0.0.1
   http://127.0.0.1:8000
   ```
   **For production, add:**
   ```
   https://yourdomain.com
   ```
6. **Authorized redirect URIs**: (Leave empty for now)
7. Click "Create"
8. **IMPORTANT**: Copy your **Client ID** - it looks like:
   ```
   123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```

### Step 5: Configure Your Application

1. Open `js/google-auth.js`
2. Find this line:
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';
   ```
3. Replace it with your actual Client ID:
   ```javascript
   const GOOGLE_CLIENT_ID = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
   ```
4. Save the file

### Step 6: Test the Integration

1. Start your local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server -p 8000
   ```

2. Open your browser to `http://localhost:8000`
3. Go to the login page
4. Click "Continue with Google"
5. Sign in with your Google account
6. You should be redirected to the dashboard!

## 🔒 Security Notes

### For Development:
- Use `http://localhost` for testing
- Add your test email to the OAuth consent screen test users

### For Production:
- **NEVER** commit your Client ID to public repositories (though it's not a secret, it's best practice)
- Use HTTPS for production domains
- Add only your production domain to authorized origins
- Consider implementing additional security measures:
  - CSRF tokens
  - State parameter validation
  - Nonce validation

## 🎯 How It Works

1. **User clicks "Continue with Google"**
   - Google Sign-In popup appears
   - User selects their Google account

2. **Google authenticates the user**
   - Returns a JWT token with user info
   - Token contains: email, name, picture, Google ID

3. **Your app processes the token**
   - Checks if user exists in localStorage
   - If exists: logs them in
   - If new: creates account with default "staff" role
   - Creates session and redirects to dashboard

4. **User is logged in**
   - Session stored in localStorage
   - User can access the system

## 🛠️ Customization

### Change Default Role for Google Sign-Ups

In `js/google-auth.js`, find:
```javascript
role: 'staff', // Default role for Google sign-ups
```

Change to any of:
- `'administrator'`
- `'registrar'`
- `'teacher'`
- `'counselor'`
- `'staff'`
- `'security'`
- `'student'`

### Require Admin Approval

To prevent automatic account creation, modify the `handleGoogleCallback` function to:
1. Create user with `isActive: false`
2. Notify administrators
3. Require admin to activate the account

## 🐛 Troubleshooting

### "Google Sign-In is not available"
- Check your internet connection
- Verify the Google Identity Services script is loaded
- Check browser console for errors

### "Please enable popups"
- Allow popups for your domain
- Try a different browser
- Check if browser extensions are blocking popups

### "Invalid Client ID"
- Verify you copied the entire Client ID
- Check for extra spaces or characters
- Ensure the Client ID is from the correct project

### "Unauthorized JavaScript origin"
- Add your domain to authorized origins in Google Cloud Console
- Wait a few minutes for changes to propagate
- Clear browser cache and try again

### "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add your email as a test user
- Verify the app is not in "Testing" mode (or add test users)

## 📚 Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Overview](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google Identity Services API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 Client ID
- [ ] Added authorized JavaScript origins
- [ ] Copied Client ID to `js/google-auth.js`
- [ ] Tested on localhost
- [ ] Verified user creation/login works
- [ ] (Production) Added production domain to authorized origins
- [ ] (Production) Switched OAuth consent screen to "Published"

## 🎉 You're Done!

Your School Registration System now supports Google Authentication! Users can sign in with their Google accounts and get instant access to the system.
