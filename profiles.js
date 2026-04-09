/* ===================================================
   Profile Management System — profiles.js
   Chrome-style profile switching
   =================================================== */

'use strict';

const PROFILES_KEY = 'srs_profiles';
const ACTIVE_PROFILE_KEY = 'srs_active_profile';
const SESSION_KEY = 'srs_session';
const USERS_KEY = 'srs_users';

// ── Profile Management ─────────────────────────────

// Get all saved profiles
function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY)) || [];
  } catch {
    return [];
  }
}

// Save profiles
function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

// Get active profile ID
function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

// Set active profile
function setActiveProfileId(profileId) {
  if (profileId) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  } else {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

// Add current session as a profile
function addCurrentProfile(nickname = null) {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
  
  if (!session.userId) {
    throw new Error('No active session to save');
  }
  
  const profiles = getProfiles();
  
  // Check if profile already exists
  const existing = profiles.find(p => p.userId === session.userId);
  if (existing) {
    showProfileToast('This account is already saved as a profile', 'info');
    return existing;
  }
  
  const profile = {
    id: Date.now().toString(),
    userId: session.userId,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    nickname: nickname || session.fullName,
    avatar: generateProfileAvatar(session.fullName),
    color: generateProfileColor(session.role),
    addedAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  };
  
  if (session.class) {
    profile.class = session.class;
  }
  
  profiles.push(profile);
  saveProfiles(profiles);
  setActiveProfileId(profile.id);
  
  showProfileToast('Profile saved successfully!', 'success');
  updateProfileUI();
  return profile;
}

// Remove a profile
function removeProfile(profileId) {
  let profiles = getProfiles();
  const profile = profiles.find(p => p.id === profileId);
  
  if (!profile) {
    showProfileToast('Profile not found', 'error');
    return;
  }
  
  if (confirm(`Remove profile "${profile.nickname}"?`)) {
    profiles = profiles.filter(p => p.id !== profileId);
    saveProfiles(profiles);
    
    // If removed profile was active, clear active
    if (getActiveProfileId() === profileId) {
      setActiveProfileId(null);
    }
    
    showProfileToast('Profile removed', 'success');
    updateProfileUI();
  }
}

// Switch to a profile
function switchToProfile(profileId) {
  const profiles = getProfiles();
  const profile = profiles.find(p => p.id === profileId);
  
  if (!profile) {
    showProfileToast('Profile not found', 'error');
    return;
  }
  
  // Get user credentials from users storage
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const user = users.find(u => u.id === profile.userId);
  
  if (!user) {
    showProfileToast('User account not found. This profile may be outdated.', 'error');
    return;
  }
  
  if (!user.isActive) {
    showProfileToast('This account has been deactivated', 'error');
    return;
  }
  
  // Create session for this profile
  const session = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    employeeId: user.employeeId,
    loginAt: new Date().toISOString()
  };
  
  if (user.class) {
    session.class = user.class;
  }
  
  // Save session
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  
  // Update profile last used
  profile.lastUsed = new Date().toISOString();
  const updatedProfiles = profiles.map(p => p.id === profileId ? profile : p);
  saveProfiles(updatedProfiles);
  setActiveProfileId(profileId);
  
  showProfileToast(`Switched to ${profile.nickname}`, 'success');
  
  // Reload page to reflect new session
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

// Get current profile
function getCurrentProfile() {
  const activeId = getActiveProfileId();
  if (!activeId) return null;
  
  const profiles = getProfiles();
  return profiles.find(p => p.id === activeId);
}

// Check if current session is saved as profile
function isCurrentSessionSaved() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
  if (!session.userId) return false;
  
  const profiles = getProfiles();
  return profiles.some(p => p.userId === session.userId);
}

// ── UI Functions ───────────────────────────────────

