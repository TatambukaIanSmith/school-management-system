# 🚀 Supabase Integration Setup Guide

**100% FREE - No Credit Card Required!**

Supabase is an open-source Firebase alternative with a generous free tier perfect for your school system.

## ✨ Why Supabase?

- ✅ **Completely FREE** - No credit card needed
- ✅ **500MB Database** - More than enough for a school
- ✅ **1GB File Storage** - For profile pictures and documents
- ✅ **50,000 Monthly Active Users** - Way more than you need
- ✅ **Real-time Updates** - Changes sync instantly
- ✅ **Built-in Authentication** - Google, Email, and more
- ✅ **PostgreSQL Database** - Industry standard
- ✅ **Auto-generated APIs** - No backend code needed

## 🚀 Quick Setup (10 minutes)

### Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or Email
4. **NO CREDIT CARD REQUIRED!** ✅

### Step 2: Create New Project

1. Click **"New project"**
2. Fill in:
   - **Name**: School Registration System
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: **Free** (already selected)
3. Click **"Create new project"**
4. Wait 2 minutes for project setup

### Step 3: Get Your API Credentials

1. In your project dashboard, click **"Settings"** (gear icon) in sidebar
2. Click **"API"**
3. You'll see two important values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Copy both values!**

### Step 4: Configure Your App

1. Open `js/supabase-config.js`
2. Replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co';  // ← Your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';  // ← Your anon key
```

3. Save the file

### Step 5: Create Database Tables

1. In Supabase dashboard, click **"SQL Editor"** in sidebar
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'staff',
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  gender TEXT,
  date_of_birth DATE,
  class_level TEXT,
  parent_name TEXT,
  contact TEXT,
  address TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exams table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  class_level TEXT,
  subject TEXT,
  duration INTEGER,
  total_marks INTEGER,
  passing_marks INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  questions JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for students table
CREATE POLICY "Anyone can view students" ON students
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and registrars can insert students" ON students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('administrator', 'registrar')
    )
  );

CREATE POLICY "Staff can update students" ON students
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('administrator', 'registrar', 'teacher', 'counselor')
    )
  );

CREATE POLICY "Admins and registrars can delete students" ON students
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('administrator', 'registrar')
    )
  );

-- Create policies for exams table
CREATE POLICY "Anyone can view exams" ON exams
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Teachers and admins can manage exams" ON exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('administrator', 'teacher')
    )
  );
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: **"Success. No rows returned"**

### Step 6: Enable Authentication

1. Click **"Authentication"** in sidebar
2. Click **"Providers"**
3. **Email** is already enabled ✅
4. To enable **Google Sign-In**:
   - Click on **"Google"**
   - Toggle **"Enable Sign in with Google"**
   - You'll need Google OAuth credentials (optional for now)
   - Click **"Save"**

### Step 7: Create Storage Buckets

1. Click **"Storage"** in sidebar
2. Click **"New bucket"**
3. Create two buckets:

**Bucket 1: avatars**
- Name: `avatars`
- Public: ✅ Yes
- Click **"Create bucket"**

**Bucket 2: student-photos**
- Name: `student-photos`
- Public: ✅ Yes
- Click **"Create bucket"**

### Step 8: Add Supabase to HTML Pages

Add these script tags to your HTML pages (before closing `</body>`):

```html
<!-- Supabase CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Supabase Configuration -->
<script src="../js/supabase-config.js"></script>
<script src="../js/supabase-auth.js"></script>
<script src="../js/supabase-db.js"></script>
```

**Example for `auth/login.html`:**

```html
</div>

<!-- Supabase Scripts -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-config.js"></script>
<script src="../js/supabase-auth.js"></script>

<!-- Your existing scripts -->
<script src="../js/auth.js"></script>
</body>
</html>
```

### Step 9: Test the Integration

1. Open your browser
2. Go to `auth/login.html`
3. Open browser console (F12)
4. You should see: `✅ Supabase initialized successfully`
5. Try signing up with email/password
6. Check Supabase Dashboard > Authentication > Users - you should see your account!

## 🎯 Using Supabase in Your Code

### Sign Up
```javascript
const result = await supabaseSignUp(email, password, fullName, 'staff');
if (result.success) {
  console.log('Account created!');
}
```

### Sign In
```javascript
const result = await supabaseSignIn(email, password);
if (result.success) {
  window.location.href = '../app/dashboard.html';
}
```

### Google Sign-In
```javascript
await supabaseSignInWithGoogle();
// User will be redirected to Google, then back to your app
```

### Add Student
```javascript
const result = await addStudent({
  student_id: 'S2024001',
  full_name: 'John Doe',
  email: 'john@school.com',
  class_level: 'Grade 10',
  gender: 'Male'
});
```

### Get Students (Real-time)
```javascript
listenToStudents((students) => {
  console.log('Students updated:', students);
  renderTable(students);
});
```

## 📊 Migrate Existing Data

If you have data in localStorage:

```javascript
// Run this once in browser console
async function migrateToSupabase() {
  const students = JSON.parse(localStorage.getItem('srs_students') || '[]');
  
  for (const student of students) {
    await addStudent(student);
  }
  
  console.log(`Migrated ${students.length} students!`);
}

migrateToSupabase();
```

## 🔒 Security Features

Supabase includes:
- ✅ **Row Level Security** - Users can only access their data
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-based Access** - Different permissions per role
- ✅ **SQL Injection Protection** - Built-in
- ✅ **HTTPS Only** - All connections encrypted

## 📈 Free Tier Limits

- **Database**: 500MB (enough for 50,000+ students)
- **Storage**: 1GB (thousands of photos)
- **Bandwidth**: 2GB/month
- **API Requests**: Unlimited
- **Monthly Active Users**: 50,000

**You won't hit these limits for a school!** 🎉

## 🐛 Troubleshooting

### "Supabase is not defined"
- Make sure Supabase CDN script is loaded first
- Check browser console for script loading errors

### "Invalid API key"
- Double-check your SUPABASE_URL and SUPABASE_ANON_KEY
- Make sure there are no extra spaces

### "Permission denied"
- Check Row Level Security policies
- Make sure user is authenticated
- Verify user role in database

### "Table does not exist"
- Run the SQL script in Step 5
- Check table names match exactly

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [SQL Editor](https://app.supabase.com/project/_/sql)
- [Community Support](https://github.com/supabase/supabase/discussions)

## ✅ Checklist

- [ ] Created Supabase account (FREE!)
- [ ] Created new project
- [ ] Copied Project URL and anon key
- [ ] Updated `supabase-config.js`
- [ ] Created database tables (ran SQL script)
- [ ] Enabled authentication providers
- [ ] Created storage buckets
- [ ] Added Supabase scripts to HTML pages
- [ ] Tested sign up/sign in
- [ ] Verified user in Supabase dashboard

## 🎉 You're Done!

Your School Registration System now uses Supabase - completely FREE with no credit card! Enjoy real-time collaboration, proper authentication, and cloud storage! 🚀

**Need help?** Check the Supabase docs or ask in their Discord community!
