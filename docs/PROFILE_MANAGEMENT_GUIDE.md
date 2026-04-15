# Profile Management Guide

## Chrome-Style Profile Switching

The School Registration System now includes Chrome-style profile management, allowing users to save multiple accounts and switch between them quickly without logging out.

## Features

### 1. Save Profiles
- Click on your profile avatar in the navbar
- Click "Save this profile" button
- Your account is now saved for quick access

### 2. Switch Between Profiles
- Click on your profile avatar
- See all your saved profiles
- Click any profile to switch instantly
- The page reloads with the new account

### 3. Remove Profiles
- Hover over any saved profile
- Click the trash icon that appears
- Confirm to remove the profile

### 4. Quick Login
- On the login page, saved profiles appear at the top
- Click any profile to log in instantly
- No need to type email/password

## Use Cases

### Teacher Who Is Also a Parent
- Save both teacher and parent (student) accounts
- Switch between them to view different perspectives
- No need to log out and log back in

### Administrator Testing Different Roles
- Save test accounts for each role
- Quickly switch to test features
- Verify permissions and access levels

### Siblings Sharing a Device
- Each sibling saves their student account
- Quick profile switching on login page
- Personal data stays separate

### Staff with Multiple Roles
- Save accounts for different departments
- Switch contexts without re-authentication
- Maintain separate workflows

## Profile Information

Each saved profile includes:
- Full name or custom nickname
- Email address
- Role (Administrator, Teacher, Student, etc.)
- Avatar with initials
- Color coding by role
- Last used timestamp

## Role Colors

- Administrator: Red (#ef4444)
- Registrar: Blue (#3b82f6)
- Teacher: Green (#10b981)
- Counselor: Purple (#8b5cf6)
- Staff: Gray (#6b7280)
- Security: Orange (#f59e0b)
- Student: Pink (#ec4899)

## Technical Details

### Storage
- Profiles are stored in localStorage
- Key: `srs_profiles`
- Active profile tracked separately
- Syncs with user accounts

### Security
- Profiles only store user IDs, not passwords
- Switching requires valid user account
- Deactivated accounts cannot be accessed
- Profile removal is instant

### UI Components
- Profile switcher in navbar (all pages)
- Profile list on login page
- Dropdown menu with all saved profiles
- Visual indicators for active profile

## Files Added

- `profiles.js` - Profile management system
- Integrated into all main pages:
  - dashboard.html
  - index.html (students)
  - exams.html
  - users.html
  - student-exams.html
  - login.html

## How It Works

1. **Save Profile**: Current session is saved with user details
2. **Switch Profile**: Loads user account and creates new session
3. **Remove Profile**: Deletes profile from saved list
4. **Auto-Update**: Profile last used time updates on switch
5. **Visual Feedback**: Toast notifications for all actions

## Footer Added

A professional footer has been added to all pages with:
- Brand information
- Quick navigation links
- Support links
- Social media icons
- Copyright notice
- Responsive design
- Dark mode support

## Benefits

✅ Faster account switching
✅ No repeated logins
✅ Better multi-account management
✅ Improved user experience
✅ Chrome-familiar interface
✅ Visual profile identification
✅ One-click access

## Notes

- Profiles persist across browser sessions
- Clearing localStorage removes all profiles
- Each profile is independent
- No limit on number of saved profiles
- Works offline (localStorage-based)

---

**Enjoy seamless profile switching!** 🚀
