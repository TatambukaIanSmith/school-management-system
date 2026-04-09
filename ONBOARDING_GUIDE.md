# Onboarding System Guide 🎓

## Overview

The School Registration System now includes an interactive onboarding system with tooltips and coach marks to guide new users through the interface step-by-step.

---

## Features ✨

### 1. **Role-Based Tours**
Each user role gets a customized tutorial based on their permissions and responsibilities:
- **Administrators**: Full system tour including user management
- **Registrars**: Focus on student registration and bulk import
- **Teachers**: Student viewing and editing features
- **Counselors**: Student lookup and record updates
- **Staff**: View-only features and search
- **Security**: Student verification and identification

### 2. **Page-Specific Guidance**
Different tours for different pages:
- **Dashboard**: Overview of statistics and quick actions
- **Students Page**: Registration form, search, import/export
- **Users Page**: User management (administrators only)

### 3. **Interactive Elements**
- **Tooltips**: Beautiful popups with clear instructions
- **Highlighting**: Important elements pulse with orange glow
- **Progress Indicators**: Dots show current step and progress
- **Navigation**: Next, Back, and Skip buttons

### 4. **Smart Behavior**
- Automatically starts for new users
- Only shows once per page/role combination
- Can be restarted anytime
- Skippable if user prefers
- Remembers completion status

---

## How It Works

### First-Time Experience

1. **User logs in** for the first time
2. **System waits 1 second** (lets page load completely)
3. **Tour starts automatically** with a welcome message
4. **User follows steps** at their own pace
5. **Tour completes** and won't show again

### Tour Structure

Each step includes:
- **Title**: Short, descriptive heading with emoji
- **Message**: Clear explanation of the feature
- **Highlight**: Optional pulsing glow on element
- **Position**: Tooltip placement (top, bottom, left, right)
- **Progress**: Current step number and dots

---

## Tours by Role

### 👑 Administrator Tour (Dashboard)

**5 Steps:**
1. **Welcome!** - Profile introduction
2. **Stay Updated** - Notifications bell
3. **Your Dashboard** - Statistics overview
4. **Manage Students** - Link to student page
5. **Manage Users** - Link to user management

### 👑 Administrator Tour (Students Page)

**5 Steps:**
1. **Register Students** - Form explanation
2. **Bulk Import** - CSV upload feature
3. **Export Data** - Download records
4. **Search Students** - Quick find
5. **Sort Records** - Organization options

### 📋 Registrar Tour (Dashboard)

**3 Steps:**
1. **Welcome!** - Role introduction
2. **Notifications** - Activity updates
3. **Student Records** - Registration link

### 📋 Registrar Tour (Students Page)

**3 Steps:**
1. **Student Registration** - Form guide
2. **Bulk Import** - CSV upload
3. **Find Students** - Search feature

### 👨‍🏫 Teacher Tour (Dashboard)

**3 Steps:**
1. **Welcome Teacher!** - Role overview
2. **Stay Informed** - Notifications
3. **View Students** - Access records

### 👨‍🏫 Teacher Tour (Students Page)

**2 Steps:**
1. **Find Your Students** - Search guide
2. **Student Records** - Edit feature

### 💚 Counselor Tour

**Similar to Teacher** - Focus on viewing and updating

### 👥 Staff Tour

**Simplified** - View-only features

### 🔒 Security Tour

**Focused** - Student verification and lookup

---

## User Controls

### Restart Tutorial

Users can restart the tour anytime:

1. Click on **user profile** in top-right
2. Select **"Restart Tutorial"**
3. Confirm the action
4. Page reloads with tour

### Skip Tutorial

During the tour:
1. Click **X** button in tooltip
2. Confirm skip action
3. Tour ends immediately

### Navigate Steps

- **Next →** - Move to next step
- **Back** - Return to previous step
- **Got it! ✓** - Complete tour (last step)

---

## Technical Details

### Storage

Tours completion tracked in localStorage:
```javascript
Key: 'srs_onboarding_completed'
Value: ['dashboard_administrator', 'students_registrar', ...]
```

### Tour Keys Format
```
{page}_{role}
```

Examples:
- `dashboard_administrator`
- `students_teacher`
- `users_administrator`

### Timing

- **Initial delay**: 1 second after page load
- **Step transition**: Smooth animations
- **Auto-scroll**: Elements scroll into view
- **Tooltip positioning**: Smart viewport detection

### Styling

- **Overlay**: Semi-transparent dark background with blur
- **Highlight**: Pulsing orange glow (brand color)
- **Tooltip**: Glassmorphism design matching app theme
- **Animations**: Smooth fade-in and scale effects

---

## Customization

### Adding New Tours

Edit `onboarding.js` and add to `TOURS` object:

```javascript
TOURS.newpage = {
  newrole: [
    {
      element: '#selector',
      title: 'Step Title 🎯',
      message: 'Clear explanation here',
      position: 'bottom',
      highlight: true
    },
    // More steps...
  ]
}
```

