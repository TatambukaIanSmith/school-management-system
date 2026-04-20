# 🔐 Google Auth & Email Verification Setup

Complete guide to enable Google Sign-In and Email Verification in your Supabase project.

## 🎯 What You'll Get

- ✅ **Google Sign-In** - One-click authentication
- ✅ **Email Verification** - Confirm user emails before access
- ✅ **Password Reset** - Secure password recovery
- ✅ **Resend Verification** - If users don't receive email

---

## 1️⃣ Enable Google Authentication

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project or create a new one
3. Click **"Create Credentials"** > **"OAuth client ID"**
4. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: **School Registration System**
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"** through all steps

5. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **School Registration Web**
   
6. **Authorized JavaScript origins:**
   ```
   http://localhost:8000
   http://127.0.0.1:8000
   https://abtzakbsfcdmjmnmfety.supabase.co
   ```

7. **Authorized redirect URIs:**
   ```
   https://abtzakbsfcdmjmnmfety.supabase.co/auth/v1/callback
   ```

8. Click **"Create"**
9. **Copy your Client ID and Client Secret**

### Step 2: Configure in Supabase

1. Go to: https://app.supabase.com/project/abtzakbsfcdmjmnmfety/auth/providers
2. Find **"Google"** in the list
3. Toggle **"Enable Sign in with Google"** to ON
4. Paste your **Client ID**
5. Paste your **Client Secret**
6. Click **"Save"**

### Step 3: Test Google Sign-In

1. Open `auth/login.html`
2. Click **"Continue with Google"**
3. Select your Google account
4. You'll be redirected back and logged in! 🎉

---

## 2️⃣ Enable Email Verification

### Step 1: Configure Email Settings in Supabase

1. Go to: https://app.supabase.com/project/abtzakbsfcdmjmnmfety/auth/templates
2. Click **"Email Templates"**
3. You'll see templates for:
   - **Confirm signup** - Sent when user signs up
   - **Magic Link** - For passwordless login
   - **Change Email Address** - When user changes email
   - **Reset Password** - For password recovery

4. Customize the **"Confirm signup"** template (optional):
   ```html
   <h2>Confirm your signup</h2>
   <p>Follow this link to confirm your email:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
   ```

### Step 2: Enable Email Confirmation

1. Go to: https://app.supabase.com/project/abtzakbsfcdmjmnmfety/auth/url-configuration
2. Find **"Email Confirmation"** section
3. Toggle **"Enable email confirmations"** to ON
4. Set **"Redirect URL"** to:
   ```
   https://yourdomain.com/app/dashboard.html
   ```
   Or for testing:
   ```
   http://localhost:8000/app/dashboard.html
   ```
5. Click **"Save"**

### Step 3: Test Email Verification

1. Open `auth/signup.html`
2. Sign up with a new email
3. You'll see: **"Please check your email to verify your account!"**
4. Check your email inbox
5. Click the verification link
6. You'll be redirected to the dashboard! ✅

---

## 3️⃣ Configure Email Provider (Optional)

By default, Supabase uses their email service (limited to 3 emails/hour in free tier).

### For Production: Use Your Own SMTP

1. Go to: https://app.supabase.com/project/abtzakbsfcdmjmnmfety/settings/auth
2. Scroll to **"SMTP Settings"**
3. Toggle **"Enable Custom SMTP"**
4. Enter your SMTP details:
   - **Host**: smtp.gmail.com (for Gmail)
   - **Port**: 587
   - **Username**: your-email@gmail.com
   - **Password**: your-app-password
   - **Sender email**: your-email@gmail.com
   - **Sender name**: School Registration System

5. Click **"Save"**

**Gmail App Password:**
- Go to: https://myaccount.google.com/apppasswords
- Create an app password for "Mail"
- Use that password in SMTP settings

---

## 4️⃣ How It Works

### Email Verification Flow:

```
1. User signs up
   ↓
2. Supabase sends verification email
   ↓
3. User clicks link in email
   ↓
4. Supabase verifies email
   ↓
5. User is redirected to dashboard
   ↓
6. User can now access the system
```

### Google Sign-In Flow:

```
1. User clicks "Continue with Google"
   ↓
2. Google popup appears
   ↓
3. User selects account
   ↓
4. Google sends user info to Supabase
   ↓
5. Supabase creates/logs in user
   ↓
6. User is redirected to dashboard
```

---

## 5️⃣ Code Examples

### Sign Up with Email Verification

```javascript
const result = await supabaseSignUp(email, password, fullName);

if (result.success) {
  if (result.message) {
    // Email verification required
    alert(result.message); // "Please check your email..."
  } else {
    // No verification needed (disabled in settings)
    window.location.href = '../app/dashboard.html';
  }
}
```

### Resend Verification Email

```javascript
const result = await supabaseResendVerification(email);

if (result.success) {
  alert('Verification email sent!');
}
```

### Google Sign-In

```javascript
// Already implemented in your "Continue with Google" button
await supabaseSignInWithGoogle();
// User will be redirected to Google, then back to your app
```

---

## 6️⃣ Security Best Practices

### Email Verification:
- ✅ **Always enable** for production
- ✅ Prevents fake email signups
- ✅ Confirms user owns the email
- ✅ Reduces spam accounts

### Google Sign-In:
- ✅ More secure than passwords
- ✅ No password to remember
- ✅ Google handles security
- ✅ Faster signup process

### Tokens:
- ✅ Supabase handles all token management
- ✅ JWT tokens are secure and encrypted
- ✅ Tokens expire automatically
- ✅ Refresh tokens keep users logged in

---

## 7️⃣ Troubleshooting

### Google Sign-In Not Working:
- Check authorized origins match exactly
- Make sure redirect URI is correct
- Verify Client ID and Secret are correct
- Check browser console for errors

### Email Not Received:
- Check spam folder
- Verify email address is correct
- Check Supabase email quota (3/hour on free tier)
- Set up custom SMTP for unlimited emails

### Verification Link Expired:
- Links expire after 24 hours
- Use `supabaseResendVerification()` to send new link

### "Invalid redirect URL":
- Add your domain to allowed redirect URLs
- Go to: Auth > URL Configuration
- Add your URL to the list

---

## ✅ Checklist

- [ ] Created Google OAuth credentials
- [ ] Added authorized origins and redirect URIs
- [ ] Configured Google in Supabase
- [ ] Tested Google Sign-In
- [ ] Enabled email confirmation in Supabase
- [ ] Customized email templates (optional)
- [ ] Tested email verification
- [ ] Set up custom SMTP (optional, for production)
- [ ] Added error handling in your code

---

## 🎉 You're Done!

Your School Registration System now has:
- ✅ Google Sign-In
- ✅ Email Verification
- ✅ Secure Authentication
- ✅ Password Reset

**Users can now sign up securely and verify their emails!** 🚀
