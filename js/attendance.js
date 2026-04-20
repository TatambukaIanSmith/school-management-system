/* ===================================================
   Attendance Tracking — attendance.js
   =================================================== */

'use strict';

const ATTENDANCE_KEY = 'srs_attendance';
const STUDENTS_KEY = 'srs_students';
let currentUser = null;
let currentClass = '';
let currentDate = '';
let students = [];
let attendance = {};
let darkMode = false;

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadData();
  initDarkMode();
  updateUserInfo();
  
  // Set today's date
  document.getElementById('attendance-date').valueAsDate = new Date();
  currentDate = getTodayDate();
  
  // Make functions globally accessible
  window.loadAttendance = loadAttendance;
  window.markStatus = markStatus;
  window.markAllPresent = markAllPresent;
  window.saveAttendance = saveAttendance;
  window.exportAttendance = exportAttendance;
  window.toggleDark = toggleDark;
});

// ── Authentication ─────────────────────────────────
function checkAuth() {
  try {
    currentUser = JSON.parse(localStorage.getItem('srs_session'));
  } catch {
    currentUser = null;
  }
  
  if (!currentUser) {
    window.location.href = '../auth/login.html';
    return;
  }
  
  // Only administrators, registrars, and teachers can access attendance
  if (!['administrator', 'registrar', 'teacher'].includes(currentUser.role)) {
    alert('Access denied. Only administrators, registrars, and teachers can mark attendance.');
    window.location.href = 'dashboard.html';
    return;
  }
}

