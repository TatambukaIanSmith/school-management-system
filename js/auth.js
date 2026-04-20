/* ===================================================
   Authentication System — auth.js
   =================================================== */
//

'use strict';

const USERS_KEY = 'srs_users';
const SESSION_KEY = 'srs_session';

// ── Role Selection ─────────────────────────────────
let selectedRole = null;

function selectRole(role) {
  selectedRole = role;
  document.getElementById('role').value = role;
  
  // Update UI
  document.querySelectorAll('.role-badge').forEach(badge => {
    badge.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  // Hide error
  document.getElementById('err-role')?.classList.add('hidden');
  
  // Show/hide class selection for students
  const classSelection = document.getElementById('class-selection');
  if (classSelection) {
    if (role === 'student') {
      classSelection.classList.remove('hidden');
      document.getElementById('student-class').required = true;
    } else {
      classSelection.classList.add('hidden');
      document.getElementById('student-class').required = false;
      document.getElementById('student-class').value = '';
    }
  }
}

// Expose functions to window immediately for HTML onclick handlers
window.selectRole = selectRole;
console.log('✅ selectRole function exposed to window');

// Expose to window for other scripts
window.USERS_KEY = USERS_KEY;
window.SESSION_KEY = SESSION_KEY;

// Role-based permissions
const PERMISSIONS = {
  administrator: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    label: 'Administrator',
    description: 'Full system access'
  },
  registrar: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    label: 'Registrar',
    description: 'Manage student records'
  },
  teacher: {
    canView: true,
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canExport: true,
    label: 'Teacher',
    description: 'View and edit students'
  },
  counselor: {
    canView: true,
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canExport: true,
    label: 'Counselor',
    description: 'View and edit students'
  },
  staff: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    label: 'Staff',
    description: 'View only access'
  },
  security: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    label: 'Security',
    description: 'View only access'
  },
  secretary: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExport: true,
    label: 'Secretary',
    description: 'Manage records and documentation'
  },
  bursar: {
    canView: true,
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canExport: true,
    label: 'Bursar',
    description: 'Financial records and student data'
  },
  student: {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    label: 'Student',
    description: 'Take exams and view results'
  }
};

// Expose PERMISSIONS to window for other scripts
window.PERMISSIONS = PERMISSIONS;

// ── Dark Mode ──────────────────────────────────────
let darkMode = false;

function initDarkMode() {
  darkMode = localStorage.getItem('srs_dark') === 'true';
  applyDark();
}

function toggleDark() {
  darkMode = !darkMode;
  localStorage.setItem('srs_dark', darkMode);
  applyDark();
}

function applyDark() {
  const root = document.getElementById('body-root');
  const toggle = document.getElementById('dark-toggle');
  if (darkMode) {
    root.classList.add('dark');
    document.documentElement.classList.add('dark');
  } else {
    root.classList.remove('dark');
    document.documentElement.classList.remove('dark');
  }
  if (toggle) toggle.classList.toggle('active', darkMode);
}

// ── Password Toggle ────────────────────────────────
function togglePassword(fieldId) {
  const field = fieldId ? document.getElementById(fieldId) : document.getElementById('password');
  if (!field) return;
  
  const type = field.type === 'password' ? 'text' : 'password';
  field.type = type;
}

// ── Signup Form ────────────────────────────────────
if (document.getElementById('signup-form')) {
  document.getElementById('signup-form').addEventListener('submit', handleSignup);
}