### Tour Step Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `element` | string | Yes | CSS selector for target element |
| `title` | string | Yes | Step heading (use emojis!) |
| `message` | string | Yes | Explanation text |
| `position` | string | No | Tooltip placement: top, bottom, left, right |
| `highlight` | boolean | No | Add pulsing glow effect |

### Tooltip Positions

- **top**: Above element
- **bottom**: Below element (default)
- **left**: Left side of element
- **right**: Right side of element

Auto-adjusts to stay within viewport.

---

## Best Practices

### Writing Tour Steps

✅ **DO:**
- Use clear, concise language
- Add relevant emojis to titles
- Explain WHY, not just WHAT
- Keep messages under 100 words
- Use action verbs (Click, View, Search)
- Highlight important interactive elements

❌ **DON'T:**
- Use technical jargon
- Write long paragraphs
- Assume prior knowledge
- Skip important features
- Over-explain obvious things

### Tour Length

- **Ideal**: 3-5 steps per page
- **Maximum**: 7 steps
- **Minimum**: 2 steps

Too many steps = user fatigue  
Too few steps = incomplete guidance

### Element Selection

Choose elements that are:
- Always visible on page load
- Interactive (buttons, links, inputs)
- Important for user's role
- Stable (won't move or disappear)

---

## Accessibility

### Keyboard Support

- **Tab**: Navigate between buttons
- **Enter**: Activate buttons
- **Escape**: Close tour (future enhancement)

### Screen Readers

Tooltips include:
- Semantic HTML structure
- Clear heading hierarchy
- Descriptive button labels
- Progress indicators

### Visual Design

- High contrast text
- Large, readable fonts
- Clear button states
- Smooth animations (respects prefers-reduced-motion)

---

## Troubleshooting

### Tour Not Starting

**Possible causes:**
1. Already completed for this role/page
2. Element selectors don't match
3. JavaScript errors in console
4. Page loaded too quickly

**Solutions:**
- Click "Restart Tutorial" in user menu
- Check browser console for errors
- Verify element IDs/classes exist
- Clear localStorage and refresh

### Tooltip Positioning Issues

**Problem**: Tooltip appears off-screen

**Solution**: System auto-adjusts, but if issues persist:
- Check viewport size
- Verify element is visible
- Try different position value
- Ensure element isn't in scrollable container

### Highlight Not Showing

**Problem**: Element doesn't pulse

**Solution**:
- Verify `highlight: true` in tour step
- Check element has proper z-index
- Ensure CSS styles loaded
- Try different element selector

### Tour Stuck on Step

**Problem**: Can't proceed to next step

**Solution**:
- Click "Skip" and restart
- Check console for errors
- Verify next element exists
- Refresh page

---

## Analytics (Future Enhancement)

Track tour effectiveness:
- Completion rates per role
- Average time per step
- Skip frequency
- Most helpful steps
- Confusion points

---

## Examples

### Example 1: Simple Welcome

```javascript
{
  element: '#user-info',
  title: 'Welcome! 👋',
  message: 'You\'re logged in as an Administrator.',
  position: 'bottom'
}
```

### Example 2: Interactive Feature

```javascript
{
  element: '#import-btn',
  title: 'Bulk Import 📤',
  message: 'Upload a CSV file to import multiple students at once!',
  position: 'bottom',
  highlight: true
}
```

### Example 3: Action Prompt

```javascript
{
  element: '#search-input',
  title: 'Find Students 🔍',
  message: 'Search by name, ID, class, or guardian. Try it now!',
  position: 'bottom',
  highlight: true
}
```

---

## Future Enhancements

### Planned Features

1. **Interactive Steps**: Require user action to proceed
2. **Video Tutorials**: Embedded video guides
3. **Contextual Help**: Hover tooltips on demand
4. **Multi-language**: Translations for tours
5. **Custom Tours**: Users create their own guides
6. **Analytics Dashboard**: Track tour effectiveness
7. **Keyboard Shortcuts**: Navigate with keys
8. **Voice Guidance**: Audio instructions (accessibility)

### Community Contributions

Want to improve tours?
- Suggest better wording
- Report confusing steps
- Request new tours
- Share feedback

---

## FAQ

**Q: Can I skip the tutorial?**  
A: Yes! Click the X button and confirm.

**Q: How do I restart it?**  
A: Click your profile → "Restart Tutorial"

**Q: Will it show every time I log in?**  
A: No, only once per page/role. Restart manually if needed.

**Q: Can I customize the tours?**  
A: Yes, edit `onboarding.js` to add/modify tours.

**Q: Does it work on mobile?**  
A: Yes! Tooltips adapt to screen size.

**Q: What if an element moves?**  
A: Tooltip repositions automatically.

**Q: Can I disable it completely?**  
A: Yes, remove `onboarding.js` from HTML files.

---

## Support

Need help with onboarding?
1. Check browser console for errors
2. Verify JavaScript is enabled
3. Try different browser
4. Clear cache and cookies
5. Contact system administrator

---

**Version**: 1.0.0  
**Last Updated**: 2026  
**File**: `onboarding.js`