function updateUserInfo() {
  const userInfo = document.getElementById('user-info');
  const initials = currentUser.fullName.split(' ').length >= 2 
    ? currentUser.fullName.split(' ')[0].charAt(0).toUpperCase() + currentUser.fullName.split(' ')[1].charAt(0).toUpperCase()
    : currentUser.fullName.charAt(0).toUpperCase();
  
  userInfo.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
        ${initials}
      </div>
      <div class="hidden sm:block">
        <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">${currentUser.fullName}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">${getRoleLabel(currentUser.role)}</p>
      </div>
    </div>
  `;
}

function getRoleLabel(role) {
  const labels = {
    administrator: 'Administrator',
    registrar: 'Registrar',
    teacher: 'Teacher'
  };
  return labels[role] || role;
}

// ── Load Data ──────────────────────────────────────
function loadData() {
  try {
    students = JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
    attendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};
  } catch {
    students = [];
    attendance = {};
  }
}

function saveAttendanceData() {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// ── Load Attendance ────────────────────────────────
function loadAttendance() {
  const classSelect = document.getElementById('class-select');
  const dateInput = document.getElementById('attendance-date');
  
  currentClass = classSelect.value;
  currentDate = dateInput.value;
  
  if (!currentClass || !currentDate) {
    document.getElementById('attendance-container').innerHTML = `
      <div class="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
        </svg>
        <p class="text-lg font-medium">Select a class and date to mark attendance</p>
      </div>
    `;
    return;
  }
  
  // Filter students by class
  const classStudents = students.filter(s => s.classLevel === currentClass);
  
  if (classStudents.length === 0) {
    document.getElementById('attendance-container').innerHTML = `
      <div class="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <p class="text-lg font-medium">No students found in ${currentClass}</p>
        <p class="text-sm mt-2">Add students to this class first</p>
      </div>
    `;
    return;
  }
  
  renderAttendanceList(classStudents);
  updateStats();
}

// ── Render Attendance List ─────────────────────────
function renderAttendanceList(classStudents) {
  const container = document.getElementById('attendance-container');
  
  const attendanceKey = `${currentDate}_${currentClass}`;
  const todayAttendance = attendance[attendanceKey] || {};
  
  container.innerHTML = `
    <div class="space-y-3">
      ${classStudents.map((student, index) => {
        const status = todayAttendance[student.studentId] || 'unmarked';
        
        return `
          <div class="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
                ${student.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">${student.fullName}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${student.studentId}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button onclick="markStatus('${student.studentId}', 'present')" 
                class="status-btn px-4 py-2 rounded-xl text-sm font-semibold transition-all ${status === 'present' ? 'bg-green-500 text-white active' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}">
                Present
              </button>
              <button onclick="markStatus('${student.studentId}', 'absent')" 
                class="status-btn px-4 py-2 rounded-xl text-sm font-semibold transition-all ${status === 'absent' ? 'bg-red-500 text-white active' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}">
                Absent
              </button>
              <button onclick="markStatus('${student.studentId}', 'late')" 
                class="status-btn px-4 py-2 rounded-xl text-sm font-semibold transition-all ${status === 'late' ? 'bg-yellow-500 text-white active' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'}">
                Late
              </button>
              <button onclick="markStatus('${student.studentId}', 'excused')" 
                class="status-btn px-4 py-2 rounded-xl text-sm font-semibold transition-all ${status === 'excused' ? 'bg-blue-500 text-white active' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}">
                Excused
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ── Mark Status ────────────────────────────────────
function markStatus(studentId, status) {
  if (!currentClass || !currentDate) return;
  
  const attendanceKey = `${currentDate}_${currentClass}`;
  
  if (!attendance[attendanceKey]) {
    attendance[attendanceKey] = {};
  }
  
  attendance[attendanceKey][studentId] = status;
  
  // Re-render to update UI
  loadAttendance();
}

// ── Mark All Present ───────────────────────────────
function markAllPresent() {
  if (!currentClass || !currentDate) {
    showToast('Please select a class and date first', 'error');
    return;
  }
  
  const classStudents = students.filter(s => s.classLevel === currentClass);
  
  if (classStudents.length === 0) {
    showToast('No students in this class', 'error');
    return;
  }
  
  const attendanceKey = `${currentDate}_${currentClass}`;
  
  if (!attendance[attendanceKey]) {
    attendance[attendanceKey] = {};
  }
  
  classStudents.forEach(student => {
    attendance[attendanceKey][student.studentId] = 'present';
  });
  
  loadAttendance();
  showToast('All students marked present', 'success');
}

// ── Save Attendance ────────────────────────────────
function saveAttendance() {
  if (!currentClass || !currentDate) {
    showToast('Please select a class and date first', 'error');
    return;
  }
  
  saveAttendanceData();
  showToast('Attendance saved successfully', 'success');
}

// ── Update Stats ───────────────────────────────────
function updateStats() {
  if (!currentClass || !currentDate) return;
  
  const classStudents = students.filter(s => s.classLevel === currentClass);
  const total = classStudents.length;
  
  if (total === 0) {
    document.getElementById('stat-present').textContent = '0%';
    document.getElementById('stat-absent').textContent = '0';
    document.getElementById('stat-late').textContent = '0';
    document.getElementById('stat-unmarked').textContent = '0';
    return;
  }
  
  const attendanceKey = `${currentDate}_${currentClass}`;
  const todayAttendance = attendance[attendanceKey] || {};
  
  let present = 0, absent = 0, late = 0, excused = 0, unmarked = 0;
  
  classStudents.forEach(student => {
    const status = todayAttendance[student.studentId];
    if (status === 'present') present++;
    else if (status === 'absent') absent++;
    else if (status === 'late') late++;
    else if (status === 'excused') excused++;
    else unmarked++;
  });
  
  const presentPercent = Math.round((present / total) * 100);
  
  document.getElementById('stat-present').textContent = presentPercent + '%';
  document.getElementById('stat-absent').textContent = absent;
  document.getElementById('stat-late').textContent = late;
  document.getElementById('stat-unmarked').textContent = unmarked;
}

// ── Export Attendance ──────────────────────────────
function exportAttendance() {
  if (!currentClass || !currentDate) {
    showToast('Please select a class and date first', 'error');
    return;
  }
  
  const classStudents = students.filter(s => s.classLevel === currentClass);
  
  if (classStudents.length === 0) {
    showToast('No students to export', 'error');
    return;
  }
  
  const attendanceKey = `${currentDate}_${currentClass}`;
  const todayAttendance = attendance[attendanceKey] || {};
  
  // Create CSV
  const csv = [
    ['Student ID', 'Full Name', 'Class', 'Status', 'Date'],
    ...classStudents.map(s => [
      s.studentId,
      s.fullName,
      s.classLevel,
      todayAttendance[s.studentId] || 'Unmarked',
      currentDate
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_${currentClass.replace(' ', '_')}_${currentDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('Attendance exported', 'success');
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

// ── Toast Notifications ────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${bgColor}`;
  toast.style.animation = 'slideInRight 0.3s ease';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
