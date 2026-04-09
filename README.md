# School Registration System

A modern, feature-rich student management system built with HTML, Tailwind CSS, and vanilla JavaScript.

## 🚀 Features

### Core Features
- **Student Management** - Add, edit, delete, search, and filter students
- **Exam Management** - Create exams, manage submissions, grade students
- **User Management** - Multi-role system (Admin, Teacher, Student, etc.)
- **Profile Management** - Chrome-style profile switching
- **Dark Mode** - Full dark mode support
- **Responsive Design** - Works on desktop, tablet, and mobile
- **CSV Import/Export** - Bulk student data management
- **Photo Upload** - Student profile photos
- **Notifications** - Real-time notification system
- **Onboarding Tours** - Guided tours for new users

### User Roles
- **Administrator** - Full system access
- **Registrar** - Manage student records
- **Teacher** - View students, create/grade exams
- **Counselor** - View and edit student information
- **Staff** - View-only access
- **Security** - View student identification
- **Student** - Take exams, view results

### Profile Management
- Save multiple accounts
- Switch between profiles instantly
- Chrome-style interface
- Quick login from saved profiles

## 🎨 Design

- **Glassmorphism UI** - Modern, elegant design
- **Brand Color** - Orange (#f04923)
- **Typography** - DM Sans & DM Serif Display
- **Animations** - Smooth transitions and effects

## 📦 Tech Stack

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript
- LocalStorage (No backend required)

## 🚀 Getting Started

### Option 1: Direct Use
1. Download all files
2. Open `login.html` in your browser
3. Create an account and start using!

### Option 2: Local Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000/login.html`

## 📁 Project Structure

```
/
├── index.html              # Student management page
├── login.html              # Login page
├── signup.html             # Signup page
├── dashboard.html          # Dashboard (all roles)
├── exams.html              # Exam management (teachers)
├── student-exams.html      # Student exam list
├── take-exam.html          # Exam taking interface
├── users.html              # User management (admin)
├── student-profile.html    # Student profile view
├── auth.js                 # Authentication system
├── script.js               # Student management logic
├── dashboard.js            # Dashboard logic
├── exams.js                # Exam management logic
├── student-exams.js        # Student exam logic
├── take-exam.js            # Exam taking logic
├── users.js                # User management logic
├── profiles.js             # Profile management system
├── notifications.js        # Notification system
├── onboarding.js           # Onboarding tours
└── test-profiles.html      # Profile system test page
```

## 🔐 Default Credentials

No default accounts - create your first account via signup page.

## 📝 Usage Guide

### For Administrators
1. Create user accounts for staff and teachers
2. Manage system-wide settings
3. View all student records
4. Export data for reporting

### For Teachers
1. View student lists
2. Create and manage exams
3. Grade student submissions
4. Export student data

### For Students
1. View available exams
2. Take exams within time limits
3. View graded results
4. Check personal profile

## 🎯 Key Features Explained

### Profile Management
- Click your avatar in the navbar
- Save current account as a profile
- Switch between saved profiles
- Remove profiles you no longer need
- Quick login from saved profiles

### Exam System
- Multiple question types (MCQ, True/False, Short Answer)
- Timed exams with auto-submit
- Grace period for late submissions
- Automatic grading for MCQ/True-False
- Manual grading for short answers
- Duplicate exams feat students

#### For Staff & Security:
- View student records only
- Search and filter students
- No editing, adding, or deleting capabilities
- No data export

## File Structure

```
school-registration-system/
├── index.html          # Main application (student management)
├── dashboard.html      # Role-based dashboard
├── login.html          # Login page
├── signup.html         # Registration page
├── users.html          # User management (admin only)
├── script.js           # Main application logic
├── dashboard.js        # Dashboard logic and rendering
├── auth.js             # Authentication & authorization logic
├── users.js            # User management logic
├── notifications.js    # Notifications system
├── onboarding.js       # Interactive tutorial system
├── README.md           # Documentation
├── NEW_FEATURES.md     # New features documentation
└── ONBOARDING_GUIDE.md # Tutorial system guide
```

## Technical Details

### Storage
- **LocalStorage**: All data is stored in the browser's localStorage
- **Keys Used**:
  - `srs_users`: User accounts
  - `srs_students`: Student records
  - `srs_session`: Current user session
  - `srs_dark`: Dark mode preference

### Security Features
- Password hashing (basic implementation for demo)
- Session management
- Role-based access control
- Permission checks on all operations
- Duplicate email/employee ID prevention

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires localStorage support

## Data Privacy

⚠️ **Important**: This is a client-side application. All data is stored locally in the browser. For production use:

1. Implement server-side authentication
2. Use proper password hashing (bcrypt, argon2)
3. Add HTTPS encryption
4. Implement database storage
5. Add audit logging
6. Comply with data protection regulations (FERPA, GDPR, etc.)

## Development Notes

### Adding New Roles

To add a new role, update the `PERMISSIONS` object in both `auth.js` and `script.js`:

```javascript
newrole: {
  canView: true,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canExport: false,
  label: 'New Role'
}
```

### Customization

- **Colors**: Modify the Tailwind config in each HTML file
- **Branding**: Update the logo SVG and title text
- **Fields**: Add/remove student fields in the form
- **Permissions**: Adjust role permissions in the PERMISSIONS object

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify localStorage is enabled
3. Clear browser cache if experiencing issues
4. Ensure you're using a modern browser

## License

This project is provided as-is for educational and demonstration purposes.

---

**Version**: 1.0.0  
**Last Updated**: 2026
