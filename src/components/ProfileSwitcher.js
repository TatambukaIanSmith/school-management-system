// Profile Switcher Component (Chrome-style)
import { getProfiles, getCurrentProfile, switchToProfile, removeProfile, addProfile, isCurrentSessionSaved } from '../services/profileService.js';
import { getSession } from '../services/authService.js';
import { showToast } from './Toast.js';

export function ProfileSwitcher() {
  const profiles = getProfiles();
  const currentProfile = getCurrentProfile();
  const session = getSession();
  
  if (!session) return '';
  
  return `
    <div class="relative profile-switcher">
      <button 
        id="profile-button" 
        class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onclick="window.toggleProfileMenu()"
      >
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style="background: ${currentProfile?.color || 'linear-gradient(135deg, #ff6b42, #de2d0c)'}"
        >
          ${currentProfile?.avatar || session.fullName.charAt(0).toUpperCase()}
        </div>
        <div class="hidden sm:block text-left">
          <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">
            ${currentProfile?.nickname || session.fullName}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">${session.role}</p>
        </div>
        <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      
      <!-- Dropdown Menu -->
      <div 
        id="profile-menu" 
        class="hidden absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-xl z-50 overflow-hidden"
      >
        <!-- Current Profile -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-3">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
              style="background: ${currentProfile?.color || 'linear-gradient(135deg, #ff6b42, #de2d0c)'}"
            >
              ${currentProfile?.avatar || session.fullName.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 dark:text-white">
                ${currentProfile?.nickname || session.fullName}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">${session.email}</p>
              <p class="text-xs text-brand-500 capitalize">${session.role}</p>
            </div>
          </div>
          
          ${!isCurrentSessionSaved() ? `
            <button 
              onclick="window.saveCurrentProfile()"
              class="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Save this profile
            </button>
          ` : ''}
        </div>
        
        <!-- Saved Profiles -->
        ${profiles.length > 0 ? `
          <div class="p-2">
            <p class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Saved Profiles (${profiles.length})
            </p>
            <div class="space-y-1 max-h-64 overflow-y-auto">
              ${profiles.map(profile => `
                <div class="profile-item flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${currentProfile?.id === profile.id ? 'bg-brand-50 dark:bg-brand-900/20' : ''}">
                  <button 
                    onclick="window.switchProfile('${profile.id}')"
                    class="flex items-center gap-3 flex-1 text-left"
                  >
                    <div 
                      class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style="background: ${profile.color}"
                    >
                      ${profile.avatar}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        ${profile.nickname}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">${profile.role}</p>
                    </div>
                    ${currentProfile?.id === profile.id ? `
                      <svg class="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    ` : ''}
                  </button>
                  ${currentProfile?.id !== profile.id ? `
                    <button 
                      onclick="window.removeProfileConfirm('${profile.id}', '${profile.nickname}')"
                      class="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Remove profile"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="p-6 text-center">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.will be logged out to add another account. Continue?')) {
    window.location.hash = '#/login';
  }
};

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('profile-menu');
  const button = document.getElementById('profile-button');
  
  if (menu && button && !menu.contains(e.target) && !button.contains(e.target)) {
    menu.classList.add('hidden');
  }
});
 } catch (error) {
      showToast(error.message, 'error');
    }
  }
};

window.addAnotherAccount = () => {
  if (confirm('You    switchToProfile(profileId);
    showToast('Switched profile successfully!', 'success');
    
    // Reload to apply new session
    window.location.reload();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.removeProfileConfirm = (profileId, nickname) => {
  if (confirm(`Remove profile "${nickname}"? You can add it back anytime.`)) {
    try {
      removeProfile(profileId);
      showToast('Profile removed', 'success');
      
      // Refresh UI
      window.location.reload();
   rror');
  }
};

window.switchProfile = (profileId) => {
  try {
 f (menu) {
    menu.classList.toggle('hidden');
  }
};

window.saveCurrentProfile = () => {
  try {
    const session = getSession();
    const nickname = prompt('Enter a nickname for this profile (optional):', session.fullName);
    
    if (nickname === null) return; // User cancelled
    
    addProfile(session, nickname || null);
    showToast('Profile saved successfully!', 'success');
    
    // Refresh the page to update UI
    window.location.reload();
  } catch (error) {
    showToast(error.message, 'es
window.toggleProfileMenu = () => {
  const menu = document.getElementById('profile-menu');
  ired-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  `;
}

// Global handlerll px-3 py-2 rounded-xl text-sm font-semibold text--gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Add another account
          </button>
          
          <button 
            onclick="window.handleLogout()"
            class="w-fundow.addAnotherAccount()"
            class="w-full px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">No saved profiles yet</p>
            <p class="text-xs text-gray-400">Save profiles for quick switching</p>
          </div>
        `}
        
        <!-- Actions -->
        <div class="p-2 border-t border-gray-200 dark:border-gray-700">
          <button 
            onclick="wi