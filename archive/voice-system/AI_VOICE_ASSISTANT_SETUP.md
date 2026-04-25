# 🎤 AI Voice Assistant Setup Guide

## Architecture Overview

```
🎤 User speaks
    ↓
📝 Speech → Text (Browser Speech Recognition)
    ↓
🧠 Interpret meaning (OpenAI GPT-4)
    ↓
⚙️ Execute action in your system
```

## Features

✅ **Natural Language Understanding** - Speak naturally, AI interprets intent  
✅ **Flexible Commands** - Multiple ways to say the same thing  
✅ **Context-Aware** - Understands your school management context  
✅ **Smart Actions** - Executes complex multi-step operations  

## Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy your API key (starts with `sk-...`)

### Step 2: Replace Voice Commands File

In your HTML files, replace the old voice commands script:

**OLD:**
```html
<script src="../js/voice-commands.js"></script>
```

**NEW:**
```html
<script src="../js/voice-commands-ai.js"></script>
```

### Step 3: Configure API Key

Add this script **after** loading `voice-commands-ai.js`:

```html
<script>
  // Wait for voice assistant to initialize
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (window.voiceAssistant) {
        window.voiceAssistant.setApiKey('YOUR_OPENAI_API_KEY_HERE');
      }
    }, 500);
  });
</script>
```

**⚠️ SECURITY WARNING:**  
Never commit your API key to GitHub! Use environment variables or a backend proxy.

### Step 4: Test It Out

1. Open your app on HTTPS or localhost
2. Click the microphone button (bottom right)
3. Grant microphone permission
4. Speak a command:
   - "Go to dashboard"
   - "Add student John in Senior Three"
   - "Search for Sarah"
   - "Switch to dark mode"

## Supported Commands

### 🧭 Navigation
- "Go to dashboard"
- "Open students page"
- "Show me exams"
- "Take me to users"
- "Open my profile"
- "Go to help center"

### 👨‍🎓 Student Management
- "Add student [Name] in [Class]"
  - Example: "Add student Brian in S4"
- "Delete student [Name]"
  - Example: "Remove John"
- "Search for [Name]"
  - Example: "Find Sarah"

### 🎨 Theme Control
- "Dark mode"
- "Light mode"
- "Toggle theme"
- "Switch to dark theme"

### 🔐 Authentication
- "Log out"
- "Sign out"
- "Go to login"

### 📊 Advanced (Extensible)
- "Mark attendance for [Name]"
- "Generate report"

## How It Works

### 1. Speech Recognition
Uses browser's built-in Web Speech API to convert voice to text.

### 2. AI Interpretation
Sends text to OpenAI GPT-4 with a specialized system prompt:

```javascript
{
  role: "system",
  content: "You are a command parser for a school management system..."
}
```

GPT returns structured JSON:
```json
{
  "action": "add_student",
  "name": "John",
  "class": "S3"
}
```

### 3. Action Execution
JavaScript executes the command:
- Navigation → `window.location.href`
- Add student → Opens modal, pre-fills form
- Search → Triggers search input
- Theme → Calls `toggleTheme()`

## Cost Estimation

Using `gpt-4o-mini` (recommended):
- **$0.00015 per request** (average)
- **100 commands = $0.015** (1.5 cents)
- **1000 commands = $0.15** (15 cents)

Very affordable for a school system!

## Advanced: Backend Proxy (Recommended)

For production, create a backend endpoint to hide your API key:

### Backend (Node.js/Express)
```javascript
app.post('/api/interpret-command', async (req, res) => {
  const { text } = req.body;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '...' },
        { role: 'user', content: text }
      ]
    })
  });
  
  const data = await response.json();
  res.json(data);
});
```

### Frontend Update
```javascript
async interpretCommand(text) {
  const response = await fetch('/api/interpret-command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
```

## Extending Commands

To add new commands, update the system prompt in `voice-commands-ai.js`:

```javascript
content: `You are a command parser for a school management system.

Available commands:
- navigate: {action: "navigate", page: "..."}
- add_student: {action: "add_student", name: string, class: string}
- YOUR_NEW_COMMAND: {action: "your_action", param: value}

Examples:
"your example" → {"action":"your_action","param":"value"}
`
```

Then add a handler:

```javascript
case 'your_action':
  this.handleYourAction(command.param);
  break;
```

## Troubleshooting

### "Requires HTTPS or localhost"
- Access via `https://` or `http://localhost`
- Deploy to Vercel/Netlify (automatic HTTPS)

### "Microphone access denied"
- Check browser permissions
- Click lock icon in address bar → Allow microphone

### "Could not interpret command"
- Check API key is set correctly
- Check browser console for errors
- Verify OpenAI API key has credits

### "Command not understood"
- Speak clearly and naturally
- Try rephrasing the command
- Check supported commands list

## Performance Tips

1. **Use gpt-4o-mini** - Fast and cheap
2. **Set low temperature** (0.3) - More consistent
3. **Limit max_tokens** (150) - Faster responses
4. **Cache common commands** - Reduce API calls

## Privacy & Security

✅ **Voice data** - Processed locally by browser  
✅ **Text transcription** - Sent to OpenAI (encrypted)  
✅ **No audio recording** - Only text is transmitted  
⚠️ **API key** - Keep secret, use backend proxy  

## Next Steps

1. ✅ Set up OpenAI API key
2. ✅ Test basic commands
3. ✅ Add custom commands for your needs
4. ✅ Deploy with backend proxy
5. ✅ Monitor usage and costs

## Support

For issues or questions:
- Check browser console for errors
- Review OpenAI API status
- Test with simple commands first

---

**Built with ❤️ for modern school management**
