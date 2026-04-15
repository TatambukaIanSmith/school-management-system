/* ===================================================
   Onboarding System — onboarding.js
   Coach marks and tooltips for new users
   =================================================== */

'use strict';

const ONBOARDING_KEY = 'srs_onboarding_completed';
const TOUR_DELAY = 500; // Delay between steps

// Define tours for different pages and roles
const TOURS = {
  dashboard: {
    administrator: [
      {
        element: '#user-info',
        title: 'Welcome! 👋',
        message: 'This is your profile. You\'re logged in as an Administrator with full system access.',
        position: 'bottom'
      },
      {
        element: '#notifications-button',
        title: 'Stay Updated 🔔',
        message: 'Click here to see notifications about student registrations, updates, and system activities.',
        position: 'bottom'
      },
      {
        element: '#dashboard-content',
        title: 'Your Dashboard 📊',
        message: 'Here you\'ll see key statistics, recent activity, and quick actions for managing the school.',
        position: 'top'
      },
      {
        element: 'a[href="students.html"]',
        title: 'Manage Students 👨‍🎓',
        message: 'Click here to view, add, edit, or delete student records.',
        position: 'bottom'
      },
      {
        element: 'a[href="users.html"]',
        title: 'Manage Users 👥',
        message: 'As an administrator, you can manage system users, change roles, and control access.',
        position: 'bottom'
      }
    ],
    registrar: [
      {
        element: '#user-info',
        title: 'Welcome! 👋',
        message: 'You\'re logged in as a Registrar. You can register and manage student records.',
        position: 'bottom'
      },
      {
        element: '#notifications-button',
        title: 'Notifications 🔔',
        message: 'Get notified about new registrations and student updates.',
        position: 'bottom'
      },
      {
        element: 'a[href="students.html"]',
        title: 'Student Records 📋',
        message: 'Click here to register new students or manage existing records.',
        position: 'bottom'
      }
    ],
    teacher: [
      {
        element: '#user-info',
        title: 'Welcome Teacher! 👋',
        message: 'You can view and update student information for your classes.',
        position: 'bottom'
      },
      {
        element: '#notifications-button',
        title: 'Stay Informed 🔔',
        message: 'Get updates when student information changes.',
        position: 'bottom'
      },
      {
        element: 'a[href="students.html"]',
        title: 'View Students 👨‍🎓',
        message: 'Access student records and update information as needed.',
        position: 'bottom'
      }
    ],
    counselor: [
      {
        element: '#user-info',
        title: 'Welcome Counselor! 👋',
        message: 'You have access to view and update student records for counseling purposes.',
        position: 'bottom'
      },
      {
        element: 'a[href="students.html"]',
        title: 'Student Directory 📖',
        message: 'Access student information and update records during counseling sessions.',
        position: 'bottom'
      }
    ],
    staff: [
      {
        element: '#user-info',
        title: 'Welcome! 👋',
        message: 'You have view-only access to student information.',
        position: 'bottom'
      },
      {
        element: 'a[href="students.html"]',
        title: 'View Students 👀',
        message: 'Click here to search and view student records.',
        position: 'bottom'
      }
    ],
    security: [
      {
        element: '#user-info',
        title: 'Welcome Security! 👋',
        message: 'You can view student records for identification purposes.',
        position: 'bottom'
      },
      {
        element: 'a[href="students.html"]',
        title: 'Student Lookup 🔍',
        message: 'Search for students by ID or name to verify their identity.',
        position: 'bottom'
      }
    ]
  },
  
  students: {
    administrator: [
      {
        element: '#form-card',
        title: 'Register Students 📝',
        message: 'Fill out this form to register a new student. All fields marked with * are required.',
        position: 'top',
        highlight: true
      },
      {
        element: '#import-btn',
        title: 'Bulk Import 📤',
        message: 'Have many students to add? Upload a CSV file to import multiple students at once!',
        position: 'bottom'
      },
      {
        element: 'button[onclick="exportCSV()"]',
        title: 'Export Data 📥',
        message: 'Download all student records as a CSV file for backup or reporting.',
        position: 'bottom'
      },
      {
        element: '#search-input',
        title: 'Search Students 🔍',
        message: 'Quickly find students by name, ID, class, or guardian name.',
        position: 'bottom'
      },
      {
        element: '#sort-select',
        title: 'Sort Records 📊',
        message: 'Sort students by name, class, or student ID for easier management.',
        position: 'bottom'
      }
    ],
    registrar: [
      {
        element: '#form-card',
        title: 'Student Registration 📝',
        message: 'Use this form to register new students. Make sure all required information is accurate.',
        position: 'top',
        highlight: true
      },
      {
        element: '#import-btn',
        title: 'Bulk Import 📤',
        message: 'Upload a CSV file to register multiple students quickly!',
        position: 'bottom'
      },
      {
        element: '#search-input',
        title: 'Find Students 🔍',
        message: 'Search for existing students to view or update their records.',
        position: 'bottom'
      }
    ],
    teacher: [
      {
        element: '#search-input',
        title: 'Find Your Students 🔍',
        message: 'Search for students by name, ID, or class to view their information.',
        position: 'bottom'
      },
      {
        element: '#student-table-body',
        title: 'Student Records 📋',
        message: 'Click "Edit" on any student to update their information.',
        position: 'top'
      }
    ],
    counselor: [
      {
        element: '#search-input',
        title: 'Student Lookup 🔍',
        message: 'Search for students to view and update their records.',
        position: 'bottom'
      }
    ],
    staff: [
      {
        element: '#search-input',
        title: 'Search Students 🔍',
        message: 'Find students by name, ID, or class. You have view-only access.',
        position: 'bottom'
      }
    ],
    security: [
      {
        element: '#search-input',
        title: 'Student Verification 🔍',
        message: 'Search by student ID or name to verify their identity.',
        position: 'bottom'
      }
    ]
  },
  
  users: {
    administrator: [
      {
        element: '#search-users',
        title: 'Find Users 🔍',
        message: 'Search for users by name, email, employee ID, or role.',
        position: 'bottom'
      },
      {
        element: '#users-table-body',
        title: 'User Management 👥',
        message: 'Click "Edit" to change a user\'s role or activate/deactivate their account.',
        position: 'top'
      }
    ]
  }
};

