# Student Class Selection Setup

## Overview
Students now select their class during signup, which is then displayed in their profile and used to filter available exams.

---

## Changes Made

### 1. Signup Form (signup.html)
- Added a **Class Selection** field that appears only when "Student" role is selected
- Dropdown with options: Senior 1, Senior 2, Senior 3, Senior 4, Senior 5, Senior 6
- Field is required for students
- Field is hidden for all other roles (teachers, staff, etc.)

### 2. Authentication Logic (auth.js)

#### selectRole() Function
- Shows class selection field when student role is selected
- Hides class selection field for other roles
- Makes the field required/optional based on role

#### validateSignup() Function
- Validates that students have selected a class
- Shows error message if class is not selected
- Skips validation for non-student roles

#### handleSignup() Function
- Captures the selected class value
- Saves class to user object for students
- Stores in localStorage with other user data

#### createSession() Function
- Includes class in session data for students
- Available in `currentUser.class` throughout the app

---

## How It Works

### For Students:
1. Go to signup page
2. Fill in name, email, and ID
3. Click on "Student" role badge
4. **Class selection dropdown appears automatically**
5. Select their class (e.g., "Senior 3")
6. Complete password fields
7. Submit form
8. Class is saved to their account

### For Other Roles:
1. Select any non-student role (Teacher, Administrator, etc.)
2. Class selection field remains hidden
3. No class is required or saved

---

## Where Class Information is Used

### 1. Student Profile (student-profile.html)
- Displays selected class instead of "Not assigned"
- Shows in the account information section

### 2. Student Dashboard (dashboard.js)
- Uses class to filter available exams
- Only shows exams assigned to student's class

### 3. Exam List (student-exams.js)
- Filters exams by student's class
- Shows message if no exams for their class

### 4. Exam Taking (take-exam.js)
- Validates student belongs to exam's class
- Prevents taking exams for other classes

---

## Data Structure

### User Object (in localStorage 'srs_users')
```javascript
{
  id: "unique-id",
  fullName: "John Doe",
  email: "john@school.com",
  employeeId: "STU2024001",
  role: "student",
  class: "Senior 3",  // Only for students
  password: "hashed-password",
  createdAt: "2024-01-15T10:30:00.000Z",
  isActive: true
}
```

### Session Object (in localStorage 'srs_session')
```javascript
{
  userId: "unique-id",
  email: "john@school.com",
  fullName: "John Doe",
  role: "student",
  employeeId: "STU2024001",
  class: "Senior 3",  // Only for students
  loginAt: "2024-01-15T10:30:00.000Z"
}
```

---

## Testing

### Test Student Signup:
1. ✅ Navigate to signup page
2. ✅ Select "Student" role
3. ✅ Verify class dropdown appears
4. ✅ Try submitting without selecting class (should show error)
5. ✅ Select a class and complete signup
6. ✅ Login and check profile shows correct class
7. ✅ Verify dashboard shows exams for that class only

### Test Other Roles:
1. ✅ Select "Teacher" role
2. ✅ Verify class dropdown does NOT appear
3. ✅ Complete signup without class selection
4. ✅ Login successfully

---

## Benefits

1. **Personalized Experience**: Students see only relevant exams for their class
2. **Better Organization**: Teachers can target exams to specific classes
3. **Profile Completeness**: No more "Not assigned" in student profiles
4. **Data Accuracy**: Class information captured at registration
5. **Automatic Filtering**: System automatically shows appropriate content

---

## Future Enhancements

1. **Class Management**
   - Allow administrators to create/edit class names
   - Support for multiple sections (e.g., Senior 3A, Senior 3B)
   - Class capacity limits

2. **Class Transfer**
   - Allow students to change class (with admin approval)
   - Track class history
   - Automatic promotion to next class

3. **Class-Based Features**
   - Class announcements
   - Class timetables
   - Class performance analytics
   - Class rankings/leaderboards

4. **Teacher-Class Assignment**
   - Assign teachers to specific classes
   - Teachers see only their assigned classes
   - Class-specific dashboards for teachers

---

## Troubleshooting

### Issue: Class dropdown not appearing
- **Solution**: Make sure you clicked the "Student" role badge
- **Check**: JavaScript console for errors

### Issue: "Not assigned" still showing
- **Solution**: Student needs to logout and signup again with class selection
- **Alternative**: Manually edit user data in localStorage to add class field

### Issue: No exams showing for student
- **Possible Causes**:
  1. No exams created for that class yet
  2. Teacher created exam for different class
  3. All exams are past due date
- **Solution**: Teacher should create exams for the student's class

---

## Summary

Students now have a complete registration flow that captures their class information, which is used throughout the system to provide a personalized experience. The class selection is:

✅ Required for students only
✅ Captured during signup
✅ Stored in user profile
✅ Available in session
✅ Used for exam filtering
✅ Displayed in profile page

No more "Not assigned" messages!
