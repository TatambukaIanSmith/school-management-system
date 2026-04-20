/**
 * Vercel Serverless Function
 * Backend proxy for OpenAI API to keep API key secure
 * 
 * Setup:
 * 1. Add OPENAI_API_KEY to Vercel environment variables
 * 2. Deploy to Vercel
 * 3. Update voice-commands-ai.js to use this endpoint
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get text from request
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Check API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a command parser for a school management system. Convert user speech into JSON commands.

Available commands:
- navigate: {action: "navigate", page: "dashboard|students|exams|users|profile|login|signup|help"}
- add_student: {action: "add_student", name: string, class: string}
- delete_student: {action: "delete_student", name: string}
- search_student: {action: "search_student", query: string}
- toggle_theme: {action: "toggle_theme", theme: "dark|light|toggle"}
- logout: {action: "logout"}
- mark_attendance: {action: "mark_attendance", name: string}
- generate_report: {action: "generate_report", type: string}

Return ONLY valid JSON. If unclear, return: {action: "unknown", message: "clarification needed"}

Examples:
"go to dashboard" → {"action":"navigate","page":"dashboard"}
"add student John in S3" → {"action":"add_student","name":"John","class":"S3"}
"delete Brian" → {"action":"delete_student","name":"Brian"}
"search for Sarah" → {"action":"search_student","query":"Sarah"}
"dark mode" → {"action":"toggle_theme","theme":"dark"}
"log out" → {"action":"logout"}`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({ 
        error: 'OpenAI API error',
        details: error 
      });
    }

    const data = await response.json();
    
    // Return the command
    return res.status(200).json({
      success: true,
      command: data.choices[0].message.content,
      usage: data.usage
    });

  } catch (error) {
    console.error('Error processing command:', error);
    return res.status(500).json({ 
      error: 'Failed to process command',
      message: error.message 
    });
  }
}
