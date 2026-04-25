/* ===================================================
   Voice Command System — voice-commands.js
   =================================================== */

'use strict';

class VoiceCommandSystem {
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
      <button id="voice-command-btn" class="voice-btn" title="Voice Commands (Click to speak)">
        <svg class="mic-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
        </svg>
        <span class="pulse-ring"></span>
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

      .voice-btn.listening .pulse-ring {
        animation: pulse-ring 1.5s ease-out infinite;
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
        white-space: nowrap;
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
      this.showStatus('Listening...');
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Voice command:', transcript);
      this.showStatus(`"${transcript}"`);
      this.processCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Error occurred';
      if (event.error === 'network') {
        errorMessage = 'Requires HTTPS or localhost';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access denied';
      } else if (event.error === 'no-speech') {
        errorMessage = 'No speech detected';
      } else {
        errorMessage = event.error;
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
    this.button.classList.remove('listening');
    setTimeout(() => {
      this.hideStatus();
    }, 2000);
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

  processCommand(command) {
    // Determine current folder context
    const currentPath = window.location.pathname;
    let basePath = '';
    
    if (currentPath.includes('/app/')) {
      basePath = '../';
    } else if (currentPath.includes('/auth/') || currentPath.includes('/student/') || currentPath.includes('/pages/')) {
      basePath = '../';
    }

    // Navigation commands
    if (command.includes('dashboard') || command.includes('home')) {
      this.showStatus('Opening dashboard...', 1500);
      setTimeout(() => window.location.href = basePath + 'app/dashboard.html', 500);
    }
    else if (command.includes('student') && !command.includes('exam')) {
      this.showStatus('Opening students...', 1500);
      setTimeout(() => window.location.href = basePath + 'app/students.html', 500);
    }
    else if (command.includes('exam')) {
      this.showStatus('Opening exams...', 1500);
      setTimeout(() => window.location.href = basePath + 'app/exams.html', 500);
    }
    else if (command.includes('user')) {
      this.showStatus('Opening users...', 1500);
      setTimeout(() => window.location.href = basePath + 'app/users.html', 500);
    }
    else if (command.includes('profile')) {
      this.showStatus('Opening profile...', 1500);
      setTimeout(() => window.location.href = basePath + 'student/student-profile.html', 500);
    }
    else if (command.includes('login') || command.includes('sign in')) {
      this.showStatus('Opening login...', 1500);
      setTimeout(() => window.location.href = basePath + 'auth/login.html', 500);
    }
    else if (command.includes('sign up') || command.includes('register')) {
      this.showStatus('Opening signup...', 1500);
      setTimeout(() => window.location.href = basePath + 'auth/signup.html', 500);
    }
    else if (command.includes('help')) {
      this.showStatus('Opening help center...', 1500);
      setTimeout(() => window.location.href = basePath + 'pages/help-center.html', 500);
    }
    // Theme commands
    else if (command.includes('dark mode') || command.includes('dark theme')) {
      this.showStatus('Switching to dark mode...', 1500);
      if (typeof toggleTheme === 'function' || typeof toggleDark === 'function') {
        const isDark = document.documentElement.classList.contains('dark');
        if (!isDark) {
          if (typeof toggleTheme === 'function') toggleTheme();
          else if (typeof toggleDark === 'function') toggleDark();
        }
      }
    }
    else if (command.includes('light mode') || command.includes('light theme')) {
      this.showStatus('Switching to light mode...', 1500);
      if (typeof toggleTheme === 'function' || typeof toggleDark === 'function') {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
          if (typeof toggleTheme === 'function') toggleTheme();
          else if (typeof toggleDark === 'function') toggleDark();
        }
      }
    }
    else if (command.includes('toggle theme') || command.includes('switch theme')) {
      this.showStatus('Toggling theme...', 1500);
      if (typeof toggleTheme === 'function') toggleTheme();
      else if (typeof toggleDark === 'function') toggleDark();
    }
    // Action commands
    else if (command.includes('logout') || command.includes('sign out')) {
      this.showStatus('Logging out...', 1500);
      if (typeof logout === 'function') {
        setTimeout(() => logout(), 500);
      }
    }
    else {
      this.showStatus('Command not recognized', 2000);
    }
  }
}

// Initialize voice commands when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new VoiceCommandSystem();
});
