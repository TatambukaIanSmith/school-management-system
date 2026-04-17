# 🚀 START HERE

## How to Run the Application

### Option 1: Open index.html Directly

1. Navigate to your project folder
2. **Double-click `index.html`** (in the root folder)
3. It will open in your default browser

### Option 2: Using Live Server (VS Code)

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` (in root folder)
3. Select "Open with Live Server"
4. Your browser will open at `http://localhost:5500/index.html`

### Option 3: Using Python Server

```bash
# In your project root folder
python -m http.server 8000

# Then open browser to:
# http://localhost:8000/index.html
```

### Option 4: Using Node.js Server

```bash
# Install http-server globally
npm install -g http-server

# Run in project root
http-server

# Then open browser to:
# http://localhost:8080/index.html
```

## ⚠️ Important

**Always start with `index.html` in the ROOT folder!**

```
project-root/
├── index.html          ← START HERE! (Landing page)
├── app/
│   └── dashboard.html  ← NOT the entry point (requires login)
├── auth/
│   ├── login.html
│   └── signup.html
└── ...
```

## Why Not dashboard.html?

- `app/dashboard.html` requires authentication
- It's the page users see AFTER logging in
- If you open it directly, you'll see errors or be redirected to login

## Correct Flow

```
1. Open index.html (landing page)
   ↓
2. Click "Get Started" or "Sign In"
   ↓
3. Login/Register
   ↓
4. Redirected to app/dashboard.html
```

## Quick Test

1. Open `index.html` in browser
2. You should see the landing page with:
   - "School Registration" header
   - Hero section with "The School Registry Schools Love"
   - Features section
   - Pricing section
   - Footer

If you see a dashboard instead, you're opening the wrong file!

## Bookmark This

For easy access, bookmark: `http://localhost:5500/index.html` (or your server URL)

---

**Remember: `index.html` is your entry point! 🏠**