async function handleSignup(e) {
  e.preventDefault();
  
  if (!validateSignup()) return;
  
  const fullName = document.getElementById('full-name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const employeeId = document.getElementById('employee-id').value.trim();
  const role = document.getElementById('role').value;
  const password = document.getElementById('password').value;
  const studentClass = role === 'student' ? document.getElementById('student-class').value : null;
  
  // Check if Supabase is available
  if (typeof supabaseSignUp !== 'function') {
    showError('signup-error', 'Database connection not available. Please try again later.');
    return;
  }
  
  // Create user in Supabase
  const result = await supabaseSignUp(email, password, {
    fullName,
    employeeId,
    role,
    class: studentClass
  });
  
  if (!result.success) {
    showError('signup-error', result.error || 'Signup failed. Please try again.');
    return;
  }
  
  // Create session
  const newUser = {
    id: result.user.id,
    userId: result.user.id,
    fullName,
    email,
    employeeId,
    role,
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  if (role === 'student' && studentClass) {
    newUser.class = studentClass;
  }
  
  createSession(newUser);
  
  // Redirect to dashboard
  window.location.href = '../app/dashboard.html';
}

function validateSignup() {
  let valid = true;
  
  // Full name
  const fullName = document.getElementById('full-name').value.trim();
  if (!fullName) {
    showFieldError('full-name', 'err-full-name', 'Full name is required');
    valid = false;
  } else {
    hideFieldError('full-name', 'err-full-name');
  }
  
  // Email
  const email = document.getElementById('email').value.trim();
  if (!email || !isValidEmail(email)) {
    showFieldError('email', 'err-email', 'Valid email is required');
    valid = false;
  } else {
    hideFieldError('email', 'err-email');
  }
  
  // Employee ID
  const employeeId = document.getElementById('employee-id').value.trim();
  if (!employeeId) {
    showFieldError('employee-id', 'err-employee-id', 'Employee ID is required');
    valid = false;
  } else {
    hideFieldError('employee-id', 'err-employee-id');
  }
  
  // Role
  const role = document.getElementById('role').value;
  if (!role) {
    document.getElementById('err-role').classList.remove('hidden');
    valid = false;
  } else {
    document.getElementById('err-role').classList.add('hidden');
  }
  
  // Class (for students only)
  if (role === 'student') {
    const studentClass = document.getElementById('student-class').value;
    if (!studentClass) {
      showFieldError('student-class', 'err-class', 'Please select your class');
      valid = false;
    } else {
      hideFieldError('student-class', 'err-class');
    }
  }
  
  // Password
  const password = document.getElementById('password').value;
  if (!password || password.length < 8) {
    showFieldError('password', 'err-password', 'Min. 8 characters required');
    valid = false;
  } else {
    hideFieldError('password', 'err-password');
  }
  
  // Confirm password
  const confirmPassword = document.getElementById('confirm-password').value;
  if (confirmPassword !== password) {
    showFieldError('confirm-password', 'err-confirm-password', 'Passwords must match');
    valid = false;
  } else {
    hideFieldError('confirm-password', 'err-confirm-password');
  }
  
  return valid;
}

// ── Login Form ─────────────────────────────────────
if (document.getElementById('login-form')) {
  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

// ── Google Sign-In Button ──────────────────────────
async function handleGoogleSignIn() {
  if (typeof supabaseSignInWithGoogle === 'function') {
    const result = await supabaseSignInWithGoogle();
    if (!result.success && result.error) {
      showError('login-error', result.error);
    }
    // If successful, Supabase will redirect automatically
  } else {
    alert('Google Sign-In is not configured. Please set up Supabase first.');
  }
}

// Expose to window for onclick handler
window.handleGoogleSignIn = handleGoogleSignIn;

async function handleLogin(e) {
  e.preventDefault();
  
  if (!validateLogin()) return;
  
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  
  // Check if Supabase is available
  if (typeof supabaseSignIn !== 'function') {
    showError('login-error', 'Database connection not available. Please try again later.');
    return;
  }
  
  // Use Supabase authentication
  const result = await supabaseSignIn(email, password);
  
  if (!result.success) {
    showError('login-error', result.error || 'Invalid email or password');
    return;
  }
  
  // Success - redirect to dashboard
  window.location.href = '../app/dashboard.html';
}

function validateLogin() {
  let valid = true;
  
  const email = document.getElementById('email').value.trim();
  if (!email || !isValidEmail(email)) {
    showFieldError('email', 'err-email', 'Please enter a valid email');
    valid = false;
  } else {
    hideFieldError('email', 'err-email');
  }
  
  const password = document.getElementById('password').value;
  if (!password) {
    showFieldError('password', 'err-password', 'Password is required');
    valid = false;
  } else {
    hideFieldError('password', 'err-password');
  }
  
  return valid;
}

// ── Session Management ─────────────────────────────
function createSession(user) {
  const session = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    employeeId: user.employeeId,
    loginAt: new Date().toISOString()
  };
  
  // Add class for students
  if (user.class) {
    session.class = user.class;
  }
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// NEW: Async version that waits for Supabase session
async function requireAuth() {
  // First check localStorage session
  const localSession = getSession();
  if (localSession) {
    return localSession;
  }
  
  // If no local session, check if Supabase is available and has a session
  if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) {
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session && session.user) {
        console.log('✅ Found Supabase session, creating local session');
        // Session exists in Supabase but not in localStorage
        // This happens after OAuth redirect
        // The handleAuthenticatedUser function will create the session
        // Wait a bit for it to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check again
        const newLocalSession = getSession();
        if (newLocalSession) {
          return newLocalSession;
        }
      }
    } catch (error) {
      console.error('Error checking Supabase session:', error);
    }
  }
  
  // No session found, redirect to login
  window.location.href = '../auth/login.html';
  return null;
}

function logout() {
  clearSession();
  // Use absolute path from root
  const loginPath = window.location.origin + '/auth/login.html';
  console.log('Logging out, redirecting to:', loginPath);
  window.location.href = loginPath;
}

function getUserPermissions(role) {
  return PERMISSIONS[role] || PERMISSIONS.staff;
}

// ── Helpers ────────────────────────────────────────
function uuid() {
  return crypto.randomUUID?.() ||
    ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

function hashPassword(password) {
  // Simple hash for demo - use bcrypt or similar in production
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36) + btoa(password).split('').reverse().join('');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  
  if (field) field.classList.add('border-red-400');
  if (error) {
    error.textContent = message;
    error.classList.remove('hidden');
  }
}

function hideFieldError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  
  if (field) field.classList.remove('border-red-400');
  if (error) error.classList.add('hidden');
}

function showError(containerId, message) {
  const container = document.getElementById(containerId);
  const text = document.getElementById(containerId + '-text');
  
  if (text) text.textContent = message;
  if (container) container.classList.remove('hidden');
}

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
});



