# Supabase URL Configuration Checklist

## Critical Configuration Required

For Google Sign-In to work, you **MUST** configure these URLs in your Supabase dashboard.

## Step-by-Step Instructions

### 1. Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project: `abtzakbsfcdmjmnmfety`
3. Go to: **Authentication** → **URL Configuration**

### 2. Configure Site URL

**Site URL** is the base URL of your application.

#### For Local Development:
```
http://localhost:5500
```

#### For Production:
```
https://yourdomain.com
```

**Important:** No trailing slash!

### 3. Configure Redirect URLs

**Redirect URLs** are where users land after OAuth login.

Click **"Add URL"** and add each of these:

#### For Local Development:
```
http://localhost:5500/app/dashboard.html
http://localhost:5500/app/students.html
http://localhost:5500/app/exams.html
http://localhost:5500/app/users.html
http://localhost:5500/index.html
```

#### For Production:
```
https://yourdomain.com/app/dashboard.html
https://yourdomain.com/app/students.html
https://yourdomain.com/app/exams.html
https://yourdomain.com/app/users.html
https://yourdomain.com/index.html
```

### 4. Save Changes

Click **"Save"** at the bottom of the page.

## Visual Guide

```
┌─────────────────────────────────────────────────┐
│ Supabase Dashboard                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Authentication > URL Configuration              │
│                                                 │
│ Site URL                                        │
│ ┌─────────────────────────────────────────┐   │
│ │ http://localhost:5500                   │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ Redirect URLs                                   │
│ ┌─────────────────────────────────────────┐   │
│ │ http://localhost:5500/app/dashboard.html│   │
│ │ http://localhost:5500/app/students.html │   │
│ │ http://localhost:5500/app/exams.html    │   │
│ │ http://localhost:5500/app/users.html    │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ [+ Add URL]                    [Save]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

## How to Find Your Local Port

If you're not sure what port you're using:

1. Open your application in the browser
2. Look at the URL bar
3. The port is the number after `localhost:`

Examples:
- `http://localhost:5500/index.html` → Port is **5500**
- `http://localhost:3000/index.html` → Port is **3000**
- `http://localhost:8080/index.html` → Port is **8080**

## Common Mistakes

### ❌ Wrong:
```
http://localhost:5500/        (trailing slash)
http://localhost/app/dashboard.html  (missing port)
https://localhost:5500/...    (https on localhost)
http://localhost:5500/dashboard.html  (missing /app/)
```

### ✅ Correct:
```
http://localhost:5500
http://localhost:5500/app/dashboard.html
```

## Verification

After configuring, test by:

1. Clear browser cache: `localStorage.clear()`
2. Go to login page
3. Click "Continue with Google"
4. Select account
5. Should redirect to dashboard and stay logged in ✅

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URL doesn't match what's configured in Supabase.

**Fix:**
1. Check the URL in the error message
2. Add that exact URL to Supabase redirect URLs
3. Save and try again

### Error: "Invalid redirect URL"

**Cause:** The URL format is incorrect.

**Fix:**
- Remove trailing slashes
- Use `http://` for localhost (not `https://`)
- Include the port number
- Match the exact path

### Still redirecting to login after OAuth

**Cause:** URL is correct but session isn't being created.

**Fix:**
1. Check browser console for errors
2. Look for: `🔵 OAuth callback detected`
3. If missing, the URL configuration is wrong
4. If present but error, check the error message

## Production Deployment

When deploying to production:

### 1. Update Supabase Configuration:

**Site URL:**
```
https://yourdomain.com
```

**Redirect URLs:**
```
https://yourdomain.com/app/dashboard.html
https://yourdomain.com/app/students.html
https://yourdomain.com/app/exams.html
https://yourdomain.com/app/users.html
```

### 2. Update Code:

In `js/supabase-auth.js`, update the `redirectTo`:

```javascript
const { data, error } = await supabaseClient.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://yourdomain.com/app/dashboard.html',  // Update this
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
});
```

### 3. Test on Production:

1. Deploy your application
2. Test Google Sign-In on production URL
3. Verify redirect works correctly
4. Check that session persists

## Quick Reference

| Setting | Local Development | Production |
|---------|------------------|------------|
| **Site URL** | `http://localhost:5500` | `https://yourdomain.com` |
| **Redirect URL** | `http://localhost:5500/app/dashboard.html` | `https://yourdomain.com/app/dashboard.html` |
| **Protocol** | `http://` | `https://` |
| **Port** | Include (`:5500`) | Not needed |

## Need Help?

If you're still having issues:

1. **Check browser console** (F12) for error messages
2. **Check Supabase logs** in dashboard
3. **Verify URLs match exactly** (no typos, correct port)
4. **Clear browser cache** and try again
5. **Test in incognito mode** to rule out cache issues

---

**Remember:** The redirect URL in Supabase must **exactly match** where your app redirects users after OAuth!
