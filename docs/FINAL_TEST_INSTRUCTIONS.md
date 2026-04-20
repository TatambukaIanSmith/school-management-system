# Final Test Instructions - Google Sign-In

## The Fix Applied

**Problem:** Dashboard was missing Supabase scripts, so it couldn't handle the OAuth callback.

**Solution:** Added Supabase scripts to `app/dashboard.html`:
```html
<script src="../js/supabase.min.js"></script>
<script src="../js/supabase-config.js"></script>
<script src="../js/supabase-auth.js"></script>
```

## Test Now (Step by Step)

### Step 1: Clear Everything
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
```

### Step 2: Hard Refresh
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Step 3: Go to Login Page
Navigate to: `http://localhost:5500/auth/login.html`

### Step 4: Open Console
Press `F12` to open browser console

### Step 5: Click "Continue with Google"

**Expected console output:**
```
✅ Supabase initialized successfully
✅ Initializing Supabase Auth...
🔵 Starting Google Sign-In...
✅ Supabase Client available
OAuth Response: { data: { url: "https://..." }, error: null }
🔵 Redirecting to Google: https://accounts.google.com/...
```

### Step 6: Select Your Google Account

### Step 7: After Redirect Back

**Expected console output:**
```
✅ Supabase initialized successfully
✅ Initializing Supabase Auth...
🔵 OAuth callback detected, exchanging code for session...
✅ Session exchange successful
Auth event: SIGNED_IN
User signed in: your-email@gmail.com
🔵 Handling authenticated user: your-email@gmail.com
✅ Profile found, updating last login
✅ Session created, user authenticated
Dashboard: DOMContentLoaded fired
```

**Expected result:**
- ✅ Dashboard loads
- ✅ You stay logged in
- ✅ Your name appears in navbar
- ✅ No redirect back to login

## If It Still Doesn't Work

### Check 1: Supabase URL Configuration

Go to: **Supabase Dashboard → Authentication → URL Configuration**

Verify:
- **Site URL:** `http://localhost:5500` (or your port)
- **Redirect URLs:** `http://localhost:5500/app/dashboard.html`

### Check 2: Console Errors

Look for these specific errors:

**"Supabase client not initialized"**
- Means: `supabase.min.js` didn't load
- Fix: Check file exists at `js/supabase.min.js`

**"OAuth callback detected" but no "Session exchange successful"**
- Means: Code exchange failed
- Fix: Check Supabase redirect URL configuration

**"redirect_uri_mismatch"**
- Means: Redirect URL doesn't match Supabase config
- Fix: Add exact URL to Supabase dashboard

### Check 3: Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Continue with Google"
4. Look for:
   - `supabase.min.js` - Should load successfully
   - `supabase-config.js` - Should load successfully
   - `supabase-auth.js` - Should load successfully

## What Should Happen (Complete Flow)

```
1. Login Page Loads
   ↓
2. Supabase scripts load
   ↓
3. Click "Continue with Google"
   ↓
4. Redirect to Google
   ↓
5. Select account
   ↓
6. Google redirects to: /app/dashboard.html?code=ABC123
   ↓
7. Dashboard loads
   ↓
8. Supabase scripts load on dashboard
   ↓
9. initSupabaseAuth() detects ?code= in URL
   ↓
10. Calls exchangeCodeForSession()
   ↓
11. Session created
   ↓
12. onAuthStateChange fires
   ↓
13. handleAuthenticatedUser() creates local session
   ↓
14. checkAuth() finds session
   ↓
15. ✅ User stays logged in!
```

## Common Issues

### Issue: "Cannot read properties of undefined (reading 'auth')"
**Cause:** `supabaseClient` not initialized  
**Fix:** Check console for "✅ Supabase initialized successfully"

### Issue: Redirects to login immediately
**Cause:** Session not created before auth check  
**Fix:** Check if `exchangeCodeForSession()` ran

### Issue: "Session exchange error"
**Cause:** OAuth code invalid or expired  
**Fix:** Clear cache and try again

## Debug Checklist

- [ ] `supabase.min.js` exists in `js/` folder
- [ ] Console shows "✅ Supabase initialized successfully"
- [ ] Console shows "✅ Initializing Supabase Auth..."
- [ ] Clicking Google button shows "🔵 Starting Google Sign-In..."
- [ ] After redirect, console shows "🔵 OAuth callback detected"
- [ ] Console shows "✅ Session exchange successful"
- [ ] Console shows "✅ Session created, user authenticated"
- [ ] Dashboard loads without redirect

## Success Indicators

✅ **Console Output:**
- No errors
- All "✅" messages appear
- Session exchange successful

✅ **Visual:**
- Dashboard loads
- Your name in navbar
- No redirect to login
- URL is clean (no `?code=...`)

✅ **Functionality:**
- Can navigate to other pages
- Session persists on refresh
- Logout works correctly

---

**If all checks pass and it still doesn't work, copy the ENTIRE console output and share it.**
