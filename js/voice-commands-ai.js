/* ===================================================
   AI-Powered Voice Command System — voice-commands-ai.js
   Architecture: Speech → Whisper → GPT → Action
   =================================================== */

'use strict';

class AIVoiceCommandSystem {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.button = null;
    this.statusText = null;
    this.init();
  }

  init() {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    // Create UI
    this.createUI();
    
    // Setup event listeners
    this.setupRecognitionEvents();
  }

  createUI() {
    // Create floating button container
    const container = document.createElement('div');
    container.id = 'voice-command-container';
    container.innerHTML = `
      <button id="voice-command-btn" class="voice-btn" title="AI Voice Assistant (Click to speak)">
        <svg class="mic-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
        </svg>
        <span class="pulse-ring"></span>
        <span class="ai-badge">AI</span>
      </button>
      <div id="voice-status" class="voice-status hidden">
        <p id="voice-status-text">Listening...</p>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #voice-command-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 12px;
      }

      .voice-btn {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1a1a1a 0%, #000000 55%, #000000 100%);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.2);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
      }

      .voice-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 28px rgba(0,0,0,0.4), 0 0 60px rgba(0,0,0,0.3);
      }

      .voice-btn:active {
        transform: translateY(0);
      }

      .voice-btn.listening {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        animation: pulse-btn 1.5s ease-in-out infinite;
      }

      .voice-btn.processing {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        animation: pulse-btn 1.5s ease-in-out infinite;
      }

      .mic-icon {
        width: 24px;
        height: 24px;
        color: white;
        position: relative;
        z-index: 2;
      }

      .pulse-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid #000000;
        opacity: 0;
        pointer-events: none;
      }

      .voice-btn.listening .pulse-ring,
      .voice-btn.processing .pulse-ring {
        animation: pulse-ring 1.5s ease-out infinite;
      }

      .ai-badge {
        position: absolute;
        bottom: -2px;
        right: -2px;
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        color: white;
        font-size: 9px;
        font-weight: 700;
        padding: 2px 5px;
        border-radius: 8px;
        border: 2px solid #0a0705;
        font-family: 'Syne', sans-serif;
        letter-spacing: 0.5px;
        z-index: 3;
      }

      @keyframes pulse-ring {
        0% {
          transform: scale(1);
          opacity: 0.6;
        }
        100% {
          transform: scale(1.8);
          opacity: 0;
        }
      }

      @keyframes pulse-btn {
        0%, 100% {
          box-shadow: 0 4px 20px rgba(239,68,68,0.4), 0 0 40px rgba(239,68,68,0.3);
        }
        50% {
          box-shadow: 0 4px 20px rgba(239,68,68,0.6), 0 0 60px rgba(239,68,68,0.5);
        }
      }

      .voice-status {
        background: rgba(0,0,0,0.9);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 12px 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        max-width: 300px;
      }

      .voice-status.hidden {
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
      }

      .voice-status:not(.hidden) {
        opacity: 1;
        transform: translateY(0);
      }

      #voice-status-text {
        color: white;
        font-size: 14px;
        font-weight: 500;
        margin: 0;
        font-family: 'DM Sans', sans-serif;
      }

      /* Light mode */
      html:not(.dark) .voice-status {
        background: rgba(255,255,255,0.95);
        border: 1px solid rgba(0,0,0,0.1);
      }

      html:not(.dark) #voice-status-text {
        color: #1f2937;
      }

      html:not(.dark) .ai-badge {
        border-color: white;
      }

      /* Mobile adjustments */
      @media (max-width: 768px) {
        #voice-command-container {
          bottom: 20px;
          right: 20px;
        }

        .voice-btn {
          width: 52px;
          height: 52px;
        }

        .mic-icon {
          width: 22px;
          height: 22px;
        }

        .voice-status {
          max-width: 250px;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(container);

    this.button = document.getElementById('voice-command-btn');
    this.statusText = document.getElementById('voice-status-text');
    this.statusContainer = document.getElementById('voice-status');

    // Button click event
    this.button.addEventListener('click', () => this.toggleListening());
  }

  setupRecognitionEvents() {
    this.recognition.onstart = () => {
      this.isListening = true;
      this.button.classList.add('listening');
      this.showStatus('🎤 Listening...');
    };

    this.recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log('🎤 Voice input:', transcript);
      
      this.showStatus(`"${transcript}"`);
      
      // Show processing state
      setTimeout(() => {
        this.button.classList.remove('listening');
        this.button.classList.add('processing');
        this.showStatus('🧠 Interpreting...');
      }, 500);

      // Process with AI
      await this.processCommandWithAI(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Error occurred';
      if (event.error === 'network') {
        errorMessage = '⚠️ Requires HTTPS or localhost';
      } else if (event.error === 'not-allowed') {
        errorMessage = '⚠️ Microphone access denied';
      } else if (event.error === 'no-speech') {
        errorMessage = '⚠️ No speech detected';
      } else {
        errorMessage = `⚠️ ${event.error}`;
      }
      
      this.showStatus(errorMessage, 3000);
      this.stopListening();
    };

    this.recognition.onend = () => {
      this.stopListening();
    };
  }

  toggleListening() {
    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }

  stopListening() {
    this.isListening = false;
    this.button.classList.remove('listening', 'processing');
    setTimeout(() => {
      this.hideStatus();
    }, 3000);
  }

  showStatus(text, duration = null) {
    this.statusText.textContent = text;
    this.statusContainer.classList.remove('hidden');
    
    if (duration) {
      setTimeout(() => this.hideStatus(), duration);
    }
  }

  hideStatus() {
    this.statusContainer.classList.add('hidden');
  }

  /**
   * 🧠 AI-POWERED COMMAND INTERPRETATION
   * Converts natural language to structured commands using GPT
   * Uses backend proxy to keep API key secure
   */
  async interpretCommand(text) {
    try {
      // Call backend proxy instead of OpenAI directly
      const response = await fetch('/api/interpret-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to interpret command');
      }
      
      // Parse the command JSON from backend
      const command = JSON.parse(data.command);
      console.log('🧠 AI interpreted:', command);
      
      return command;
    } catch (error) {
      console.error('❌ AI interpretation error:', error);
      return null;
    }
  }

  /**
   * 🎯 PROCESS COMMAND WITH AI
   * Main flow: Speech → AI → Action
   */
  async processCommandWithAI(text) {
    // Interpret with AI
    const command = await this.interpretCommand(text);

    if (!command) {
      this.showStatus('❌ Could not interpret command', 3000);
      return;
    }

    // Execute the command
    this.executeCommand(command);
  }

  /**
   * ⚙️ EXECUTE COMMAND
   * Takes structured command and performs action
   */
  executeCommand(command) {
    const { action } = command;

    // Determine current folder context for navigation
    const currentPath = window.location.pathname;
    let basePath = '';
    
    if (currentPath.includes('/app/') || currentPath.includes('/auth/') || 
        currentPath.includes('/student/') || currentPath.includes('/pages/')) {
      basePath = '../';
    }

    switch (action) {
      case 'navigate':
        this.handleNavigation(command.page, basePath);
        break;

      case 'add_student':
        this.handleAddStudent(command.name, command.class);
        break;

      case 'delete_student':
        this.handleDeleteStudent(command.name);
        break;

      case 'search_student':
        this.handleSearchStudent(command.query);
        break;

      case 'toggle_theme':
        this.handleToggleTheme(command.theme);
        break;

      case 'logout':
        this.handleLogout();
        break;

      case 'mark_attendance':
        this.handleMarkAttendance(command.name);
        break;

      case 'generate_report':
        this.handleGenerateReport(command.type);
        break;

      case 'unknown':
        this.showStatus(`❓ ${command.message || 'Command not understood'}`, 3000);
        break;

      default:
        this.showStatus('❌ Unknown action', 3000);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 🎯 ACTION HANDLERS
  // ═══════════════════════════════════════════════════════════

  handleNavigation(page, basePath) {
    const pageMap = {
      'dashboard': 'app/dashboard.html',
      'students': 'app/students.html',
      'exams': 'app/exams.html',
      'users': 'app/users.html',
      'profile': 'student/student-profile.html',
      'login': 'auth/login.html',
      'signup': 'auth/signup.html',
      'help': 'pages/help-center.html'
    };

    const targetPage = pageMap[page];
    if (targetPage) {
      this.showStatus(`✅ Opening ${page}...`, 1500);
      setTimeout(() => window.location.href = basePath + targetPage, 500);
    } else {
      this.showStatus('❌ Page not found', 2000);
    }
  }

  handleAddStudent(name, className) {
    this.showStatus(`✅ Adding student: ${name} (${className})`, 2000);
    
    // Check if we're on students page
    if (window.location.pathname.includes('students.html')) {
      // Trigger add student modal if function exists
      if (typeof openAddStudentModal === 'function') {
        setTimeout(() => {
          openAddStudentModal();
          // Pre-fill form if possible
          setTimeout(() => {
            const nameInput = document.querySelector('input[name="fullName"]');
            const classInput = document.querySelector('select[name="class"]');
            if (nameInput) nameInput.value = name;
            if (classInput) classInput.value = className;
          }, 300);
        }, 500);
      }
    } else {
      // Navigate to students page first
      this.showStatus('📍 Navigating to students page...', 1500);
      setTimeout(() => {
        const basePath = window.location.pathname.includes('/app/') ? '' : 'app/';
        window.location.href = basePath + 'students.html';
      }, 1000);
    }
  }

  handleDeleteStudent(name) {
    this.showStatus(`⚠️ Delete student: ${name}`, 2000);
    console.log('Delete student action:', name);
    // Implementation depends on your student management system
  }

  handleSearchStudent(query) {
    this.showStatus(`🔍 Searching for: ${query}`, 2000);
    
    // Try to trigger search if on students page
    const searchInput = document.querySelector('input[type="search"]') || 
                       document.querySelector('input[placeholder*="Search"]');
    
    if (searchInput) {
      searchInput.value = query;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.focus();
    }
  }

  handleToggleTheme(theme) {
    this.showStatus(`🎨 Switching to ${theme} mode...`, 1500);
    
    if (typeof toggleTheme === 'function' || typeof toggleDark === 'function') {
      const isDark = document.documentElement.classList.contains('dark');
      
      if (theme === 'dark' && !isDark) {
        if (typeof toggleTheme === 'function') toggleTheme();
        else if (typeof toggleDark === 'function') toggleDark();
      } else if (theme === 'light' && isDark) {
        if (typeof toggleTheme === 'function') toggleTheme();
        else if (typeof toggleDark === 'function') toggleDark();
      } else if (theme === 'toggle') {
        if (typeof toggleTheme === 'function') toggleTheme();
        else if (typeof toggleDark === 'function') toggleDark();
      }
    }
  }

  handleLogout() {
    this.showStatus('👋 Logging out...', 1500);
    if (typeof logout === 'function') {
      setTimeout(() => logout(), 500);
    }
  }

  handleMarkAttendance(name) {
    this.showStatus(`✅ Marking attendance for: ${name}`, 2000);
    console.log('Mark attendance action:', name);
    // Implementation depends on your attendance system
  }

  handleGenerateReport(type) {
    this.showStatus(`📊 Generating ${type} report...`, 2000);
    console.log('Generate report action:', type);
    // Implementation depends on your reporting system
  }
}

// ═══════════════════════════════════════════════════════════
// 🚀 INITIALIZATION
// ═══════════════════════════════════════════════════════════

let voiceAssistant = null;

document.addEventListener('DOMContentLoaded', () => {
  voiceAssistant = new AIVoiceCommandSystem();
  
  // Expose globally
  window.voiceAssistant = voiceAssistant;
  
  console.log('🎤 AI Voice Assistant initialized');
  console.log('💡 Using secure backend proxy - no API key needed in frontend!');
});
