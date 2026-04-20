/* ===================================================
   Dashboard System — dashboard.js
   =================================================== */

'use strict';

// Use existing constants from auth.js via window object
const STORAGE_KEY = 'srs_students';
// Don't redeclare - use window.SESSION_KEY, window.USERS_KEY, window.PERMISSIONS directly

let currentUser = null;
let permissions = null;
let students = [];
// Don't redeclare darkMode - it's already declared in auth.js


// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Dashboard: DOMContentLoaded fired');
  await checkAuth();
  loadData();
  initDarkMode();
  
  // Small delay to ensure data is loaded
  setTimeout(() => {
    console.log('Dashboard: Calling updateDashboardStats and renderDashboard');
    updateDashboardStats();
    renderDashboard();
    updateWidgets(); // Update the new widgets
  }, 100);
  
  // Start onboarding tour for new users
  if (currentUser && permissions) {
    initOnboarding('dashboard', currentUser.role);
  }
});

// Update dashboard stats
function updateDashboardStats() {
  try {
    console.log('Dashboard: updateDashboardStats called, students array:', students);
    const stats = calculateStats();
    console.log('Dashboard: Calculated stats:', stats);
    
    // Update stat cards
    const statTotal = document.getElementById('stat-total');
    const statMale = document.getElementById('stat-male');
    const statFemale = document.getElementById('stat-female');
    const statClasses = document.getElementById('stat-classes');
    
    if (statTotal) statTotal.textContent = stats.total;
    if (statMale) statMale.textContent = stats.male;
    if (statFemale) statFemale.textContent = stats.female;
    if (statClasses) statClasses.textContent = stats.classes;
    
    console.log('Dashboard: Updated stat cards');
    
    // Update class distribution
    updateClassDistribution(stats.classDistribution);
    
    // Update recent activity
    updateRecentActivity();
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
  }
}

// Update class distribution display
function updateClassDistribution(classDistribution) {
  const container = document.getElementById('class-distribution');
  if (!container) return;
  
  if (Object.keys(classDistribution).length === 0) {
    container.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">No students registered yet.</p>';
    return;
  }
  
  const total = Object.values(classDistribution).reduce((sum, count) => sum + count, 0);
  
  container.innerHTML = Object.entries(classDistribution)
    .sort((a, b) => b[1] - a[1])
    .map(([className, count]) => {
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return `
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${className}</span>
          <div class="flex items-center gap-3">
            <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style="width: ${percentage}%"></div>
            </div>
            <span class="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">${count}</span>
          </div>
        </div>
      `;
    }).join('');
}

// Update recent activity display
function updateRecentActivity() {
  const container = document.getElementById('recent-activity');
  if (!container) return;
  
  const recentActivity = getRecentActivity();
  
  if (recentActivity.length === 0) {
    container.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>';
    return;
  }
  
  container.innerHTML = recentActivity.slice(0, 5).map(activity => `
    <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
        <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 dark:text-white">${activity.name}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">${activity.action} • ${activity.time}</p>
      </div>
    </div>
  `).join('');
}

// ── Authentication ─────────────────────────────────
async function checkAuth() {
  try {
    currentUser = JSON.parse(localStorage.getItem(window.SESSION_KEY || 'srs_session'));
  } catch {
    currentUser = null;
  }
  
  if (!currentUser) {
    // Check if Supabase has a session (OAuth callback scenario)
    if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) {
      try {
        console.log('🔵 No local session, checking Supabase...');
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session && session.user) {
          console.log('✅ Found Supabase session, waiting for local session creation...');
          // Wait for handleAuthenticatedUser to create the local session
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check again
          try {
            currentUser = JSON.parse(localStorage.getItem(window.SESSION_KEY || 'srs_session'));
          } catch {
            currentUser = null;
          }
        }
      } catch (error) {
        console.error('Error checking Supabase session:', error);
      }
    }
    
    // If still no session, redirect to login
    if (!currentUser) {
      window.location.href = '../auth/login.html';
      return;
    }
  }
  
  permissions = window.PERMISSIONS[currentUser.role] || window.PERMISSIONS.staff;
  
  // Update UI
  const userName = document.getElementById('user-name');
  if (userName) {
    userName.textContent = currentUser.fullName.split(' ')[0] || 'User';
  }
  
  const welcomeMessage = document.getElementById('welcome-message');
  if (welcomeMessage) {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';
    
    welcomeMessage.textContent = `${greeting}! Here's what's happening with your school today.`;
  }
  
  // Only call updateUserInfo if profiles.js hasn't already rendered the profile switcher
  // profiles.js will render after a 100ms delay, so this runs first as a fallback
  if (!document.querySelector('.profile-switcher-container')) {
    updateUserInfo();
  }
  
  // Show users link for administrators
  if (currentUser.role === 'administrator') {
    const usersLink = document.getElementById('users-link');
    if (usersLink) usersLink.style.display = 'block';
    
    const sidebarUsersLink = document.getElementById('sidebar-users-link');
    if (sidebarUsersLink) sidebarUsersLink.style.display = 'flex';
  }
  
  // Show exams link for teachers, counselors, and administrators
  if (['teacher', 'counselor', 'administrator'].includes(currentUser.role)) {
    const examsLink = document.getElementById('exams-link');
    if (examsLink) examsLink.style.display = 'block';
    
    const sidebarExamsLink = document.getElementById('sidebar-exams-link');
    if (sidebarExamsLink) sidebarExamsLink.style.display = 'flex';
  }
  
  // Show student exams link for students
  if (currentUser.role === 'student') {
    const sidebarStudentExamsLink = document.getElementById('sidebar-student-exams-link');
    if (sidebarStudentExamsLink) sidebarStudentExamsLink.style.display = 'flex';
  }
}

