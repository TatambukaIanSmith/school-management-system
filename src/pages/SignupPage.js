// Signup Page
import { AuthLayout } from '../layouts/AuthLayout.js';
import { signup } from '../services/authService.js';
import { setCurrentUser, setPermissions } from '../state/appState.js';
import { showToast } from '../components/Toast.js';
import { getUserPermissions } from '../services/authService.js';
import { ROLES, CLASSES } from '../config/constants.js';

export function SignupPage() {
  const content = `
    <div class="text-center mb-8 auth-card">
      <div class="w-16 h-16 rounded-2xl btn-brand flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
      </div>
      <h1 class="font-display text-3xl text-gray-900 dark:text-white mb-2">Create Account</h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Join the school registration system</p>
    </div>

    <div class="glass-card rounded-3xl p-8 auth-card" style="animation-delay: 0.1s">
      <form id="signup-form" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
          <input type="text" id="full-name" placeholder="John Doe" class="form-input" required />
          <p class="text-red-400 text-xs mt-1.5 hidden" id="err-full-name">Full name is required</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input type="email" id="email" placeholder="your.email@school.com" class="form-input" required />
            <p class="text-red-400 text-xs mt-1.5 hidden" id="err-email">Valid email is required</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ID Number</label>
            <input type="text" id="employee-id" placeholder="EMP2024001 or STU2024001" class="form-input" required />
            <p class="text-red-400 text-xs mt-1.5 hidden" id="err-employee-id">ID number is required</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select Your Role</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3" id="role-grid">
            ${renderRoleBadges()}
          </div>
          <input type="hidden" id="role" required />
          <p class="text-red-400 text-xs mt-2 hidden" id="err-role">Please select a role</p>
        </div>

        <div id="class-selection" class="hidden">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Your Class *</label>
          <select id="student-class" class="form-input">
            <option value="">Choose your class</option>
            ${CLASSES.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <p class="text-red-400 text-xs mt-1.5 hidden" id="err-class">Please select your class</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <div class="relative">
              <input type="password" id="password" placeholder="Min. 8 characters" class="form-input pr-12" required />
              <button type="button" onclick="window.togglePasswordField('password')" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p class="text-red-400 text-xs mt-1.5 hidden" id="err-password">Min. 8 characters required</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
            <div class="relative">
              <input type="password" id="confirm-password" placeholder="Re-enter password" class="form-input pr-12" required />
              <button type="button" onclick="window.togglePasswordField('confirm-password')" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p class="text-red-400 text-xs mt-1.5 hidden" id="err-confirm-password">Passwords must match</p>
          </div>
        </div>

        <button type="submit" class="w-full btn-brand py-3 rounded-2xl font-semibold text-base flex items-center justify-center gap-2">
          <span>Create Account</span>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
          </svg>
        </button>
      </form>

      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">Already have an account?</span>
        </div>
      </div>

      <a href="#/login" class="block w-full py-3 rounded-2xl font-semibold text-base text-center border-2 border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 transition-colors text-gray-700 dark:text-gray-300">
        Sign In
      </a>
    </div>

    <div class="flex items-center justify-center gap-3 mt-6">
      <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
      </svg>
      <div class="toggle-switch" id="dark-toggle" onclick="window.handleDarkToggle()">
        <div class="knob"></div>
      </div>
      <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
      </svg>
    </div>
  `;
  
  setTimeout(() => {
    attachSignupHandlers();
  }, 0);
  
  return AuthLayout(content);
}

function renderRoleBadges() {
  const roles = [
    { value: ROLES.ADMINISTRATOR, label: 'Administrator', desc: 'Full Access', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { value: ROLES.REGISTRAR, label: 'Registrar', desc: 'Manage Records', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { value: ROLES.TEACHER, label: 'Teacher', desc: 'View & Edit', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { value: ROLES.COUNSELOR, label: 'Counselor', desc: 'View & Edit', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { value: ROLES.STAFF, label: 'Staff', desc: 'View Only', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { value: ROLES.SECURITY, label: 'Security', desc: 'View Only', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { value: ROLES.STUDENT, label: 'Student', desc: 'Take Exams', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' }
  ];
  
  return roles.map(role => `
    <div class="role-badge glass-card p-4 rounded-2xl text-center border-2 border-transparent cursor-pointer hover:scale-105 transition-transform" data-role="${role.value}">
      <div class="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style="background: rgba(240,73,35,0.1)">
        <svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24