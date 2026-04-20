/* ===================================================
   Timetable Management — timetable.js
   =================================================== */

'use strict';

const TIMETABLE_KEY = 'srs_timetables';
let currentUser = null;
let currentClass = '';
let timetables = {};
let darkMode = false;

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadTimetables();
  initDarkMode();
  updateUserInfo();
  
  // Bind form
  document.getElementById('period-form').addEventListener('submit', handleAddPeriod);
  
  // Make functions globally accessible
  window.loadTimetable = loadTimetable;
  window.addPeriod = addPeriod;
  window.closePeriodModal = closePeriodModal;
  window.editPeriod = editPeriod;
  window.exportTimetable = exportTimetable;
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
  
  // Only administrators, registrars, and teachers can access timetables
  if (!['administrator', 'registrar', 'teacher'].includes(currentUser.role)) {
    alert('Access denied. Only administrators, registrars, and teachers can manage timetables.');
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

// ── Load Timetables ────────────────────────────────
function loadTimetables() {
  try {
    timetables = JSON.parse(localStorage.getItem(TIMETABLE_KEY)) || {};
  } catch {
    timetables = {};
  }
}

function saveTimetables() {
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetables));
}

// ── Load Timetable for Selected Class ──────────────
function loadTimetable() {
  const classSelect = document.getElementById('class-select');
  currentClass = classSelect.value;
  
  console.log('Selected class:', currentClass); // Debug log
  
  if (!currentClass) {
    document.getElementById('timetable-container').innerHTML = `
      <div class="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p class="text-lg font-medium">Select a class to view or create timetable</p>
      </div>
    `;
    return;
  }
  
  const classTimetable = timetables[currentClass] || [];
  renderTimetable(classTimetable);
  
  // Show success message
  showToast(`Loaded timetable for ${currentClass}`, 'info');
}

// ── Render Timetable ───────────────────────────────
function renderTimetable(periods) {
  const container = document.getElementById('timetable-container');
  
  if (periods.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <p class="text-lg font-medium">No timetable created for ${currentClass}</p>
        <p class="text-sm mt-2">Click "Add Period" to start creating the timetable</p>
      </div>
    `;
    return;
  }
  
  // Group periods by day
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periodsByDay = {};
  
  days.forEach(day => {
    periodsByDay[day] = periods.filter(p => p.day === day).sort((a, b) => a.time.localeCompare(b.time));
  });
  
  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Time</th>
            ${days.map(day => `<th class="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${renderTimetableRows(periodsByDay, days)}
        </tbody>
      </table>
    </div>
  `;
}

function renderTimetableRows(periodsByDay, days) {
  // Get all unique time slots
  const allPeriods = Object.values(periodsByDay).flat();
  const timeSlots = [...new Set(allPeriods.map(p => p.time))].sort();
  
  if (timeSlots.length === 0) return '';
  
  return timeSlots.map(time => `
    <tr class="border-b border-gray-100 dark:border-gray-800">
      <td class="p-4 font-medium text-sm text-gray-600 dark:text-gray-400">${time}</td>
      ${days.map(day => {
        const period = periodsByDay[day].find(p => p.time === time);
        if (period) {
          return `
            <td class="p-2">
              <div class="subject-card glass-card rounded-xl p-3" onclick="editPeriod('${day}', '${time}')">
                <p class="font-semibold text-sm text-gray-900 dark:text-white">${period.subject}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${period.teacher}</p>
                ${period.room ? `<p class="text-xs text-gray-400 mt-0.5">${period.room}</p>` : ''}
              </div>
            </td>
          `;
        } else {
          return `<td class="p-2"><div class="time-slot rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"></div></td>`;
        }
      }).join('')}
    </tr>
  `).join('');
}

// ── Add Period ─────────────────────────────────────
function addPeriod() {
  console.log('Add Period clicked, currentClass:', currentClass); // Debug log
  
  if (!currentClass) {
    showToast('Please select a class first', 'error');
    // Highlight the class selector
    const classSelect = document.getElementById('class-select');
    classSelect.focus();
    classSelect.style.border = '2px solid #ef4444';
    classSelect.style.animation = 'shake 0.5s';
    setTimeout(() => {
      classSelect.style.border = '';
      classSelect.style.animation = '';
    }, 2000);
    return;
  }
  
  console.log('Opening modal for class:', currentClass); // Debug log
  document.getElementById('period-modal').classList.remove('hidden');
  document.getElementById('period-form').reset();
}

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);

function closePeriodModal() {
  document.getElementById('period-modal').classList.add('hidden');
}

function handleAddPeriod(e) {
  e.preventDefault();
  
  const period = {
    day: document.getElementById('period-day').value,
    time: document.getElementById('period-time').value,
    subject: document.getElementById('period-subject').value,
    teacher: document.getElementById('period-teacher').value,
    room: document.getElementById('period-room').value
  };
  
  if (!timetables[currentClass]) {
    timetables[currentClass] = [];
  }
  
  // Check for conflicts
  const existing = timetables[currentClass].find(p => p.day === period.day && p.time === period.time);
  if (existing) {
    if (!confirm(`A period already exists for ${period.day} at ${period.time}. Replace it?`)) {
      return;
    }
    // Remove existing
    timetables[currentClass] = timetables[currentClass].filter(p => !(p.day === period.day && p.time === period.time));
  }
  
  timetables[currentClass].push(period);
  saveTimetables();
  
  closePeriodModal();
  loadTimetable();
  
  showToast('Period added successfully', 'success');
}

// ── Edit Period ────────────────────────────────────
function editPeriod(day, time) {
  const period = timetables[currentClass].find(p => p.day === day && p.time === time);
  if (!period) return;
  
  if (confirm(`Edit or delete this period?\n\n${period.subject}\n${period.teacher}\n${period.room || ''}\n\nClick OK to delete, Cancel to edit`)) {
    // Delete
    timetables[currentClass] = timetables[currentClass].filter(p => !(p.day === day && p.time === time));
    saveTimetables();
    loadTimetable();
    showToast('Period deleted', 'success');
  } else {
    // Edit - populate form
    document.getElementById('period-day').value = period.day;
    document.getElementById('period-time').value = period.time;
    document.getElementById('period-subject').value = period.subject;
    document.getElementById('period-teacher').value = period.teacher;
    document.getElementById('period-room').value = period.room;
    
    // Remove old period
    timetables[currentClass] = timetables[currentClass].filter(p => !(p.day === day && p.time === time));
    
    document.getElementById('period-modal').classList.remove('hidden');
  }
}

// ── Export Timetable ───────────────────────────────
function exportTimetable() {
  if (!currentClass) {
    alert('Please select a class first');
    return;
  }
  
  const periods = timetables[currentClass] || [];
  if (periods.length === 0) {
    alert('No timetable to export');
    return;
  }
  
  // Create CSV
  const csv = [
    ['Day', 'Time', 'Subject', 'Teacher', 'Room'],
    ...periods.map(p => [p.day, p.time, p.subject, p.teacher, p.room || ''])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timetable_${currentClass.replace(' ', '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('Timetable exported', 'success');
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