// Tooltip state
let currentTour = [];
let currentStep = 0;
let tooltipElement = null;
let overlayElement = null;
let isActive = false;

// ── Initialize Onboarding ──────────────────────────
function initOnboarding(page, role) {
  // Onboarding disabled - annotations removed
  return;
  
  /* Original code - disabled
  // Check if user has completed onboarding
  const completed = getCompletedTours();
  const tourKey = `${page}_${role}`;
  
  if (completed.includes(tourKey)) {
    return; // Already completed
  }
  
  // Get tour for this page and role
  const tour = TOURS[page]?.[role];
  
  if (!tour || tour.length === 0) {
    return; // No tour available
  }
  
  // Wait a bit before starting
  setTimeout(() => {
    startTour(tour, tourKey);
  }, 1000);
  */
}

// ── Start Tour ─────────────────────────────────────
function startTour(tour, tourKey) {
  currentTour = tour;
  currentStep = 0;
  isActive = true;
  
  // Create overlay
  createOverlay();
  
  // Show first step
  showStep(currentStep, tourKey);
}

// ── Show Step ──────────────────────────────────────
function showStep(stepIndex, tourKey) {
  if (stepIndex >= currentTour.length) {
    endTour(tourKey);
    return;
  }
  
  const step = currentTour[stepIndex];
  const element = document.querySelector(step.element);
  
  if (!element) {
    // Element not found, skip to next
    currentStep++;
    setTimeout(() => showStep(currentStep, tourKey), 100);
    return;
  }
  
  // Highlight element
  highlightElement(element, step.highlight);
  
  // Create tooltip
  createTooltip(element, step, stepIndex, tourKey);
}