// Render profile switcher in navbar
function renderProfileSwitcher() {
  const userInfo = document.getElementById('user-info');
  if (!userInfo) return;
  
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
  if (!session.userId) return;
  
  const currentProfile = getCurrentProfile();
  const profiles = getProfiles();
  const isSaved = isCurrentSessionSaved();
  
  const avatar = currentProfile ? currentProfile.avatar : generateProfileAvatar(session.fullName);
  const color = currentProfile ? currentProfile.color : generateProfileColor(session.role);
  const displayName = currentProfile ? currentProfile.nickname : session.fullName;
  
  userInfo.innerHTML = `
    <div class="relative profile-switcher-container">
      <button type="button" onclick="toggleProfileMenu()" style="cursor: pointer;" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style="background: ${color}; cursor: pointer;">
          ${avatar}
        </div>
        <div class="hidden sm:block text-left">
          <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">${displayName}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">${getProfileRoleLabel(session.role)}</p>
        </div>
        <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      
      <!-- Profile Menu -->
      <div id="profile-menu" class="hidden absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-xl overflow-hidden z-50">
        <!-- Current Profile -->
        <div class="p-4 border-b border-gray-100 dark:border-white/5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white" style="background: ${color}">
              ${avatar}
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 dark:text-white">${displayName}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">${session.email}</p>
              <p class="text-xs text-gray-400">${getProfileRoleLabel(session.role)}</p>
            </div>
          </div>
          ${!isSaved ? `
            <button onclick="addCurrentProfile()" class="w-full py-2 px-3 rounded-xl text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Save this profile
            </button>
          ` : ''}
        </div>
        
        <!-- Saved Profiles -->
        ${profiles.length > 0 ? `
          <div class="p-2 max-h-64 overflow-y-auto">
            <p class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Saved Profiles</p>
            ${profiles.map(p => `
              <div class="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${p.id === currentProfile?.id ? 'bg-brand-50 dark:bg-brand-900/20' : ''}">
                <button onclick="switchToProfile('${p.id}')" class="flex items-center gap-3 flex-1 text-left">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: ${p.color}">
                    ${p.avatar}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white text-sm truncate">${p.nickname}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${p.email}</p>
                  </div>
                  ${p.id === currentProfile?.id ? `
                    <svg class="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  ` : ''}
                </button>
                <button onclick="removeProfile('${p.id}')" class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all" title="Remove profile">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- Actions -->
        <div class="p-2 border-t border-gray-100 dark:border-white/5">
          <button onclick="logout()" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Toggle profile menu
function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu');
  if (!menu) return;
  
  menu.classList.toggle('hidden');
  
  // Close when clicking outside
  if (!menu.classList.contains('hidden')) {
    setTimeout(() => {
      document.addEventListener('click', closeProfileMenuOnClickOutside);
    }, 0);
  } else {
    document.removeEventListener('click', closeProfileMenuOnClickOutside);
  }
}

function closeProfileMenuOnClickOutside(e) {
  const menu = document.getElementById('profile-menu');
  const container = document.querySelector('.profile-switcher-container');
  
  if (menu && container && !container.contains(e.target)) {
    menu.classList.add('hidden');
    document.removeEventListener('click', closeProfileMenuOnClickOutside);
  }
}

// Update profile UI
function updateProfileUI() {
  renderProfileSwitcher();
}
}

// ── Helper Functions ───────────────────────────────

// Generate avatar initials
function generateProfileAvatar(fullName) {
  const names = fullName.split(' ');
  if (names.length >= 2) {
    return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
  }
  return fullName.charAt(0).toUpperCase();
}

// Generate color based on role
function generateProfileColor(role) {
  const colors = {
    administrator: '#ef4444',
    registrar: '#3b82f6',
    teacher: '#10b981',
    counselor: '#8b5cf6',
    staff: '#6b7280',
    security: '#f59e0b',
    student: '#ec4899'
  };
  return colors[role] || '#f04923';
}

// Get role label
function getProfileRoleLabel(role) {
  const labels = {
    administrator: 'Administrator',
    registrar: 'Registrar',
    teacher: 'Teacher',
    counselor: 'Counselor',
    staff: 'Staff',
    security: 'Security',
    student: 'Student'
  };
  return labels[role] || role;
}

// Show toast notification
function showProfileToast(message, type = 'info') {
  // Try to use existing toast system if available
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
    return;
  }
  
  // Create simple toast
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  }`;
  toast.textContent = message;
  toast.style.animation = 'slideInRight 0.3s ease';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Init ───────────────────────────────────────────

// Initialize profile system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfiles);
} else {
  initProfiles();
}

function initProfiles() {
  // Only initialize on pages with user-info element
  const userInfo = document.getElementById('user-info');
  if (userInfo) {
    // Check if we have a session
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    if (session.userId) {
      // Render immediately
      renderProfileSwitcher();
    }
  }
}
