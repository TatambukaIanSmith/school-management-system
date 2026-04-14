/* Exam Management System */
'use strict';

const EXAMS_KEY = 'srs_exams';
const SUBMISSIONS_KEY = 'srs_submissions';
const SESSION_KEY = 'srs_session';

let currentUser = null;
let exams = [];
let submissions = [];
let darkMode = false;
let questionCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadData();
  initDarkMode();
  showView('list');
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
  
  const allowedRoles = ['teacher', 'counselor', 'administrator'];
  if (!allowedRoles.includes(currentUser.role)) {
    alert('Access denied. Only teachers can manage exams.');
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

function saveExams() {
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
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
        <p class="text-xs text-gray-500 dark:text-gray-400">${currentUser.role}</p>
      </div>
    `;
  }
}

function showView(view) {
  ['view-list', 'view-create', 'view-submissions'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  
  ['btn-list', 'btn-create', 'btn-submissions'].forEach(id => {
    const btn = document.getElementById(id);
    btn.classList.remove('btn-brand');
    btn.classList.add('border', 'border-gray-200', 'dark:border-gray-700', 'text-gray-700', 'dark:text-gray-300');
  });
  
  if (view === 'list') {
    document.getElementById('view-list').classList.remove('hidden');
    const btn = document.getElementById('btn-list');
    btn.classList.add('btn-brand');
    btn.classList.remove('border', 'border-gray-200', 'dark:border-gray-700', 'text-gray-700', 'dark:text-gray-300');
    renderExamsList();
  } else if (view === 'create') {
    document.getElementById('view-create').classList.remove('hidden');
    const btn = document.getElementById('btn-create');
    btn.classList.add('btn-brand');
    btn.classList.remove('border', 'border-gray-200', 'dark:border-gray-700', 'text-gray-700', 'dark:text-gray-300');
    questionCount = 0;
    document.getElementById('questions-container').innerHTML = '';
  } else if (view === 'submissions') {
    document.getElementById('view-submissions').classList.remove('hidden');
    const btn = document.getElementById('btn-submissions');
    btn.classList.add('btn-brand');
    btn.classList.remove('border', 'border-gray-200', 'dark:border-gray-700', 'text-gray-700', 'dark:text-gray-300');
    renderSubmissions();
  }
}

function renderExamsList() {
  const container = document.getElementById('exams-list');
  const myExams = exams.filter(e => e.createdBy === currentUser.userId);
  
  if (myExams.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background: rgba(240,73,35,0.08)">
          <svg class="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3 class="font-display text-xl text-gray-700 dark:text-gray-300 mb-1">No exams yet</h3>
        <p class="text-gray-400 text-sm mb-4">Create your first exam to get started.</p>
        <button onclick="showView('create')" class="btn-brand px-6 py-2 rounded-xl font-semibold text-sm">
          Create Exam
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = myExams.map(exam => {
    const submissionCount = submissions.filter(s => s.examId === exam.id).length;
    const dueDate = new Date(exam.dueDate);
    const isPast = dueDate < new Date();
    
    return `
      <div class="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="font-display text-xl text-gray-900 dark:text-white mb-1">${exam.title}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">${exam.subject} • ${exam.class}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="duplicateExam('${exam.id}')" class="text-blue-500 hover:text-blue-600 transition-colors" title="Duplicate this exam">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
            <button onclick="deleteExam('${exam.id}')" class="text-red-500 hover:text-red-600 transition-colors" title="Delete this exam">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
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
            <p class="text-xs text-gray-500 dark:text-gray-400">Submissions</p>
            <p class="text-sm font-semibold text-brand-600 dark:text-brand-400">${submissionCount}</p>
          </div>
        </div>
        <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Due: ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            ${isPast ? '<span class="text-red-500 ml-2">(Past due)</span>' : ''}
          </p>
          <button onclick="duplicateExam('${exam.id}')" class="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Duplicate
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function addQuestion() {
  questionCount++;
  const container = document.getElementById('questions-container');
  const div = document.createElement('div');
  div.className = 'glass-card rounded-2xl p-5 space-y-4';
  div.innerHTML = `
    <div class="flex items-center justify-between">
      <h4 class="font-semibold text-gray-900 dark:text-white">Question ${questionCount}</h4>
      <button onclick="this.parentElement.parentElement.remove()" class="text-red-500 hover:text-red-600 text-sm font-medium">
        Remove
      </button>
    </div>
    <input type="text" placeholder="Question text" class="form-input question-text" />
    <div class="grid grid-cols-2 gap-4">
      <select class="form-input question-type" onchange="updateQuestionType(this)">
        <option value="mcq">Multiple Choice</option>
        <option value="truefalse">True/False</option>
        <option value="short">Short Answer</option>
      </select>
      <input type="number" placeholder="Marks" class="form-input question-marks" />
    </div>
    <div class="question-options space-y-2">
      <input type="text" placeholder="Option A" class="form-input" />
      <input type="text" placeholder="Option B" class="form-input" />
      <input type="text" placeholder="Option C" class="form-input" />
      <input type="text" placeholder="Option D" class="form-input" />
      <select class="form-input question-answer">
        <option value="">Correct Answer</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
    </div>
  `;
  container.appendChild(div);
}

function updateQuestionType(select) {
  const optionsDiv = select.parentElement.parentElement.querySelector('.question-options');
  const type = select.value;
  
  if (type === 'truefalse') {
    optionsDiv.innerHTML = `
      <select class="form-input question-answer">
        <option value="">Correct Answer</option>
        <option value="True">True</option>
        <option value="False">False</option>
      </select>
    `;
  } else if (type === 'short') {
    optionsDiv.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Students will type their answer (manual grading required)</p>';
  } else {
    optionsDiv.innerHTML = `
      <input type="text" placeholder="Option A" class="form-input" />
      <input type="text" placeholder="Option B" class="form-input" />
      <input type="text" placeholder="Option C" class="form-input" />
      <input type="text" placeholder="Option D" class="form-input" />
      <select class="form-input question-answer">
        <option value="">Correct Answer</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
    `;
  }
}

function saveExam() {
  const title = document.getElementById('exam-title').value.trim();
  const subject = document.getElementById('exam-subject').value.trim();
  const examClass = document.getElementById('exam-class').value;
  const duration = document.getElementById('exam-duration').value;
  const totalMarks = document.getElementById('exam-marks').value;
  const dueDate = document.getElementById('exam-due').value;
  const instructions = document.getElementById('exam-instructions').value.trim();
  
  if (!title || !subject || !examClass || !duration || !totalMarks || !dueDate) {
    toast('Please fill all required fields', 'error');
    return;
  }
  
  const questions = [];
  document.querySelectorAll('#questions-container > div').forEach((qDiv) => {
    const text = qDiv.querySelector('.question-text').value.trim();
    const type = qDiv.querySelector('.question-type').value;
    const marks = qDiv.querySelector('.question-marks').value;
    const optionsDiv = qDiv.querySelector('.question-options');
    
    if (!text || !marks) return;
    
    let options = [];
    let correctAnswer = '';
    
    if (type === 'mcq') {
      const inputs = optionsDiv.querySelectorAll('input');
      options = Array.from(inputs).map(inp => inp.value.trim()).filter(v => v);
      correctAnswer = optionsDiv.querySelector('.question-answer')?.value || '';
    } else if (type === 'truefalse') {
      options = ['True', 'False'];
      correctAnswer = optionsDiv.querySelector('.question-answer')?.value || '';
    }
    
    questions.push({ text, type, marks: parseInt(marks), options, correctAnswer });
  });
  
  if (questions.length === 0) {
    toast('Please add at least one question', 'error');
    return;
  }
  
  const exam = {
    id: Date.now().toString(),
    title, subject, class: examClass, duration: parseInt(duration),
    totalMarks: parseInt(totalMarks), dueDate, instructions, questions,
    createdBy: currentUser.userId, createdAt: new Date().toISOString()
  };
  
  exams.push(exam);
  saveExams();
  toast('Exam created successfully!', 'success');
  showView('list');
}

function deleteExam(id) {
  if (confirm('Delete this exam? This cannot be undone.')) {
    exams = exams.filter(e => e.id !== id);
    saveExams();
    renderExamsList();
    toast('Exam deleted', 'error');
  }
}

function duplicateExam(id) {
  const originalExam = exams.find(e => e.id === id);
  if (!originalExam) {
    toast('Exam not found', 'error');
    return;
  }
  
  // Create a copy with new ID and updated metadata
  const duplicatedExam = {
    ...originalExam,
    id: Date.now().toString(),
    title: originalExam.title + ' (Copy)',
    createdAt: new Date().toISOString(),
    createdBy: currentUser.userId,
    // Set due date to tomorrow at the same time
    dueDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  };
  
  // Deep copy questions array to avoid reference issues
  duplicatedExam.questions = JSON.parse(JSON.stringify(originalExam.questions));
  
  exams.push(duplicatedExam);
  saveExams();
  renderExamsList();
  toast('Exam duplicated successfully! You can edit the copy as needed.', 'success');
  
  // Scroll to top to see the new exam
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderSubmissions() {
  const container = document.getElementById('submissions-list');
  const mySubs = submissions.filter(s => {
    const exam = exams.find(e => e.id === s.examId);
    return exam && exam.createdBy === currentUser.userId;
  });
  
  if (mySubs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background: rgba(240,73,35,0.08)">
          <svg class="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <h3 class="font-display text-xl text-gray-700 dark:text-gray-300 mb-1">No submissions yet</h3>
        <p class="text-gray-400 text-sm">Student submissions will appear here.</p>
      </div>
    `;
    return;
  }
  
  // Group by exam
  const byExam = {};
  mySubs.forEach(sub => {
    if (!byExam[sub.examId]) byExam[sub.examId] = [];
    byExam[sub.examId].push(sub);
  });
  
  container.innerHTML = Object.entries(byExam).map(([examId, subs]) => {
    const exam = exams.find(e => e.id === examId);
    const gradedCount = subs.filter(s => s.graded).length;
    const pendingCount = subs.length - gradedCount;
    const avgScore = gradedCount > 0 ? Math.round(subs.filter(s => s.graded).reduce((sum, s) => sum + s.score, 0) / gradedCount) : 0;
    
    return `
      <div class="glass-card rounded-2xl p-6 mb-6">
        <div class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="font-display text-xl text-gray-900 dark:text-white mb-2">${exam.title}</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p class="text-lg font-bold text-blue-600 dark:text-blue-400">${subs.length}</p>
            </div>
            <div class="text-center p-2 rounded-xl bg-green-50 dark:bg-green-900/20">
              <p class="text-xs text-gray-500 dark:text-gray-400">Graded</p>
              <p class="text-lg font-bold text-green-600 dark:text-green-400">${gradedCount}</p>
            </div>
            <div class="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-900/20">
              <p class="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              <p class="text-lg font-bold text-gray-600 dark:text-gray-400">${pendingCount}</p>
            </div>
          </div>
          ${gradedCount > 0 ? `
            <div class="mt-3 text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400">Class Average</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">${avgScore}/${exam.totalMarks}</p>
            </div>
          ` : ''}
        </div>
        
        <div class="space-y-3">
          ${subs.map(sub => {
            const percent = sub.graded ? Math.round((sub.score / exam.totalMarks) * 100) : 0;
            const grade = percent >= 90 ? 'A' : percent >= 80 ? 'B' : percent >= 70 ? 'C' : percent >= 60 ? 'D' : 'F';
            
            return `
              <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-400 transition-colors">
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
                    ${sub.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900 dark:text-white">${sub.studentName}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Submitted: ${new Date(sub.submittedAt).toLocaleString()} • 
                      Time: ${Math.floor(sub.timeTaken / 60)}m ${sub.timeTaken % 60}s
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  ${sub.graded ? `
                    <div class="text-right">
                      <p class="text-2xl font-bold text-green-600 dark:text-green-400">${sub.score}/${exam.totalMarks}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">${percent}% (${grade})</p>
                    </div>
                    <button onclick="gradeSubmission('${sub.id}')" class="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      Review
                    </button>
                  ` : `
                    <div class="text-right">
                      <p class="text-lg font-bold text-gray-600 dark:text-gray-400">Pending</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Needs grading</p>
                    </div>
                    <button onclick="gradeSubmission('${sub.id}')" class="btn-brand px-4 py-2 rounded-xl text-sm font-semibold hover:scale-105 transition-transform">
                      Grade Now
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function gradeSubmission(subId) {
  const submission = submissions.find(s => s.id === subId);
  if (!submission) {
    toast('Submission not found', 'error');
    return;
  }
  
  const exam = exams.find(e => e.id === submission.examId);
  if (!exam) {
    toast('Exam not found', 'error');
    return;
  }
  
  // Show grading modal
  showGradingModal(submission, exam);
}

function showGradingModal(submission, exam) {
  const modal = document.createElement('div');
  modal.id = 'grading-modal';
  modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  
  const hasShortAnswer = exam.questions.some(q => q.type === 'short');
  const autoGradedScore = submission.responses.reduce((sum, r) => sum + (r.earnedMarks || 0), 0);
  
  modal.innerHTML = `
    <div class="glass-card rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="font-display text-2xl text-gray-900 dark:text-white mb-1">Grade Submission</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">${submission.studentName} • ${exam.title}</p>
          </div>
          <button onclick="closeGradingModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-4 mt-4">
          <div class="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <p class="text-xs text-gray-500 dark:text-gray-400">Total Questions</p>
            <p class="text-lg font-bold text-gray-900 dark:text-white">${exam.questions.length}</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
            <p class="text-xs text-gray-500 dark:text-gray-400">Auto-Graded Score</p>
            <p class="text-lg font-bold text-green-600 dark:text-green-400">${autoGradedScore}/${exam.totalMarks}</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20">
            <p class="text-xs text-gray-500 dark:text-gray-400">Time Taken</p>
            <p class="text-lg font-bold text-gray-900 dark:text-white">${Math.floor(submission.timeTaken / 60)} min</p>
          </div>
        </div>
      </div>
      
      <!-- Questions List -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        ${exam.questions.map((question, i) => {
          const response = submission.responses[i];
          const isCorrect = response.isCorrect;
          const isShort = question.type === 'short';
          
          return `
            <div class="glass-card rounded-2xl p-5 ${isShort ? 'border-2 border-gray-200 dark:border-gray-800' : ''}">
              <div class="flex items-start justify-between mb-3">
                <h4 class="font-semibold text-gray-900 dark:text-white">Question ${i + 1}</h4>
                <div class="flex items-center gap-2">
                  ${isShort ? 
                    '<span class="text-xs px-2 py-1 rounded-full bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400">Manual Grading</span>' :
                    isCorrect ?
                    '<span class="text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">✓ Correct</span>' :
                    '<span class="text-xs px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">✗ Incorrect</span>'
                  }
                  <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">${question.marks} marks</span>
                </div>
              </div>
              
              <p class="text-gray-700 dark:text-gray-300 mb-3">${question.text}</p>
              
              ${question.type === 'mcq' ? `
                <div class="space-y-2 mb-3">
                  ${question.options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isStudentAnswer = response.studentAnswer === letter;
                    const isCorrectAnswer = question.correctAnswer === letter;
                    return `
                      <div class="flex items-center gap-2 p-2 rounded-lg ${
                        isCorrectAnswer ? 'bg-green-50 dark:bg-green-900/20' : 
                        isStudentAnswer ? 'bg-red-50 dark:bg-red-900/20' : 
                        'bg-gray-50 dark:bg-gray-800/50'
                      }">
                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCorrectAnswer ? 'bg-green-500 text-white' :
                          isStudentAnswer ? 'bg-red-500 text-white' :
                          'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }">${letter}</span>
                        <span class="flex-1 text-sm ${
                          isCorrectAnswer || isStudentAnswer ? 'font-semibold' : ''
                        }">${opt}</span>
                        ${isCorrectAnswer ? '<span class="text-xs text-green-600 dark:text-green-400">✓ Correct</span>' : ''}
                        ${isStudentAnswer && !isCorrectAnswer ? '<span class="text-xs text-red-600 dark:text-red-400">Student\'s answer</span>' : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : question.type === 'truefalse' ? `
                <div class="space-y-2 mb-3">
                  ${['True', 'False'].map(opt => {
                    const isStudentAnswer = response.studentAnswer === opt;
                    const isCorrectAnswer = question.correctAnswer === opt;
                    return `
                      <div class="flex items-center gap-2 p-2 rounded-lg ${
                        isCorrectAnswer ? 'bg-green-50 dark:bg-green-900/20' : 
                        isStudentAnswer ? 'bg-red-50 dark:bg-red-900/20' : 
                        'bg-gray-50 dark:bg-gray-800/50'
                      }">
                        <span class="w-6 h-6 rounded-full flex items-center justify-center ${
                          isCorrectAnswer ? 'bg-green-500 text-white' :
                          isStudentAnswer ? 'bg-red-500 text-white' :
                          'bg-gray-300 dark:bg-gray-600'
                        }">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            ${opt === 'True' ? 
                              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>' :
                              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'
                            }
                          </svg>
                        </span>
                        <span class="flex-1 text-sm font-semibold">${opt}</span>
                        ${isCorrectAnswer ? '<span class="text-xs text-green-600 dark:text-green-400">✓ Correct</span>' : ''}
                        ${isStudentAnswer && !isCorrectAnswer ? '<span class="text-xs text-red-600 dark:text-red-400">Student\'s answer</span>' : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : `
                <div class="mb-3">
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Student's Answer:</p>
                  <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${response.studentAnswer || '(No answer provided)'}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Award Marks (0-${question.marks}):</label>
                  <input type="number" 
                    id="marks-q${i}" 
                    min="0" 
                    max="${question.marks}" 
                    value="${response.earnedMarks || 0}"
                    class="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              `}
              
              ${!isShort ? `
                <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p class="text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Score: </span>
                    <span class="font-bold ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                      ${response.earnedMarks}/${question.marks}
                    </span>
                  </p>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- Footer -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <button onclick="closeGradingModal()" class="px-6 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:border-gray-400 transition-colors">
            Cancel
          </button>
          <button onclick="saveGrades('${submission.id}', ${exam.questions.length})" class="btn-brand px-6 py-2 rounded-xl font-semibold">
            Save Grades
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function closeGradingModal() {
  const modal = document.getElementById('grading-modal');
  if (modal) modal.remove();
}

function saveGrades(submissionId, questionCount) {
  const submission = submissions.find(s => s.id === submissionId);
  if (!submission) {
    toast('Submission not found', 'error');
    return;
  }
  
  const exam = exams.find(e => e.id === submission.examId);
  if (!exam) {
    toast('Exam not found', 'error');
    return;
  }
  
  // Update marks for short answer questions
  let totalScore = 0;
  exam.questions.forEach((question, i) => {
    if (question.type === 'short') {
      const input = document.getElementById(`marks-q${i}`);
      if (input) {
        const marks = parseInt(input.value) || 0;
        submission.responses[i].earnedMarks = Math.min(marks, question.marks);
      }
    }
    totalScore += submission.responses[i].earnedMarks;
  });
  
  // Update submission
  submission.score = totalScore;
  submission.graded = true;
  submission.gradedAt = new Date().toISOString();
  submission.gradedBy = currentUser.userId;
  
  saveSubmissions();
  closeGradingModal();
  renderSubmissions();
  toast('Grades saved successfully!', 'success');
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
  t.className = `${colors[type] || colors.success} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

