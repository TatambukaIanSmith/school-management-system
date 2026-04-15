/* ===================================================
   User Management — users.js
   =================================================== */

'use strict';

const USERS_KEY = 'srs_users';
const SESSION_KEY = 'srs_session';

let currentUser = null;
let allUsers = [];
let filteredUsers = [];
let darkMode = false;

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadUsers();
  initDarkMode();
  renderUsers();
  updateUserInfo();
  
  // Start onboarding tour for administrators
  if (currentUser) {
    initOnboarding('users', 'administrator');
  }
});

// ── Authentication ─────────────────────────────────
function checkAuth() {
  try {
    currentUser = JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    currentUser = null;
  }
  
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  
  // Only administrators can access user management
  if (currentUser.role !== 'administrator') {
    alert('Access denied. Only administrators can manage users.');
    window.location.href = 'dashboard.html';
    return;
  }
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

function updateUserInfo() {
  const userInfo = document.getElementById('user-info');
  userInfo.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
        ${currentUser.fullName.split(' ').length >= 2 ? currentUser.fullName.split(' ')[0].charAt(0).toUpperCase() + currentUser.fullName.split(' ')[1].charAt(0).toUpperCase() : currentUser.fullName.charAt(0).toUpperCase()}
      </div>
      <div class="hidden sm:block">
        <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">${currentUser.fullName}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
      </div>
    </div>
    <button onclick="logout()" class="ml-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
      </svg>
    </button>
  `;
}

// ── Load Users ─────────────────────────────────────
function loadUsers() {
  try {
    allUsers = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    allUsers = [];
  }
  filteredUsers = [...allUsers];
}

// ── Search Users ───────────────────────────────────
function searchUsers() {
  const query = document.getElementById('search-users').value.toLowerCase().trim();
  
  if (!query) {
    filteredUsers = [...allUsers];
  } else {
    filteredUsers = allUsers.filter(u =>
      u.fullName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.employeeId.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  }
  
  renderUsers();
}

// ── Render Users ───────────────────────────────────
function renderUsers() {
  const tbody = document.getElementById('users-table-body');
  const count = document.getElementById('user-count');
  
  count.textContent = `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`;
  
  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
          No users found
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredUsers.map((user, i) => {
    const roleColors = {
      administrator: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      registrar: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      teacher: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      counselor: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      staff: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
      security: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
    };
    
    const roleLabels = {
      administrator: 'Administrator',
      registrar: 'Registrar',
      teacher: 'Teacher',
      counselor: 'Counselor',
      staff: 'Staff',
      security: 'Security'
    };
    
    const isCurrentUser = user.id === currentUser.userId;
    const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
    
    return `
      <tr class="user-row border-b border-gray-50 dark:border-white/5 last:border-0" style="animation-delay: ${i * 40}ms">
        <td class="px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
              ${user.fullName.split(' ').length >= 2 ? user.fullName.split(' ')[0].charAt(0).toUpperCase() + user.fullName.split(' ')[1].charAt(0).toUpperCase() : user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">${user.fullName}${isCurrentUser ? ' (You)' : ''}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">${user.email}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-3">
          <span class="font-mono text-xs font-medium text-gray-600 dark:text-gray-400">${user.employeeId}</span>
        </td>
        <td class="px-4 py-3">
          <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.staff}">
            ${roleLabels[user.role] || user.role}
          </span>
        </td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}">
            <span class="w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}"></span>
            ${user.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td class="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">${joinedDate}</td>
        <td class="px-4 py-3 text-right">
          <div class="flex items-center justify-end gap-2">
            ${!isCurrentUser ? `
              <button onclick="editUser('${user.id}')" class="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors" style="background: rgba(240,73,35,0.08); color: #000000; border: 1px solid rgba(240,73,35,0.15);">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
            ` : '<span class="text-xs text-gray-400">Current User</span>'}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Edit User ──────────────────────────────────────
function editUser(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;
  
  document.getElementById('edit-user-id').value = user.id;
  document.getElementById('edit-role').value = user.role;
  document.getElementById('edit-status').value = user.isActive.toString();
  
  document.getElementById('edit-modal').classList.remove('hidden');
  document.getElementById('edit-modal').classList.add('flex');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  document.getElementById('edit-modal').classList.remove('flex');
}

// ── Save User Changes ──────────────────────────────
document.getElementById('edit-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const userId = document.getElementById('edit-user-id').value;
  const newRole = document.getElementById('edit-role').value;
  const newStatus = document.getElementById('edit-status').value === 'true';
  
  const userIndex = allUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) return;
  
  allUsers[userIndex].role = newRole;
  allUsers[userIndex].isActive = newStatus;
  
  localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
  
  loadUsers();
  searchUsers();
  closeEditModal();
  
  toast('User updated successfully', 'success');
});

// ── Dark Mode ──────────────────────────────────────
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

// ── Toast Notifications ────────────────────────────
function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');

  const icons = {
    success: `<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
    error: `<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
  };

  t.className = `toast toast-${type}`;
  t.style.cssText = `
    padding: 14px 20px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    backdrop-filter: blur(20px);
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2.7s forwards;
    min-width: 240px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    background: ${type === 'success' ? 'rgba(240,73,35,0.92)' : 'rgba(220,38,38,0.92)'};
    color: white;
    border: 1px solid rgba(255,255,255,0.2);
  `;
  
  t.innerHTML = (icons[type] || '') + `<span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3100);
}