// logout function is in auth.js - no need to duplicate it here

function updateUserInfo() {
  const userInfo = document.getElementById('user-info');
  
  // Generate initials (first letter of first two words)
  const names = currentUser.fullName.split(' ');
  const initials = names.length >= 2 
    ? names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase()
    : currentUser.fullName.charAt(0).toUpperCase();
  
  userInfo.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
        ${initials}
      </div>
      <div class="hidden sm:block">
        <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">${currentUser.fullName}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">${permissions.label}</p>
      </div>
    </div>
    <button onclick="logout()" class="ml-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
      </svg>
    </button>
  `;
}

// ── Data Loading ───────────────────────────────────
function loadData() {
  try {
    students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    console.log('Dashboard: Loaded students from localStorage:', students.length, 'students');
  } catch (error) {
    console.error('Dashboard: Error loading students:', error);
    students = [];
  }
}

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
  if (darkMode) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }
}

// ── Dashboard Rendering ────────────────────────────
function renderDashboard() {
  const role = currentUser.role;
  console.log('🔍 Dashboard: Rendering dashboard for role:', role);
  console.log('🔍 Dashboard: Current user object:', currentUser);
  
  switch(role) {
    case 'administrator':
      console.log('✅ Rendering Administrator Dashboard');
      renderAdministratorDashboard();
      break;
    case 'registrar':
      renderRegistrarDashboard();
      break;
    case 'teacher':
      renderTeacherDashboard();
      break;
    case 'counselor':
      renderCounselorDashboard();
      break;
    case 'bursar':
      console.log('✅ Rendering Bursar Dashboard');
      renderBursarDashboard();
      break;
    case 'secretary':
      console.log('✅ Rendering Secretary Dashboard');
      renderSecretaryDashboard();
      break;
    case 'staff':
      console.log('⚠️ Rendering Staff Dashboard');
      renderStaffDashboard();
      break;
    case 'security':
      renderSecurityDashboard();
      break;
    case 'student':
      renderStudentDashboard();
      break;
    default:
      console.log('⚠️ No role matched, rendering Staff Dashboard (default)');
      renderStaffDashboard();
  }
}

// ── Administrator Dashboard ────────────────────────
function renderAdministratorDashboard() {
  const stats = calculateStats();
  const recentActivity = getRecentActivity();
  
  document.getElementById('dashboard-content').innerHTML = `
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      ${createStatCard('Total Students', stats.total, 'users', 'blue')}
      ${createStatCard('Male Students', stats.male, 'male', 'indigo')}
      ${createStatCard('Female Students', stats.female, 'female', 'pink')}
      ${createStatCard('Classes', stats.classes, 'academic', 'orange')}
    </div>

    <!-- Quick Actions -->
    <div class="glass-card rounded-3xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
      <h2 class="font-display text-2xl text-gray-900 dark:text-white mb-4">Quick Actions</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        ${createQuickAction('Add Student', 'user-add', 'students.html')}
        ${createQuickAction('View All', 'view-list', 'students.html')}
        ${createQuickAction('Manage Users', 'users', 'users.html')}
        ${createQuickAction('Export Data', 'download', 'javascript:exportFromDashboard()')}
        ${createQuickAction('Timetable', 'calendar', 'timetable.html')}
        ${createQuickAction('Attendance', 'clipboard-check', 'attendance.html')}
        ${createQuickAction('Fees', 'currency', 'fees.html')}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Class Distribution -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.2s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Class Distribution</h3>
        ${renderClassDistribution(stats.classDistribution)}
      </div>

      <!-- Recent Activity -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.3s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        ${renderRecentActivity(recentActivity)}
      </div>
    </div>
  `;
}

// ── Registrar Dashboard ────────────────────────────
function renderRegistrarDashboard() {
  const stats = calculateStats();
  const recentStudents = students.slice(0, 5);
  
  document.getElementById('dashboard-content').innerHTML = `
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      ${createStatCard('Total Registered', stats.total, 'users', 'blue')}
      ${createStatCard('This Month', stats.thisMonth, 'calendar', 'green')}
      ${createStatCard('Pending Updates', stats.pendingUpdates, 'clock', 'yellow')}
      ${createStatCard('Classes', stats.classes, 'academic', 'orange')}
    </div>

    <!-- Quick Actions -->
    <div class="glass-card rounded-3xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
      <h2 class="font-display text-2xl text-gray-900 dark:text-white mb-4">Registration Tools</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        ${createQuickAction('New Registration', 'user-add', 'students.html')}
        ${createQuickAction('View Records', 'view-list', 'students.html')}
        ${createQuickAction('Export CSV', 'download', 'javascript:exportFromDashboard()')}
        ${createQuickAction('Search Student', 'search', 'students.html')}
      </div>
    </div>

    <!-- Recent Registrations -->
    <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.2s">
      <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Recent Registrations</h3>
      ${renderRecentStudents(recentStudents)}
    </div>
  `;
}

// ── Teacher Dashboard ──────────────────────────────
function renderTeacherDashboard() {
  const stats = calculateStats();
  const recentStudents = students.slice(0, 6);
  
  document.getElementById('dashboard-content').innerHTML = `
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      ${createStatCard('Total Students', stats.total, 'users', 'blue')}
      ${createStatCard('Classes', stats.classes, 'academic', 'orange')}
      ${createStatCard('Male/Female', `${stats.male}/${stats.female}`, 'chart', 'purple')}
    </div>

    <!-- Quick Actions -->
    <div class="glass-card rounded-3xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
      <h2 class="font-display text-2xl text-gray-900 dark:text-white mb-4">Teacher Tools</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        ${createQuickAction('View Students', 'view-list', 'students.html')}
        ${createQuickAction('Manage Exams', 'clipboard-list', 'exams.html')}
        ${createQuickAction('Update Records', 'edit', 'students.html')}
        ${createQuickAction('Export List', 'download', 'javascript:exportFromDashboard()')}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Class Overview -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.2s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Class Overview</h3>
        ${renderClassDistribution(stats.classDistribution)}
      </div>

      <!-- Recent Students -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.3s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Student List</h3>
        ${renderRecentStudents(recentStudents)}
      </div>
    </div>
  `;
}

// ── Counselor Dashboard ────────────────────────────
function renderCounselorDashboard() {
  const stats = calculateStats();
  const recentStudents = students.slice(0, 6);
  
  document.getElementById('dashboard-content').innerHTML = `
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      ${createStatCard('Total Students', stats.total, 'users', 'blue')}
      ${createStatCard('Classes', stats.classes, 'academic', 'orange')}
      ${createStatCard('Gender Ratio', `${Math.round(stats.male/stats.total*100)}% M`, 'chart', 'purple')}
    </div>

    <!-- Quick Actions -->
    <div class="glass-card rounded-3xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
      <h2 class="font-display text-2xl text-gray-900 dark:text-white mb-4">Counseling Tools</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        ${createQuickAction('View Students', 'view-list', 'students.html')}
        ${createQuickAction('View Exams', 'clipboard-list', 'exams.html')}
        ${createQuickAction('Update Info', 'edit', 'students.html')}
        ${createQuickAction('Export Data', 'download', 'javascript:exportFromDashboard()')}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Class Distribution -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.2s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Students by Class</h3>
        ${renderClassDistribution(stats.classDistribution)}
      </div>

      <!-- Student Directory -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.3s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Student Directory</h3>
        ${renderRecentStudents(recentStudents)}
      </div>
    </div>
  `;
}

// ── Bursar Dashboard ───────────────────────────────
function renderBursarDashboard() {
  const stats = calculateStats();
  
  // Load fees data
  let fees = {};
  try {
    fees = JSON.parse(localStorage.getItem('srs_fees')) || {};
  } catch {
    fees = {};
  }
  
  // Calculate financial stats
  let totalCollected = 0;
  let totalOutstanding = 0;
  let fullyPaid = 0;
  let defaulters = 0;
  
  students.forEach(student => {
    const feeRecord = fees[student.studentId];
    if (feeRecord) {
      totalCollected += feeRecord.totalPaid || 0;
      totalOutstanding += feeRecord.balance || 0;
      
      if (feeRecord.balance === 0) fullyPaid++;
      if (feeRecord.balance > 0 && feeRecord.totalPaid === 0) defaulters++;
    }
  });
  
  // Get recent payments
  const recentPayments = [];
  students.forEach(student => {
    const feeRecord = fees[student.studentId];
    if (feeRecord && feeRecord.payments) {
      feeRecord.payments.forEach(payment => {
        recentPayments.push({
          ...payment,
          studentName: student.fullName,
          studentId: student.studentId
        });
      });
    }
  });
  recentPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  document.getElementById('dashboard-content').innerHTML = `
    <!-- Financial Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      ${createStatCard('Total Collected', 'UGX ' + formatCurrency(totalCollected), 'currency', 'green')}
      ${createStatCard('Outstanding', 'UGX ' + formatCurrency(totalOutstanding), 'currency', 'red')}
      ${createStatCard('Fully Paid', fullyPaid, 'check', 'blue')}
      ${createStatCard('Defaulters', defaulters, 'alert', 'orange')}
    </div>

    <!-- Quick Actions -->
    <div class="glass-card rounded-3xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
      <h2 class="font-display text-2xl text-gray-900 dark:text-white mb-4">Financial Management</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        ${createQuickAction('Manage Fees', 'currency', 'fees.html')}
        ${createQuickAction('Record Payment', 'currency', 'fees.html')}
        ${createQuickAction('View Reports', 'chart', 'fees.html')}
        ${createQuickAction('Export Data', 'download', 'javascript:exportFromDashboard()')}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Payments -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.2s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Recent Payments</h3>
        ${renderRecentPayments(recentPayments.slice(0, 5))}
      </div>

      <!-- Payment Summary by Class -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.3s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Collection by Class</h3>
        ${renderPaymentsByClass(stats.classDistribution, fees)}
      </div>
    </div>
  `;
}

function renderRecentPayments(payments) {
  if (payments.length === 0) {
    return '<p class="text-sm text-gray-500 dark:text-gray-400">No recent payments</p>';
  }
  
  return `
    <div class="space-y-3">
      ${payments.map((payment, i) => {
        const date = new Date(payment.date).toLocaleDateString();
        return `
          <div class="activity-item flex items-start justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style="animation-delay: ${i * 0.05}s">
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">${payment.studentName}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${payment.method} • Receipt: ${payment.receipt}</p>
              <p class="text-xs text-gray-400 mt-0.5">${date}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-green-600 dark:text-green-400">UGX ${formatCurrency(payment.amount)}</p>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderPaymentsByClass(classDistribution, fees) {
  if (Object.keys(classDistribution).length === 0) {
    return '<p class="text-sm text-gray-500 dark:text-gray-400">No data available</p>';
  }
  
  const classTotals = {};
  
  students.forEach(student => {
    const className = student.classLevel;
    if (!classTotals[className]) {
      classTotals[className] = { collected: 0, outstanding: 0 };
    }
    
    const feeRecord = fees[student.studentId];
    if (feeRecord) {
      classTotals[className].collected += feeRecord.totalPaid || 0;
      classTotals[className].outstanding += feeRecord.balance || 0;
    }
  });
  
  return `
    <div class="space-y-3">
      ${Object.entries(classTotals).sort((a, b) => a[0].localeCompare(b[0])).map(([className, totals]) => {
        const total = totals.collected + totals.outstanding;
        const percentage = total > 0 ? Math.round((totals.collected / total) * 100) : 0;
        
        return `
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${className}</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">${percentage}%</span>
            </div>
            <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500" style="width: ${percentage}%"></div>
            </div>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xs text-green-600 dark:text-green-400">Collected: UGX ${formatCurrency(totals.collected)}</span>
              <span class="text-xs text-red-600 dark:text-red-400">Outstanding: UGX ${formatCurrency(totals.outstanding)}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function formatCurrency(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ── Secretary Dashboard ────────────────────────────
function renderSecretaryDashboard() {
  const stats = calculateStats();
  
  // Load secretary-specific data
  let documents = [];
  let appointments = [];
  let visitors = [];
  let announcements = [];
  
  try {
    documents = JSON.parse(localStorage.getItem('srs_documents')) || [];
    appointments = JSON.parse(localStorage.getItem('srs_appointments')) || [];
    visitors = JSON.parse(localStorage.getItem('srs_visitors')) || [];
    announcements = JSON.parse(localStorage.getItem('srs_announcements')) || [];
  } catch {
    // Initialize empty arrays if parsing fails
  }
  
  // Calculate secretary stats
  const pendingDocuments = documents.filter(d => d.status === 'pending').length;
  const todayAppointments = appointments.filter(a => {
    const apptDate = new Date(a.date).toDateString();
    return apptDate === new Date().toDateString();
  }).length;
  const todayVisitors = visitors.filter(v => {
    const visitDate = new Date(v.date).toDateString();
    return visitDate === new Date().toDateString();
  }).length;
  const activeAnnouncements = announcements.filter(a => a.active).length;
  
  document.getElementById('dashboard-content').innerHTML = `
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      ${createStatCard('Pending Documents', pendingDocuments, 'document', 'blue')}
      ${createStatCard('Today\'s Appointments', todayAppointments, 'calendar', 'green')}
      ${createStatCard('Today\'s Visitors', todayVisitors, 'users', 'purple')}
      ${createStatCard('Active Announcements', activeAnnouncements, 'megaphone', 'orange')}
    </div>

    <!-- Quick Actions -->
    <div class="glass-card rounded-3xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
      <h2 class="font-display text-2xl text-gray-900 dark:text-white mb-4">Office Management</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        ${createQuickAction('Documents', 'document', 'javascript:openDocuments()')}
        ${createQuickAction('Appointments', 'calendar', 'javascript:openAppointments()')}
        ${createQuickAction('Visitors Log', 'users', 'javascript:openVisitors()')}
        ${createQuickAction('Announcements', 'megaphone', 'javascript:openAnnouncements()')}
        ${createQuickAction('View Students', 'view-list', 'students.html')}
        ${createQuickAction('Correspondence', 'mail', 'javascript:openCorrespondence()')}
        ${createQuickAction('Phone Log', 'phone', 'javascript:openPhoneLog()')}
        ${createQuickAction('Reports', 'chart', 'javascript:openReports()')}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Today's Appointments -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.2s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Today's Appointments</h3>
        ${renderTodayAppointments(appointments)}
      </div>

      <!-- Recent Visitors -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.3s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Recent Visitors</h3>
        ${renderRecentVisitors(visitors)}
      </div>

      <!-- Pending Documents -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.4s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Pending Documents</h3>
        ${renderPendingDocuments(documents)}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
      <!-- Active Announcements -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.5s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Active Announcements</h3>
        ${renderActiveAnnouncements(announcements)}
      </div>

      <!-- Quick Stats -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.6s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Quick Stats</h3>
        ${renderQuickStats(stats)}
      </div>

      <!-- Recent Activity -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.7s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        ${renderRecentActivity(getRecentActivity())}
      </div>
    </div>
  `;
}

function renderTodayAppointments(appointments) {
  const today = new Date().toDateString();
  const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  if (todayAppts.length === 0) {
    return '<p class="text-sm text-gray-500 dark:text-gray-400">No appointments scheduled for today</p>';
  }
  
  return `
    <div class="space-y-3">
      ${todayAppts.slice(0, 5).map((appt, i) => {
        const time = new Date(appt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        return `
          <div class="activity-item flex items-start justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style="animation-delay: ${i * 0.05}s">
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">${appt.title}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${appt.with || 'N/A'} • ${time}</p>
              ${appt.location ? `<p class="text-xs text-gray-400 mt-0.5">📍 ${appt.location}</p>` : ''}
            </div>
            <span class="text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              ${time}
            </span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderRecentVisitors(visitors) {
  const recentVisitors = visitors.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  
  if (recentVisitors.length === 0) {
    return '<p class="text-sm text-gray-500 dark:text-gray-400">No visitors logged yet</p>';
  }
  
  return `
    <div class="space-y-3">
      ${recentVisitors.map((visitor, i) => {
        const date = new Date(visitor.date);
        const timeAgo = formatTimeAgo(visitor.date);
        return `
          <div class="activity-item flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style="animation-delay: ${i * 0.05}s">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
              ${visitor.name.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">${visitor.name}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${visitor.purpose || 'Visit'}</p>
              <p class="text-xs text-gray-400 mt-0.5">${timeAgo}</p>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderPendingDocuments(documents) {
  const pending = documents.filter(d => d.status === 'pending').slice(0, 5);
  
  if (pending.length === 0) {
    return '<p class="text-sm text-gray-500 dark:text-gray-400">No pending documents</p>';
  }
  
  return `
    <div class="space-y-3">
      ${pending.map((doc, i) => {
        const typeColor = 
          doc.type === 'Letter' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
          doc.type === 'Certificate' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
          doc.type === 'Report' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
          'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
        
        return `
          <div class="activity-item flex items-start justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style="animation-delay: ${i * 0.05}s">
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">${doc.title}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${doc.description || 'No description'}</p>
            </div>
            <span class="text-xs px-2 py-1 rounded-full ${typeColor}">
              ${doc.type}
            </span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderActiveAnnouncements(announcements) {
  const active = announcements.filter(a => a.active).slice(0, 5);
  
  if (active.length === 0) {
    return '<p class="text-sm text-gray-500 dark:text-gray-400">No active announcements</p>';
  }
  
  return `
    <div class="space-y-3">
      ${active.map((ann, i) => {
        const priorityColor = 
          ann.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
          ann.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
          'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
        
        return `
          <div class="activity-item p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style="animation-delay: ${i * 0.05}s">
            <div class="flex items-start justify-between mb-2">
              <p class="text-sm font-semibold text-gray-900 dark:text-white flex-1">${ann.title}</p>
              <span class="text-xs px-2 py-1 rounded-full ${priorityColor}">
                ${ann.priority || 'normal'}
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">${ann.message}</p>
            <p class="text-xs text-gray-400 mt-1">${formatTimeAgo(ann.date)}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderQuickStats(stats) {
  return `
    <div class="space-y-4">
      <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <span class="text-sm text-gray-600 dark:text-gray-400">Total Students</span>
        <span class="text-lg font-bold text-gray-900 dark:text-white">${stats.total}</span>
      </div>
      <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <span class="text-sm text-gray-600 dark:text-gray-400">Classes</span>
        <span class="text-lg font-bold text-gray-900 dark:text-white">${stats.classes}</span>
      </div>
      <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <span class="text-sm text-gray-600 dark:text-gray-400">Male Students</span>
        <span class="text-lg font-bold text-blue-600 dark:text-blue-400">${stats.male}</span>
      </div>
      <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <span class="text-sm text-gray-600 dark:text-gray-400">Female Students</span>
        <span class="text-lg font-bold text-pink-600 dark:text-pink-400">${stats.female}</span>
      </div>
    </div>
  `;
}

// Placeholder functions for Quick Actions (to be implemented)
function openDocuments() {
  showToast('Document Management feature coming soon', 'info');
}

function openAppointments() {
  showToast('Appointments feature coming soon', 'info');
}

function openVisitors() {
  showToast('Visitors Log feature coming soon', 'info');
}

function openAnnouncements() {
  showToast('Announcements feature coming soon', 'info');
}

function openCorrespondence() {
  showToast('Correspondence feature coming soon', 'info');
}

function openPhoneLog() {
  showToast('Phone Log feature coming soon', 'info');
}

function openReports() {
  showToast('Reports feature coming soon', 'info');
}

// ── Staff Dashboard ────────────────────────────────
function renderStaffDashboard() {
  const stats = calculateStats();
  const recentStudents = students.slice(0, 8);
  
  document.getElementById('dashboard-content').innerHTML = `
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      ${createStatCard('Total Students', stats.total, 'users', 'blue')}
      ${createStatCard('Male', stats.male, 'male', 'indigo')}
      ${createStatCard('Female', stats.female, 'female', 'pink')}
      ${createStatCard('Classes', stats.classes, 'academic', 'orange')}
    </div>

    <!-- Quick Actions -->
    <div class="glass-card rounded-3xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
      <h2 class="font-display text-2xl text-gray-900 dark:text-white mb-4">Quick Access</h2>
      <div class="grid grid-cols-2 sm:grid-cols-2 gap-4">
        ${createQuickAction('View Students', 'view-list', 'students.html')}
        ${createQuickAction('Search', 'search', 'students.html')}
      </div>
    </div>

    <!-- Student Directory -->
    <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.2s">
      <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Student Directory</h3>
      ${renderRecentStudents(recentStudents)}
    </div>
  `;
}

// ── Security Dashboard ─────────────────────────────
function renderSecurityDashboard() {
  const stats = calculateStats();
  const recentStudents = students.slice(0, 10);
  
  document.getElementById('dashboard-content').innerHTML = `
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      ${createStatCard('Total Students', stats.total, 'users', 'blue')}
      ${createStatCard('Male', stats.male, 'male', 'indigo')}
      ${createStatCard('Female', stats.female, 'female', 'pink')}
    </div>

    <!-- Quick Actions -->
    <div class="glass-card rounded-3xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
      <h2 class="font-display text-2xl text-gray-900 dark:text-white mb-4">Security Access</h2>
      <div class="grid grid-cols-2 gap-4">
        ${createQuickAction('View Students', 'view-list', 'students.html')}
        ${createQuickAction('Search ID', 'search', 'students.html')}
      </div>
    </div>

    <!-- Student List -->
    <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.2s">
      <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Student Identification List</h3>
      ${renderRecentStudents(recentStudents)}
    </div>
  `;
}

// ── Student Dashboard ──────────────────────────────
function renderStudentDashboard() {
  const exams = JSON.parse(localStorage.getItem('srs_exams')) || [];
  const submissions = JSON.parse(localStorage.getItem('srs_submissions')) || [];
  
  // Get student's class from their profile (we'll need to match by email or ID)
  const studentClass = currentUser.class || 'Senior 1'; // Default if not set
  
  // Filter exams for student's class
  const availableExams = exams.filter(e => e.class === studentClass);
  const mySubmissions = submissions.filter(s => s.studentId === currentUser.userId);
  
  const completedCount = mySubmissions.filter(s => s.graded).length;
  const pendingCount = mySubmissions.filter(s => !s.graded).length;
  const totalScore = mySubmissions.filter(s => s.graded).reduce((sum, s) => sum + s.score, 0);
  const totalPossible = mySubmissions.filter(s => s.graded).reduce((sum, s) => {
    const exam = exams.find(e => e.id === s.examId);
    return sum + (exam ? exam.totalMarks : 0);
  }, 0);
  const averagePercent = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  
  document.getElementById('dashboard-content').innerHTML = `
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      ${createStatCard('Available Exams', availableExams.length, 'clipboard-list', 'blue')}
      ${createStatCard('Completed', completedCount, 'check', 'green')}
      ${createStatCard('Pending Grading', pendingCount, 'clock', 'orange')}
      ${createStatCard('Average Score', averagePercent + '%', 'chart', 'purple')}
    </div>

    <!-- Quick Actions -->
    <div class="glass-card rounded-3xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
      <h2 class="font-display text-2xl text-gray-900 dark:text-white mb-4">Student Portal</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        ${createQuickAction('Take Exam', 'clipboard-list', 'student-exams.html')}
        ${createQuickAction('View Results', 'chart', 'student-exams.html?tab=results')}
        ${createQuickAction('My Profile', 'user', 'student-profile.html')}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Available Exams -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.2s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Available Exams</h3>
        ${renderStudentExams(availableExams, mySubmissions)}
      </div>

      <!-- Recent Results -->
      <div class="glass-card rounded-3xl p-6 fade-in" style="animation-delay: 0.3s">
        <h3 class="font-display text-xl text-gray-900 dark:text-white mb-4">Recent Results</h3>
        ${renderStudentResults(mySubmissions, exams)}
      </div>
    </div>
  `;
}

function renderStudentExams(exams, submissions) {
  if (exams.length === 0) {
    return '<p class="text-gray-500 dark:text-gray-400 text-sm">No exams available for your class yet.</p>';
  }
  
  return `
    <div class="space-y-3">
      ${exams.slice(0, 5).map(exam => {
        const submitted = submissions.find(s => s.examId === exam.id);
        const dueDate = new Date(exam.dueDate);
        const isPast = dueDate < new Date();
        
        return `
          <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-brand-400 transition-colors">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">${exam.title}</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">${exam.subject} • ${exam.duration} mins • ${exam.totalMarks} marks</p>
              </div>
              ${submitted ? 
                '<span class="text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">Submitted</span>' :
                isPast ?
                '<span class="text-xs px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">Overdue</span>' :
                '<span class="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">Available</span>'
              }
            </div>
            <p class="text-xs text-gray-400">Due: ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderStudentResults(submissions, exams) {
  const gradedSubmissions = submissions.filter(s => s.graded);
  
  if (gradedSubmissions.length === 0) {
    return '<p class="text-gray-500 dark:text-gray-400 text-sm">No graded results yet.</p>';
  }
  
  return `
    <div class="space-y-3">
      ${gradedSubmissions.slice(0, 5).map(sub => {
        const exam = exams.find(e => e.id === sub.examId);
        if (!exam) return '';
        
        const percent = Math.round((sub.score / exam.totalMarks) * 100);
        const grade = percent >= 90 ? 'A' : percent >= 80 ? 'B' : percent >= 70 ? 'C' : percent >= 60 ? 'D' : 'F';
        const gradeColor = percent >= 70 ? 'text-green-600 dark:text-green-400' : percent >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
        
        return `
          <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">${exam.title}</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">${exam.subject}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold ${gradeColor}">${sub.score}/${exam.totalMarks}</p>
                <p class="text-xs text-gray-500">${percent}% (${grade})</p>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ── Helper Functions ───────────────────────────────
function calculateStats() {
  const total = students.length;
  const male = students.filter(s => s.gender === 'Male').length;
  const female = students.filter(s => s.gender === 'Female').length;
  
  const classDistribution = {};
  students.forEach(s => {
    classDistribution[s.classLevel] = (classDistribution[s.classLevel] || 0) + 1;
  });
  
  const classes = Object.keys(classDistribution).length;
  
  // This month registrations
  const now = new Date();
  const thisMonth = students.filter(s => {
    if (!s.createdAt) return false;
    const created = new Date(s.createdAt);
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;
  
  const pendingUpdates = 0; // Placeholder
  
  return {
    total,
    male,
    female,
    classes,
    classDistribution,
    thisMonth,
    pendingUpdates
  };
}

function createStatCard(label, value, icon, color) {
  const icons = {
    users: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>',
    male: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
    female: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
    academic: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>',
    calendar: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>',
    clock: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    chart: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
    'clipboard-list': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>',
    check: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    user: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
    currency: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    alert: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
    document: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
    megaphone: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>',
    mail: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>'
  };
  
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    orange: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  };
  
  return `
    <div class="glass-card rounded-3xl p-6 stat-card fade-in">
      <div class="flex items-center justify-between mb-3">
        <div class="w-12 h-12 rounded-2xl ${colorClasses[color]} flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            ${icons[icon] || icons.users}
          </svg>
        </div>
      </div>
      <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">${value}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">${label}</p>
    </div>
  `;
}

function createQuickAction(label, icon, link) {
  const icons = {
    'user-add': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>',
    'view-list': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
    'download': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>',
    'chart': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
    'search': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>',
    'edit': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>',
    'users': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>',
    'clipboard-list': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>',
    'calendar': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>',
    'clipboard-check': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>',
    'currency': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    'document': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
    'megaphone': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>',
    'mail': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>',
    'phone': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>'
  };
  
  const isJavascript = link.startsWith('javascript:');
  const href = isJavascript ? '#' : link;
  const onclick = isJavascript ? `onclick="${link.replace('javascript:', '')}"` : '';
  
  return `
    <a href="${href}" ${onclick} class="quick-action glass-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-brand-400 transition-all">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(240,73,35,0.1)">
        <svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          ${icons[icon] || icons['view-list']}
        </svg>
      </div>
      <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">${label}</span>
    </a>
  `;
}

function renderClassDistribution(distribution) {
  if (Object.keys(distribution).length === 0) {
    return '<p class="text-gray-500 dark:text-gray-400 text-sm">No data available</p>';
  }
  
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  return `
    <div class="space-y-3">
      ${Object.entries(distribution).sort((a, b) => a[0].localeCompare(b[0])).map(([className, count]) => {
        const percentage = Math.round((count / total) * 100);
        return `
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${className}</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">${count} (${percentage}%)</span>
            </div>
            <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full rounded-full" style="width: ${percentage}%; background: linear-gradient(90deg, #1a1a1a, #de2d0c);"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderRecentStudents(studentList) {
  if (studentList.length === 0) {
    return '<p class="text-gray-500 dark:text-gray-400 text-sm">No students registered yet</p>';
  }
  
  return `
    <div class="space-y-2">
      ${studentList.map((s, i) => `
        <div class="activity-item flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style="animation-delay: ${i * 0.05}s">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
              ${s.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">${s.fullName}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">${s.studentId} • ${s.classLevel}</p>
            </div>
          </div>
          <span class="text-xs px-2 py-1 rounded-full ${s.gender === 'Male' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'}">
            ${s.gender}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

function getRecentActivity() {
  return students.slice(0, 5).map(s => ({
    type: 'registration',
    student: s.fullName,
    time: s.createdAt,
    by: s.createdBy || 'System'
  }));
}

function renderRecentActivity(activities) {
  if (activities.length === 0) {
    return '<p class="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>';
  }
  
  return `
    <div class="space-y-3">
      ${activities.map((activity, i) => `
        <div class="activity-item flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style="animation-delay: ${i * 0.05}s">
          <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: rgba(240,73,35,0.1)">
            <svg class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white"><span class="font-semibold">${activity.student}</span> was registered</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">By ${activity.by} • ${formatTimeAgo(activity.time)}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

function exportFromDashboard() {
  if (!permissions.canExport) {
    alert('You do not have permission to export data');
    return;
  }
  
  if (students.length === 0) {
    alert('No students to export');
    return;
  }

  const headers = ['Student ID', 'Full Name', 'Gender', 'Date of Birth', 'Class', 'Guardian', 'Contact', 'Registered At'];
  const rows = students.map(s => [
    s.studentId, s.fullName, s.gender, s.dob, s.classLevel, s.parentName, s.contact,
    s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''
  ]);

  const csv = [headers, ...rows].map(r => r.map(c => `"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `students_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  alert(`Exported ${students.length} student records`);
}

// Alias for dashboard HTML button
function exportStudents() {
  exportFromDashboard();
}

// ── Widget Functions ───────────────────────────────
function updateWidgets() {
  updateSidebarNotifications();
  updateSidebarSchedule();
  updateSidebarPerformance();
}

function updateSidebarNotifications() {
  const notifications = JSON.parse(localStorage.getItem('srs_notifications')) || [];
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3);
  
  const container = document.getElementById('sidebar-notifications');
  const badge = document.getElementById('sidebar-notification-badge');
  
  if (badge) {
    badge.textContent = unreadNotifications.length;
    if (unreadNotifications.length > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
  
  if (!container) return;
  
  if (unreadNotifications.length === 0) {
    container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No new notifications</p>';
    return;
  }
  
  container.innerHTML = unreadNotifications.map(notif => `
    <div class="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <p class="font-medium text-gray-900 dark:text-white line-clamp-1">${notif.title}</p>
      <p class="text-gray-400 mt-0.5">${formatTimeAgo(notif.timestamp)}</p>
    </div>
  `).join('');
}

function updateSidebarSchedule() {
  const container = document.getElementById('sidebar-schedule');
  if (!container) return;
  
  const role = currentUser?.role;
  
  if (role === 'student') {
    // Show upcoming exams for students
    const exams = JSON.parse(localStorage.getItem('srs_exams')) || [];
    const studentClass = currentUser.class;
    const upcomingExams = exams
      .filter(e => e.class === studentClass && new Date(e.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
    
    if (upcomingExams.length === 0) {
      container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No upcoming exams</p>';
      return;
    }
    
    container.innerHTML = upcomingExams.map(exam => {
      const dueDate = new Date(exam.dueDate);
      const daysUntil = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
      
      return `
        <div class="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div class="flex items-start justify-between gap-2">
            <p class="font-medium text-gray-900 dark:text-white line-clamp-1 flex-1">${exam.title}</p>
            <span class="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${daysUntil <= 2 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}">
              ${daysUntil}d
            </span>
          </div>
          <p class="text-gray-400 mt-0.5">${exam.subject}</p>
        </div>
      `;
    }).join('');
    
  } else if (['teacher', 'counselor', 'administrator'].includes(role)) {
    // Show upcoming exams for teachers/admins
    const exams = JSON.parse(localStorage.getItem('srs_exams')) || [];
    const upcomingExams = exams
      .filter(e => new Date(e.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
    
    if (upcomingExams.length === 0) {
      container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No upcoming exams</p>';
      return;
    }
    
    container.innerHTML = upcomingExams.map(exam => {
      const dueDate = new Date(exam.dueDate);
      const daysUntil = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
      
      return `
        <div class="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div class="flex items-start justify-between gap-2">
            <p class="font-medium text-gray-900 dark:text-white line-clamp-1 flex-1">${exam.title}</p>
            <span class="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              ${daysUntil}d
            </span>
          </div>
          <p class="text-gray-400 mt-0.5">${exam.class}</p>
        </div>
      `;
    }).join('');
    
  } else {
    container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No upcoming events</p>';
  }
}

function updateSidebarPerformance() {
  const container = document.getElementById('sidebar-performance');
  if (!container) return;
  
  const role = currentUser?.role;
  
  if (role === 'student') {
    // Show student's grade performance
    const submissions = JSON.parse(localStorage.getItem('srs_submissions')) || [];
    const mySubmissions = submissions.filter(s => s.studentId === currentUser.userId && s.graded);
    
    if (mySubmissions.length === 0) {
      container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No graded exams yet</p>';
      return;
    }
    
    const exams = JSON.parse(localStorage.getItem('srs_exams')) || [];
    const totalScore = mySubmissions.reduce((sum, s) => sum + s.score, 0);
    const totalPossible = mySubmissions.reduce((sum, s) => {
      const exam = exams.find(e => e.id === s.examId);
      return sum + (exam ? exam.totalMarks : 0);
    }, 0);
    const averagePercent = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    
    container.innerHTML = `
      <div class="space-y-2">
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-gray-600 dark:text-gray-400">Average</span>
            <span class="text-lg font-bold text-gray-900 dark:text-white">${averagePercent}%</span>
          </div>
          <div class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style="width: ${averagePercent}%"></div>
          </div>
        </div>
        <div class="text-gray-500 dark:text-gray-400">
          ${mySubmissions.length} exam${mySubmissions.length !== 1 ? 's' : ''} graded
        </div>
      </div>
    `;
    
  } else if (['teacher', 'counselor', 'administrator'].includes(role)) {
    // Show system/class performance stats
    const stats = calculateStats();
    const submissions = JSON.parse(localStorage.getItem('srs_submissions')) || [];
    const pendingGrading = submissions.filter(s => !s.graded).length;
    
    container.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">Students</span>
          <span class="font-bold text-gray-900 dark:text-white">${stats.total}</span>
        </div>
        ${['teacher', 'administrator'].includes(role) ? `
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">Pending</span>
          <span class="font-bold text-orange-600 dark:text-orange-400">${pendingGrading}</span>
        </div>
        ` : ''}
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">Classes</span>
          <span class="font-bold text-gray-900 dark:text-white">${stats.classes}</span>
        </div>
      </div>
    `;
    
  } else {
    // For other roles (registrar, staff, security)
    const stats = calculateStats();
    
    container.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">Students</span>
          <span class="font-bold text-gray-900 dark:text-white">${stats.total}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">Classes</span>
          <span class="font-bold text-gray-900 dark:text-white">${stats.classes}</span>
        </div>
      </div>
    `;
  }
}




