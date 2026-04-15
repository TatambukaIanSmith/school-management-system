/* Student Exams Interface */
'use strict';

const EXAMS_KEY = 'srs_exams';
const SUBMISSIONS_KEY = 'srs_submissions';
const SESSION_KEY = 'srs_session';

let currentUser = null;
let exams = [];
let submissions = [];
let darkMode = false;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadData();
  initDarkMode();
  
  // Check URL params for tab
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  showView(tab === 'results' ? 'results' : 'available');
  
  updateUserInfo();
});

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
  
  if (currentUser.role !== 'student') {
    alert('Access denied. This page is for students only.');
    window.location.href = 'dashboard.html';
    return;
  }
}

function loadData() {
  try {
    exams = JSON.parse(localStorage.getItem(EXAMS_KEY)) || [];
    submissions = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) || [];
  } catch {
    exams = [];
    submissions = [];
  }
}

function saveSubmissions() {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

function updateUserInfo() {
  const userInfo = document.getElementById('user-info');
  if (userInfo && currentUser) {
    userInfo.innerHTML = `
      <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
        ${currentUser.fullName.split(' ').length >= 2 ? currentUser.fullName.split(' ')[0].charAt(0).toUpperCase() + currentUser.fullName.split(' ')[1].charAt(0).toUpperCase() : currentUser.fullName.charAt(0).toUpperCase()}
      </div>
      <div class="hidden sm:block">
        <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">${currentUser.fullName}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Student</p>
      </div>
    `;
  }
}

function showView(view) {
  document.getElementById('view-available').classList.add('hidden');
  document.getElementById('view-results').classList.add('hidden');
  
  document.getElementById('btn-available').classList.remove('btn-brand');
  document.getElementById('btn-results').classList.remove('btn-brand');
  
  document.getElementById('btn-available').classList.add('border', 'border-gray-200', 'dark:border-gray-700', 'text-gray-700', 'dark:text-gray-300');
  document.getElementById('btn-results').classList.add('border', 'border-gray-200', 'dark:border-gray-700', 'text-gray-700', 'dark:text-gray-300');
  
  if (view === 'available') {
    document.getElementById('view-available').classList.remove('hidden');
    const btn = document.getElementById('btn-available');
    btn.classList.add('btn-brand');
    btn.classList.remove('border', 'border-gray-200', 'dark:border-gray-700', 'text-gray-700', 'dark:text-gray-300');
    renderAvailableExams();
  } else if (view === 'results') {
    document.getElementById('view-results').classList.remove('hidden');
    const btn = document.getElementById('btn-results');
    btn.classList.add('btn-brand');
    btn.classList.remove('border', 'border-gray-200', 'dark:border-gray-700', 'text-gray-700', 'dark:text-gray-300');
    renderResults();
  }
}

function renderAvailableExams() {
  const container = document.getElementById('available-exams-list');
  
  // Get student's class (default to Senior 1 if not set)
  const studentClass = currentUser.class || 'Senior 1';
  
  // Filter exams for student's class
  const availableExams = exams.filter(e => e.class === studentClass);
  
  if (availableExams.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background: rgba(240,73,35,0.08)">
          <svg class="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3 class="font-display text-xl text-gray-700 dark:text-gray-300 mb-1">No exams available</h3>
        <p class="text-gray-400 text-sm">No exams have been assigned to your class (${studentClass}) yet.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = availableExams.map(exam => {
    const submitted = submissions.find(s => s.examId === exam.id && s.studentId === currentUser.userId);
    const dueDate = new Date(exam.dueDate);
    const now = new Date();
    
    // Allow 5-minute grace period after due time
    const gracePeriodMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    const graceDeadline = new Date(dueDate.getTime() + gracePeriodMs);
    const isPast = now > graceDeadline;
    const isLate = now > dueDate && now <= graceDeadline;
    
    // Debug info
    console.log('Exam:', exam.title, 'Submitted:', !!submitted, 'Past grace period:', isPast, 'Late:', isLate);
    
    return `
      <div class="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="font-display text-xl text-gray-900 dark:text-white mb-1">${exam.title}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">${exam.subject} • ${exam.class}</p>
          </div>
          ${submitted ? 
            '<span class="px-3 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">✓ Submitted</span>' :
            isPast ?
            '<span class="px-3 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">⏰ Closed</span>' :
            isLate ?
            '<span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400">⚠️ Late Entry</span>' :
            '<span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">📝 Available</span>'
          }
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Duration</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">${exam.duration} mins</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Total Marks</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">${exam.totalMarks}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Questions</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">${exam.questions.length}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <p class="text-sm font-semibold ${submitted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}">
              ${submitted ? 'Done' : 'Pending'}
            </p>
          </div>
        </div>
        ${exam.instructions ? `
          <div class="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Instructions:</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">${exam.instructions}</p>
          </div>
        ` : ''}
        <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Due: ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
          <div>
            ${submitted ? 
              '<span class="text-sm text-gray-500 dark:text-gray-400 italic">Already submitted</span>' :
              isPast ?
              '<span class="text-sm text-red-500 dark:text-red-400 italic">Exam closed (grace period expired)</span>' :
              isLate ?
              `<div class="text-right">
                <button onclick="startExam('${exam.id}')" class="btn-brand px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-lg">
                  🚀 Start Exam
                </button>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 font-semibold">⚠️ Late entry - Grace period active</p>
              </div>` :
              `<button onclick="startExam('${exam.id}')" class="btn-brand px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-lg">
                🚀 Start Exam
              </button>`
            }
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderResults() {
  const container = document.getElementById('results-list');
  
  // Get student's submissions
  const mySubmissions = submissions.filter(s => s.studentId === currentUser.userId);
  
  if (mySubmissions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background: rgba(240,73,35,0.08)">
          <svg class="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <h3 class="font-display text-xl text-gray-700 dark:text-gray-300 mb-1">No submissions yet</h3>
        <p class="text-gray-400 text-sm">You haven't taken any exams yet.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = mySubmissions.map(sub => {
    const exam = exams.find(e => e.id === sub.examId);
    if (!exam) return '';
    
    const percent = sub.graded ? Math.round((sub.score / exam.totalMarks) * 100) : 0;
    const grade = percent >= 90 ? 'A' : percent >= 80 ? 'B' : percent >= 70 ? 'C' : percent >= 60 ? 'D' : 'F';
    const gradeColor = percent >= 70 ? 'text-green-600 dark:text-green-400' : percent >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
    
    return `
      <div class="glass-card rounded-2xl p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="font-display text-xl text-gray-900 dark:text-white mb-1">${exam.title}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">${exam.subject} • ${exam.class}</p>
            <p class="text-xs text-gray-400 mt-1">Submitted: ${new Date(sub.submittedAt).toLocaleString()}</p>
          </div>
          ${sub.graded ? `
            <div class="text-right">
              <p class="text-3xl font-bold ${gradeColor}">${sub.score}/${exam.totalMarks}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">${percent}% (Grade: ${grade})</p>
            </div>
          ` : `
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400">
              Pending Grading
            </span>
          `}
        </div>
        ${sub.graded ? `
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Total Questions</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">${exam.questions.length}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Duration</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">${exam.duration} mins</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Performance</p>
              <p class="text-sm font-semibold ${gradeColor}">
                ${percent >= 80 ? 'Excellent' : percent >= 70 ? 'Good' : percent >= 60 ? 'Fair' : 'Needs Improvement'}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Grade</p>
              <p class="text-sm font-semibold ${gradeColor}">${grade}</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function startExam(examId) {
  console.log('Starting exam with ID:', examId);
  if (!examId) {
    alert('Error: No exam ID provided');
    return;
  }
  window.location.href = `take-exam.html?id=${examId}`;
}

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

function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };
  t.className = `${colors[type] || colors.success} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