// ── Create Overlay ─────────────────────────────────
function createOverlay() {
  overlayElement = document.createElement('div');
  overlayElement.id = 'onboarding-overlay';
  overlayElement.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    backdrop-filter: blur(2px);
    animation: fadeIn 0.3s ease;
  `;
  
  document.body.appendChild(overlayElement);
}

// ── Highlight Element ──────────────────────────────
function highlightElement(element, shouldHighlight = false) {
  // Remove previous highlights
  document.querySelectorAll('.onboarding-highlight').forEach(el => {
    el.classList.remove('onboarding-highlight');
  });
  
  if (shouldHighlight) {
    element.classList.add('onboarding-highlight');
    
    // Add highlight styles if not already present
    if (!document.getElementById('onboarding-styles')) {
      const style = document.createElement('style');
      style.id = 'onboarding-styles';
      style.textContent = `
        .onboarding-highlight {
          position: relative;
          z-index: 9999 !important;
          box-shadow: 0 0 0 4px rgba(240, 73, 35, 0.5), 0 0 0 8px rgba(240, 73, 35, 0.2) !important;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(240, 73, 35, 0.5), 0 0 0 8px rgba(240, 73, 35, 0.2); }
          50% { box-shadow: 0 0 0 4px rgba(240, 73, 35, 0.8), 0 0 0 12px rgba(240, 73, 35, 0.3); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Scroll element into view
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── Create Tooltip ─────────────────────────────────
function createTooltip(element, step, stepIndex, tourKey) {
  // Remove existing tooltip
  if (tooltipElement) {
    tooltipElement.remove();
  }
  
  tooltipElement = document.createElement('div');
  tooltipElement.className = 'onboarding-tooltip';
  
  const totalSteps = currentTour.length;
  const isLastStep = stepIndex === totalSteps - 1;
  
  tooltipElement.innerHTML = `
    <div class="tooltip-content">
      <div class="tooltip-header">
        <h3 class="tooltip-title">${step.title}</h3>
        <button class="tooltip-close" onclick="skipTour('${tourKey}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <p class="tooltip-message">${step.message}</p>
      <div class="tooltip-footer">
        <div class="tooltip-progress">
          <span class="progress-text">${stepIndex + 1} of ${totalSteps}</span>
          <div class="progress-dots">
            ${Array.from({ length: totalSteps }, (_, i) => 
              `<span class="dot ${i === stepIndex ? 'active' : i < stepIndex ? 'completed' : ''}"></span>`
            ).join('')}
          </div>
        </div>
        <div class="tooltip-actions">
          ${stepIndex > 0 ? `<button class="btn-secondary" onclick="previousStep()">Back</button>` : ''}
          <button class="btn-primary" onclick="${isLastStep ? `finishTour('${tourKey}')` : 'nextStep()'}">
            ${isLastStep ? 'Got it! ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Position tooltip
  positionTooltip(tooltipElement, element, step.position);
  
  document.body.appendChild(tooltipElement);
}

// ── Position Tooltip ───────────────────────────────
function positionTooltip(tooltip, element, position = 'bottom') {
  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const padding = 16;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  tooltip.style.position = 'fixed';
  tooltip.style.zIndex = '10000';
  
  let top, left;
  
  // On mobile, always center the tooltip
  if (viewportWidth < 640) {
    // Center horizontally
    left = (viewportWidth - tooltipRect.width) / 2;
    
    // Position vertically with preference for bottom, but adjust if needed
    if (position === 'top' && rect.top > tooltipRect.height + padding * 2) {
      top = rect.top - tooltipRect.height - padding;
    } else if (rect.bottom + tooltipRect.height + padding * 2 < viewportHeight) {
      top = rect.bottom + padding;
    } else if (rect.top > tooltipRect.height + padding * 2) {
      top = rect.top - tooltipRect.height - padding;
    } else {
      // If neither top nor bottom works, center vertically
      top = (viewportHeight - tooltipRect.height) / 2;
    }
  } else {
    // Desktop positioning (original logic)
    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 16;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = rect.bottom + 16;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left - tooltipRect.width - 16;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + 16;
        break;
      default:
        top = rect.bottom + 16;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    }
  }
  
  // Ensure tooltip stays within viewport bounds
  top = Math.max(padding, Math.min(top, viewportHeight - tooltipRect.height - padding));
  left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding));
  
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

// ── Navigation Functions ───────────────────────────
function nextStep() {
  currentStep++;
  const tourKey = getCurrentTourKey();
  showStep(currentStep, tourKey);
}

function previousStep() {
  if (currentStep > 0) {
    currentStep--;
    const tourKey = getCurrentTourKey();
    showStep(currentStep, tourKey);
  }
}

function skipTour(tourKey) {
  if (confirm('Skip this tutorial? You can restart it anytime from your profile settings.')) {
    endTour(tourKey, false);
  }
}

function finishTour(tourKey) {
  endTour(tourKey, true);
}

// ── End Tour ───────────────────────────────────────
function endTour(tourKey, markComplete = true) {
  isActive = false;
  
  // Remove tooltip and overlay
  if (tooltipElement) {
    tooltipElement.remove();
    tooltipElement = null;
  }
  
  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
  }
  
  // Remove highlights
  document.querySelectorAll('.onboarding-highlight').forEach(el => {
    el.classList.remove('onboarding-highlight');
  });
  
  // Mark as completed
  if (markComplete) {
    markTourCompleted(tourKey);
  }
  
  currentTour = [];
  currentStep = 0;
}

// ── Storage Functions ──────────────────────────────
function getCompletedTours() {
  try {
    return JSON.parse(localStorage.getItem(ONBOARDING_KEY)) || [];
  } catch {
    return [];
  }
}

function markTourCompleted(tourKey) {
  const completed = getCompletedTours();
  if (!completed.includes(tourKey)) {
    completed.push(tourKey);
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(completed));
  }
}

function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
  alert('Onboarding reset! Refresh the page to see the tutorial again.');
}

function getCurrentTourKey() {
  // Try to determine current page and role
  const path = window.location.pathname;
  const page = path.includes('dashboard') ? 'dashboard' : 
               path.includes('users') ? 'users' : 'students';
  
  const session = JSON.parse(localStorage.getItem('srs_session') || '{}');
  const role = session.role || 'staff';
  
  return `${page}_${role}`;
}

// ── Add Tooltip Styles ─────────────────────────────
function addTooltipStyles() {
  if (document.getElementById('tooltip-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'tooltip-styles';
  style.textContent = `
    .onboarding-tooltip {
      animation: tooltipIn 0.3s ease;
    }
    
    @keyframes tooltipIn {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    
    .tooltip-content {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
      max-width: 360px;
      width: calc(100vw - 32px); /* Responsive width */
      border: 1px solid rgba(240, 73, 35, 0.2);
      max-height: calc(100vh - 100px); /* Prevent overflow */
      overflow-y: auto; /* Allow scrolling if needed */
    }
    
    @media (max-width: 640px) {
      .tooltip-content {
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 80px);
        padding: 16px;
        border-radius: 12px;
      }
      
      .tooltip-title {
        font-size: 16px !important;
      }
      
      .tooltip-message {
        font-size: 13px !important;
        margin-bottom: 12px !important;
      }
      
      .tooltip-footer {
        gap: 8px !important;
      }
      
      .btn-primary, .btn-secondary {
        padding: 10px 16px !important;
        font-size: 13px !important;
        flex: 1;
      }
      
      .tooltip-actions {
        width: 100%;
      }
    }
    
    .dark .tooltip-content {
      background: rgba(30, 22, 18, 0.98);
      border-color: rgba(255, 107, 66, 0.3);
    }
    
    .tooltip-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    
    .tooltip-title {
      font-size: 18px;
      font-weight: 700;
      color: #1e1612;
      margin: 0;
      font-family: 'DM Serif Display', serif;
    }
    
    .dark .tooltip-title {
      color: #f0ebe8;
    }
    
    .tooltip-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #8a7a74;
      transition: color 0.2s;
    }
    
    .tooltip-close:hover {
      color: #000000;
    }
    
    .tooltip-message {
      font-size: 14px;
      line-height: 1.6;
      color: #5a4a44;
      margin: 0 0 16px 0;
    }
    
    .dark .tooltip-message {
      color: #c0b0a8;
    }
    
    .tooltip-footer {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .tooltip-progress {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .progress-text {
      font-size: 12px;
      color: #8a7a74;
      font-weight: 500;
    }
    
    .progress-dots {
      display: flex;
      gap: 6px;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e0d0c8;
      transition: all 0.3s;
    }
    
    .dot.active {
      background: #000000;
      transform: scale(1.2);
    }
    
    .dot.completed {
      background: #4ade80;
    }
    
    .tooltip-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    .btn-primary, .btn-secondary {
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-family: 'DM Sans', sans-serif;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #1a1a1a, #000000);
      color: white;
      box-shadow: 0 4px 12px rgba(240, 73, 35, 0.3);
    }
    
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(240, 73, 35, 0.4);
    }
    
    .btn-secondary {
      background: rgba(240, 73, 35, 0.08);
      color: #000000;
      border: 1px solid rgba(240, 73, 35, 0.2);
    }
    
    .btn-secondary:hover {
      background: rgba(240, 73, 35, 0.15);
    }
  `;
  
  document.head.appendChild(style);
}

// ── Initialize ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  addTooltipStyles();
});


