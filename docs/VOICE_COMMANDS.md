# Voice Commands System

## Overview
The School Registration System now includes voice command navigation! Users can navigate the system hands-free using voice commands.

## Features
- 🎤 **Floating Voice Button** - Bottom right corner on all pages
- 🔴 **Visual Feedback** - Pulsing red animation when listening
- 💬 **Status Display** - Shows recognized commands
- 🌐 **Browser Support** - Works on Chrome, Edge, Safari (with webkit)
- 📱 **Mobile Friendly** - Responsive design for all devices

## How to Use

1. **Click the microphone button** in the bottom right corner
2. **Wait for the button to turn red** (listening mode)
3. **Speak your command** clearly
4. **System executes** the command automatically

## Supported Commands

### Navigation Commands
- **"Go to dashboard"** or **"Home"** - Opens the dashboard
- **"Show students"** or **"Students"** - Opens students page
- **"Show exams"** or **"Exams"** - Opens exams page
- **"Show users"** or **"Users"** - Opens users management
- **"Open profile"** or **"Profile"** - Opens student profile
- **"Login"** or **"Sign in"** - Opens login page
- **"Sign up"** or **"Register"** - Opens signup page
- **"Help"** - Opens help center

### Theme Commands
- **"Dark mode"** or **"Dark theme"** - Switches to dark mode
- **"Light mode"** or **"Light theme"** - Switches to light mode
- **"Toggle theme"** or **"Switch theme"** - Toggles between themes

### Action Commands
- **"Logout"** or **"Sign out"** - Logs out of the system

## Technical Details

### Browser Compatibility
- ✅ Chrome/Edge (Web Speech API)
- ✅ Safari (webkit Speech Recognition)
- ❌ Firefox (limited support)

### File Structure
```
js/
  └── voice-commands.js    # Main voice command system
```

### How It Works
1. Uses **Web Speech API** for voice recognition
2. Automatically detects folder context for correct navigation paths
3. Provides visual and text feedback during recognition
4. Handles errors gracefully

### Path Resolution
The system automatically handles different folder structures:
- From root (`index.html`) → `app/dashboard.html`
- From app folder (`app/dashboard.html`) → `../app/students.html`
- From auth folder (`auth/login.html`) → `../app/dashboard.html`

## Adding to New Pages

To add voice commands to a new page, include the script before closing `</body>`:

```html
<script src="../js/voice-commands.js"></script>
</body>
</html>
```

Adjust the path based on folder depth:
- Root level: `js/voice-commands.js`
- One level deep (app/, auth/, etc.): `../js/voice-commands.js`
- Two levels deep: `../../js/voice-commands.js`

## Customization

### Adding New Commands
Edit `js/voice-commands.js` and add to the `processCommand()` method:

```javascript
else if (command.includes('your command')) {
  this.showStatus('Executing...', 1500);
  setTimeout(() => {
    // Your action here
  }, 500);
}
```

### Styling
The voice button styles are embedded in `voice-commands.js`. Key classes:
- `.voice-btn` - Main button
- `.voice-btn.listening` - Active listening state
- `.voice-status` - Status message container

### Language Support
Change language in `voice-commands.js`:
```javascript
this.recognition.lang = 'en-US'; // Change to your language code
```

## Troubleshooting

### Microphone Not Working
1. Check browser permissions (allow microphone access)
2. Ensure HTTPS connection (required for security)
3. Check if browser supports Web Speech API

### Commands Not Recognized
1. Speak clearly and at normal pace
2. Reduce background noise
3. Check if command is in supported list
4. Try alternative phrasings

### Button Not Appearing
1. Check browser console for errors
2. Verify script is loaded correctly
3. Ensure browser supports Speech Recognition

## Privacy & Security
- Voice data is processed **locally** in the browser
- No voice data is sent to external servers
- Microphone access requires user permission
- Works offline once page is loaded

## Future Enhancements
- [ ] Multi-language support
- [ ] Custom command training
- [ ] Voice search for students
- [ ] Voice dictation for forms
- [ ] Keyboard shortcut to activate (e.g., Ctrl+Shift+V)
