/* ===================================================
   Dashboard System — dashboard.js
   =================================================== */

'use strict';

const STORAGE_KEY = 'srs_students';
const SESSION_KEY = 'srs_session';
const USERS_KEY = 'srs_users';

let currentUser = null;
let permissions = null;
let students = [];
let darkMode = false;

// Role-based permissions
const PERMISSIONS = {
  administrator: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    label: 'Administrator'
  },
  registrar: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    label: 'Registrar'
  },
  teacher: {
    canView: true,
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canExport: true,
    label: 'Teacher'
  },
  counselor: {
    canView: true,
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canExport: true,
    label: 'Counselor'
  },
  staff: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    label: 'Staff'
  },
  security: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    label: 'Security'
  }
};

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadData();
  initDarkMode();
  renderDashboard();
  
  // Start onboarding tour for new users
  if (currentUser && permissions) {
    initOnboarding('dashboard', currentUser.role);
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
  
  permissions = PERMISSIONS[currentUser.role] || PERMISSIONS.staff;
  
  // Update UI
  document.getElementById('user-name').textContent = currentUser.fullName.split(' ')[0];
  
  // Only call updateUserInfo if profiles.js hasn't already rendered the profile switcher
  // profiles.js will render after a 100ms delay, so this runs first as a fallback
  if (!document.querySelector('.profile-switcher-container')) {
    updateUserInfo();
  }
  
  // Show users link for administrators
  if (currentUser.role === 'administrator') {
    const usersLink = document.getElementById('users-link');
    if (usersLink) usersLink.style.display = 'block';
  }
  
  // Show exams link for teachers, counselors, and administrators
  if (['teacher', 'counselor', 'administrator'].includes(currentUser.role)) {
    const examsLink = document.getElementById('exams-link');
    if (examsLink) examsLink.style.display = 'block';
  }
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

function updateUserInfo() {
  const userInfo = document.getElementById('user-info');
  
  // Generate initials (first letter of first two words)
  const names = currentUser.fullName.split(' ');
  const initials = names.length >= 2 
    ? names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase()
    : currentUser.fullName.charAt(0).toUpperCase();
  
  userInfo.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style="background: linear-gradient(135deg, #ff6b42, #de2d0c)">
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
  } catch {
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

// ── Dashboard Rendering ────────────────────────────
function renderDashboard() {
  const role = currentUser.role;
  
  switch(role) {
    case 'administrator':
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
    case 'staff':
      renderStaffDashboard();
      break;
    case 'security':
      renderSecurityDashboard();
      break;
    case 'student':
      renderStudentDashboard();
      break;
    default:
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
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        ${createQuickAction('Add Student', 'user-add', 'index.html')}
        ${createQuickAction('View All', 'view-list', 'index.html')}
        ${createQuickAction('Manage Users', 'users', 'users.html')}
        ${createQuickAction('Export Data', 'download', 'javascript:exportFromDashboard()')}
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
        ${createQuickAction('New Registration', 'user-add', 'index.html')}
        ${createQuickAction('View Records', 'view-list', 'index.html')}
        ${createQuickAction('Export CSV', 'download', 'javascript:exportFromDashboard()')}
        ${createQuickAction('Search Student', 'search', 'index.html')}
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
        ${createQuickAction('View Students', 'view-list', 'index.html')}
        ${createQuickAction('Manage Exams', 'clipboard-list', 'exams.html')}
        ${createQuickAction('Update Records', 'edit', 'index.html')}
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
        ${createQuickAction('View Students', 'view-list', 'index.html')}
        ${createQuickAction('View Exams', 'clipboard-list', 'exams.html')}
        ${createQuickAction('Update Info', 'edit', 'index.html')}
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
        ${createQuickAction('View Students', 'view-list', 'index.html')}
        ${createQuickAction('Search', 'search', 'index.html')}
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
        ${createQuickAction('View Students', 'view-list', 'index.html')}
        ${createQuickAction('Search ID', 'search', 'index.html')}
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
    user: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>'
  };
  
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
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
    'clipboard-list': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>'
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
              <div class="h-full rounded-full" style="width: ${percentage}%; background: linear-gradient(90deg, #ff6b42, #de2d0c);"></div>
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
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: linear-gradient(135deg, #ff6b42, #de2d0c)">
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

