/* Take Exam Interface */
'use strict';

const EXAMS_KEY = 'srs_exams';
const SUBMISSIONS_KEY = 'srs_submissions';
const SESSION_KEY = 'srs_session';

let currentUser = null;
let exam = null;
let answers = {};
let currentQuestionIndex = 0;
let timeRemaining = 0;
let timerInterval = null;
let startTime = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadExam();
  startTimer();
  renderQuestion();
  renderQuestionNav();
  updateNavigationButtons();
});

// Prevent accidental page close
window.addEventListener('beforeunload', (e) => {
  if (exam && !isSubmitted()) {
    e.preventDefault();
    e.returnValue = '';
  }
});

function checkAuth() {
  try {
    currentUser = JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    currentUser = null;
  }
  
  if (!currentUser) {
    alert('Please login to take the exam.');
    window.location.href = 'login.html';
    return;
  }
  
  if (currentUser.role !== 'student') {
    alert('Only students can take exams.');
    window.location.href = 'dashboard.html';
    return;
  }
}

function loadExam() {
  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get('id');
  
  if (!examId) {
    alert('No exam specified.');
    window.location.href = 'student-exams.html';
    return;
  }
  
  const exams = JSON.parse(localStorage.getItem(EXAMS_KEY)) || [];
  exam = exams.find(e => e.id === examId);
  
  if (!exam) {
    alert('Exam not found.');
    window.location.href = 'student-exams.html';
    return;
  }
  
  // Check if already submitted
  const submissions = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) || [];
  const existing = submissions.find(s => s.examId === examId && s.studentId === currentUser.userId);
  
  if (existing) {
    alert('You have already submitted this exam.');
    window.location.href = 'student-exams.html?tab=results';
    return;
  }
  
  // Check if exam is past grace period (5 minutes after due time)
  const dueDate = new Date(exam.dueDate);
  const now = new Date();
  const gracePeriodMs = 5 * 60 * 1000; // 5 minutes
  const graceDeadline = new Date(dueDate.getTime() + gracePeriodMs);
  
  if (now > graceDeadline) {
    alert('This exam is closed. The grace period (5 minutes after due time) has expired.');
    window.location.href = 'student-exams.html';
    return;
  }
  
  // Check if student is late (within grace period)
  const isLate = now > dueDate && now <= graceDeadline;
  if (isLate) {
    const minutesLate = Math.floor((now - dueDate) / 60000);
    alert(`You are ${minutesLate} minute(s) late. You can still take the exam, but please start immediately.`);
  }
  
  // Initialize
  document.getElementById('exam-title').textContent = exam.title;
  document.getElementById('exam-info').textContent = `${exam.subject} • ${exam.duration} minutes • ${exam.totalMarks} marks`;
  document.getElementById('total-q-num').textContent = exam.questions.length;
  document.getElementById('total-count').textContent = exam.questions.length;
  
  timeRemaining = exam.duration * 60; // Convert to seconds
  startTime = Date.now();
  
  // Initialize answers object
  exam.questions.forEach((q, i) => {
    answers[i] = null;
  });
}

function startTimer() {
  updateTimerDisplay();
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert('Time is up! Your exam will be submitted automatically.');
      submitExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const timerEl = document.getElementById('timer');
  timerEl.textContent = display;
  
  // Warning color when less than 5 minutes
  if (timeRemaining <= 300) {
    timerEl.classList.add('text-red-600', 'dark:text-red-400', 'timer-warning');
  }
  
  // Update progress bar
  const totalTime = exam.duration * 60;
  const percentage = (timeRemaining / totalTime) * 100;
  document.getElementById('timer-bar').style.width = percentage + '%';
}

function renderQuestion() {
  const question = exam.questions[currentQuestionIndex];
  const container = document.getElementById('question-container');
  
  document.getElementById('current-q-num').textContent = currentQuestionIndex + 1;
  document.getElementById('current-q-marks').textContent = question.marks;
  
  let html = `
    <div class="mb-6">
      <p class="text-lg text-gray-900 dark:text-white mb-4">${question.text}</p>
    </div>
  `;
  
  if (question.type === 'mcq') {
    html += '<div class="space-y-3">';
    question.options.forEach((option, i) => {
      const letter = String.fromCharCode(65 + i); // A, B, C, D
      const isChecked = answers[currentQuestionIndex] === letter;
      html += `
        <div>
          <input type="radio" id="option-${i}" name="answer" value="${letter}" 
            class="option-radio hidden" ${isChecked ? 'checked' : ''} 
            onchange="saveAnswer('${letter}')">
          <label for="option-${i}" class="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-brand-400 transition-colors">
            <div class="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-semibold text-sm">
              ${letter}
            </div>
            <span class="flex-1 text-gray-700 dark:text-gray-300">${option}</span>
          </label>
        </div>
      `;
    });
    html += '</div>';
  } else if (question.type === 'truefalse') {
    html += '<div class="space-y-3">';
    ['True', 'False'].forEach((option) => {
      const isChecked = answers[currentQuestionIndex] === option;
      html += `
        <div>
          <input type="radio" id="option-${option}" name="answer" value="${option}" 
            class="option-radio hidden" ${isChecked ? 'checked' : ''} 
            onchange="saveAnswer('${option}')">
          <label for="option-${option}" class="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-brand-400 transition-colors">
            <div class="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                ${option === 'True' ? 
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>' :
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'
                }
              </svg>
            </div>
            <span class="flex-1 text-gray-700 dark:text-gray-300">${option}</span>
          </label>
        </div>
      `;
    });
    html += '</div>';
  } else if (question.type === 'short') {
    const savedAnswer = answers[currentQuestionIndex] || '';
    html += `
      <textarea id="short-answer" rows="6" 
        class="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        placeholder="Type your answer here..."
        onchange="saveAnswer(this.value)">${savedAnswer}</textarea>
    `;
  }
  
  container.innerHTML = html;
}

