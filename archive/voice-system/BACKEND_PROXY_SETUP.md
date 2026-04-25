# 🔒 Backend Proxy Setup Guide

## Why Use a Backend Proxy?

**Security:** Never expose your OpenAI API key in frontend code!

```
❌ BAD: API key in frontend JavaScript
✅ GOOD: API key in backend environment variables
```

---

## Architecture

### Without Proxy (Insecure)
```
Browser → OpenAI API (with exposed key)
```

### With Proxy (Secure)
```
Browser → Your Backend → OpenAI API (key hidden)
```

---

## Setup for Vercel (Recommended)

### Step 1: Add API Endpoint

File already created: `api/interpret-command.js`

This is a Vercel serverless function that:
- Receives voice command text from frontend
- Calls OpenAI API with secure key
- Returns interpreted command

### Step 2: Set Environment Variable

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-your-actual-key-here`
   - **Environment:** Production, Preview, Development

### Step 3: Update Frontend

Modify `js/voice-commands-ai.js` to use your backend:

```javascript
async interpretCommand(text) {
  try {
    // Call YOUR backend instead of OpenAI directly
    const response = await fetch('/api/interpret-command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    // Parse the command JSON
    const command = JSON.parse(data.command);
    console.log('🧠 AI interpreted:', command);
    
    return command;
  } catch (error) {
    console.error('❌ AI interpretation error:', error);
    return null;
  }
}
```

### Step 4: Remove API Key from Frontend

Remove this from your HTML:
```javascript
// ❌ DELETE THIS
window.voiceAssistant.setApiKey('sk-...');
```

Now your API key is safe! 🔒

### Step 5: Deploy

```bash
git add .
git commit -m "Add secure backend proxy for voice commands"
git push
```

Vercel will automatically deploy your serverless function.

---

## Testing

### Test the API Endpoint

```bash
curl -X POST https://your-app.vercel.app/api/interpret-command \
  -H "Content-Type: application/json" \
  -d '{"text":"go to dashboard"}'
```

Expected response:
```json
{
  "success": true,
  "command": "{\"action\":\"navigate\",\"page\":\"dashboard\"}",
  "usage": {
    "prompt_tokens": 245,
    "completion_tokens": 12,
    "total_tokens": 257
  }
}
```

### Test in Browser

1. Open your app
2. Click microphone button
3. Say a command
4. Check browser console for logs

---

## Alternative: Node.js/Express Backend

If you're using a traditional backend:

```javascript
// server.js
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/api/interpret-command', async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text required' });
  }

  try {
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
        ],
        temperature: 0.3,
        max_tokens: 150
      })
    });

    const data = await response.json();
    
    res.json({
      success: true,
      command: data.choices[0].message.content,
      usage: data.usage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## Environment Variables

### Local Development (.env)
```env
OPENAI_API_KEY=sk-your-key-here
```

### Vercel
Set in dashboard: Settings → Environment Variables

### Netlify
Set in dashboard: Site settings → Environment variables

### Railway/Render
Set in dashboard: Environment section

---

## Security Checklist

- [ ] API key stored in environment variables
- [ ] API key NOT in frontend code
- [ ] API key NOT in Git repository
- [ ] `.env` file in `.gitignore`
- [ ] Backend validates requests
- [ ] CORS configured properly
- [ ] Rate limiting enabled (optional)

---

## Rate Limiting (Optional)

Prevent abuse by limiting requests:

```javascript
// Simple rate limiting
const rateLimit = new Map();

app.post('/api/interpret-command', async (req, res) => {
  const ip = req.ip;
  const now = Date.now();
  
  // Check rate limit (10 requests per minute)
  const userRequests = rateLimit.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 10) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  
  // Process request...
});
```

---

## Cost Monitoring

Track usage in your backend:

```javascript
let totalTokens = 0;
let totalCost = 0;

app.post('/api/interpret-command', async (req, res) => {
  // ... call OpenAI ...
  
  const usage = data.usage;
  totalTokens += usage.total_tokens;
  
  // gpt-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens
  const cost = (usage.prompt_tokens * 0.15 / 1000000) + 
               (usage.completion_tokens * 0.60 / 1000000);
  totalCost += cost;
  
  console.log(`Total tokens: ${totalTokens}, Total cost: $${totalCost.toFixed(4)}`);
  
  res.json({ success: true, command: data.choices[0].message.content });
});
```

---

## Troubleshooting

### "Backend error: 500"
- Check Vercel logs
- Verify OPENAI_API_KEY is set
- Check OpenAI API status

### "CORS error"
Add CORS headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

### "Environment variable not found"
- Redeploy after adding env vars
- Check variable name matches exactly
- Verify environment (production/preview/dev)

---

## Summary

✅ **Secure:** API key hidden in backend  
✅ **Simple:** One serverless function  
✅ **Scalable:** Vercel handles scaling  
✅ **Monitored:** Track usage and costs  

**Your voice assistant is now production-ready!** 🚀

---

## Next Steps

1. [ ] Deploy backend proxy
2. [ ] Set environment variable
3. [ ] Update frontend code
4. [ ] Test thoroughly
5. [ ] Monitor usage
6. [ ] Add rate limiting (optional)

---

**Questions?** Check Vercel docs or OpenAI API docs.