function saveAnswer(value) {
  answers[currentQuestionIndex] = value;
  renderQuestionNav();
}

function renderQuestionNav() {
  const container = document.getElementById('question-nav');
  container.innerHTML = exam.questions.map((q, i) => {
    const isAnswered = answers[i] !== null && answers[i] !== '';
    const isCurrent = i === currentQuestionIndex;
    const classes = `question-nav-btn w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-semibold cursor-pointer transition-all
      ${isCurrent ? 'current' : isAnswered ? 'answered' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-400'}`;
    
    return `<button onclick="goToQuestion(${i})" class="${classes}">${i + 1}</button>`;
  }).join('');
  
  // Update answered count
  const answeredCount = Object.values(answers).filter(a => a !== null && a !== '').length;
  document.getElementById('answered-count').textContent = answeredCount;
}

function goToQuestion(index) {
  currentQuestionIndex = index;
  renderQuestion();
  renderQuestionNav();
  updateNavigationButtons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
    renderQuestionNav();
    updateNavigationButtons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function nextQuestion() {
  if (currentQuestionIndex < exam.questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
    renderQuestionNav();
    updateNavigationButtons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  prevBtn.disabled = currentQuestionIndex === 0;
  prevBtn.style.opacity = currentQuestionIndex === 0 ? '0.5' : '1';
  prevBtn.style.cursor = currentQuestionIndex === 0 ? 'not-allowed' : 'pointer';
  
  if (currentQuestionIndex === exam.questions.length - 1) {
    nextBtn.textContent = 'Review Answers';
    nextBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    nextBtn.textContent = 'Next →';
    nextBtn.onclick = nextQuestion;
  }
}

function confirmSubmit() {
  document.getElementById('submit-modal').classList.remove('hidden');
  document.getElementById('submit-modal').classList.add('flex');
}

function closeSubmitModal() {
  document.getElementById('submit-modal').classList.add('hidden');
  document.getElementById('submit-modal').classList.remove('flex');
}

function submitExam() {
  clearInterval(timerInterval);
  
  // Calculate score for auto-gradable questions
  let score = 0;
  const responses = [];
  
  exam.questions.forEach((question, i) => {
    const studentAnswer = answers[i];
    let isCorrect = false;
    let earnedMarks = 0;
    
    if (question.type === 'mcq' || question.type === 'truefalse') {
      isCorrect = studentAnswer === question.correctAnswer;
      earnedMarks = isCorrect ? question.marks : 0;
      score += earnedMarks;
    }
    
    responses.push({
      questionIndex: i,
      questionText: question.text,
      questionType: question.type,
      studentAnswer: studentAnswer,
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      earnedMarks: earnedMarks,
      isCorrect: isCorrect
    });
  });
  
  // Create submission
  const submission = {
    id: Date.now().toString(),
    examId: exam.id,
    studentId: currentUser.userId,
    studentName: currentUser.fullName,
    answers: answers,
    responses: responses,
    score: score,
    submittedAt: new Date().toISOString(),
    timeTaken: Math.floor((Date.now() - startTime) / 1000), // in seconds
    graded: true // Auto-graded for MCQ and True/False
  };
  
  // Check if there are short answer questions
  const hasShortAnswer = exam.questions.some(q => q.type === 'short');
  if (hasShortAnswer) {
    submission.graded = false; // Needs manual grading
  }
  
  // Save submission
  const submissions = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) || [];
  submissions.push(submission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  
  // Show success message
  alert(`Exam submitted successfully!\n\n${hasShortAnswer ? 'Your exam will be graded by your teacher.' : `Your score: ${score}/${exam.totalMarks}`}`);
  
  // Redirect to results
  window.location.href = 'student-exams.html?tab=results';
}

function isSubmitted() {
  const submissions = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) || [];
  return submissions.some(s => s.examId === exam.id && s.studentId === currentUser.userId);
}
