/* ===================================================
   Fees Management — fees.js
   =================================================== */

'use strict';

const FEES_KEY = 'srs_fees';
const STUDENTS_KEY = 'srs_students';
const FEE_STRUCTURE = {
  'Senior 1': 500000,
  'Senior 2': 500000,
  'Senior 3': 550000,
  'Senior 4': 550000,
  'Senior 5': 600000,
  'Senior 6': 600000
};

let currentUser = null;
let students = [];
let fees = {};
let filteredStudents = [];
let darkMode = false;

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadData();
  initDarkMode();
  updateUserInfo();
  loadFees();
  
  // Bind form
  document.getElementById('payment-form').addEventListener('submit', handlePayment);
  
  // Make functions globally accessible
  window.recordPayment = recordPayment;
  window.closePaymentModal = closePaymentModal;
  window.viewHistory = viewHistory;
  window.searchStudents = searchStudents;
  window.filterByStatus = filterByStatus;
  window.filterByPaymentMethod = filterByPaymentMethod;
  window.exportFees = exportFees;
  window.exportStudentPaymentHistory = exportStudentPaymentHistory;
  window.exportByPaymentMethod = exportByPaymentMethod;
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
  
  // Only administrators, bursars, and secretaries can access fees
  if (!['administrator', 'bursar', 'secretary'].includes(currentUser.role)) {
    alert('Access denied. Only administrators, bursars, and secretaries can manage fees.');
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
    bursar: 'Bursar',
    secretary: 'Secretary'
  };
  return labels[role] || role;
}

// ── Load Data ──────────────────────────────────────
function loadData() {
  try {
    students = JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
    fees = JSON.parse(localStorage.getItem(FEES_KEY)) || {};
  } catch {
    students = [];
    fees = {};
  }
  
  // Initialize fees for students who don't have records
  students.forEach(student => {
    if (!fees[student.studentId]) {
      fees[student.studentId] = {
        studentId: student.studentId,
        totalDue: FEE_STRUCTURE[student.classLevel] || 500000,
        totalPaid: 0,
        balance: FEE_STRUCTURE[student.classLevel] || 500000,
        payments: []
      };
    }
  });
  
  saveFeesData();
  filteredStudents = [...students];
}

function saveFeesData() {
  localStorage.setItem(FEES_KEY, JSON.stringify(fees));
}

// ── Load Fees ──────────────────────────────────────
function loadFees() {
  if (students.length === 0) {
    document.getElementById('fees-container').innerHTML = `
      <div class="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <p class="text-lg font-medium">No students found</p>
        <p class="text-sm mt-2">Add students first to manage their fees</p>
      </div>
    `;
    return;
  }
  
  renderFeesList();
  updateStats();
}

// ── Render Fees List ───────────────────────────────
function renderFeesList() {
  const container = document.getElementById('fees-container');
  
  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Student</th>
            <th class="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Class</th>
            <th class="text-right p-4 font-semibold text-gray-700 dark:text-gray-300">Total Due</th>
            <th class="text-right p-4 font-semibold text-gray-700 dark:text-gray-300">Paid</th>
            <th class="text-right p-4 font-semibold text-gray-700 dark:text-gray-300">Balance</th>
            <th class="text-center p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
            <th class="text-right p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredStudents.map((student, i) => {
            const feeRecord = fees[student.studentId] || { totalDue: 0, totalPaid: 0, balance: 0 };
            const percentPaid = feeRecord.totalDue > 0 ? Math.round((feeRecord.totalPaid / feeRecord.totalDue) * 100) : 0;
            
            let statusBadge = '';
            if (percentPaid === 100) {
              statusBadge = '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">Paid</span>';
            } else if (percentPaid > 0) {
              statusBadge = '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">Partial</span>';
            } else {
              statusBadge = '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">Unpaid</span>';
            }
            
            return `
              <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
                      ${student.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">${student.fullName}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">${student.studentId}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4 text-gray-700 dark:text-gray-300">${student.classLevel}</td>
                <td class="p-4 text-right font-semibold text-gray-900 dark:text-white">UGX ${formatNumber(feeRecord.totalDue)}</td>
                <td class="p-4 text-right font-semibold text-green-600 dark:text-green-400">UGX ${formatNumber(feeRecord.totalPaid)}</td>
                <td class="p-4 text-right font-semibold ${feeRecord.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}">UGX ${formatNumber(feeRecord.balance)}</td>
                <td class="p-4 text-center">${statusBadge}</td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button onclick="recordPayment('${student.studentId}')" class="px-3 py-1.5 rounded-xl text-xs font-semibold btn-brand">
                      Record Payment
                    </button>
                    <button onclick="viewHistory('${student.studentId}')" class="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700">
                      History
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Record Payment ─────────────────────────────────
function recordPayment(studentId) {
  const student = students.find(s => s.studentId === studentId);
  if (!student) return;
  
  document.getElementById('payment-student-id').value = studentId;
  document.getElementById('payment-student-name').textContent = student.fullName;
  document.getElementById('payment-form').reset();
  document.getElementById('payment-modal').classList.remove('hidden');
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.add('hidden');
}

function handlePayment(e) {
  e.preventDefault();
  
  const studentId = document.getElementById('payment-student-id').value;
  const amount = parseFloat(document.getElementById('payment-amount').value);
  const method = document.getElementById('payment-method').value;
  const receipt = document.getElementById('payment-receipt').value;
  const notes = document.getElementById('payment-notes').value;
  
  if (!fees[studentId]) {
    showToast('Student fee record not found', 'error');
    return;
  }
  
  const payment = {
    id: Date.now().toString(),
    amount: amount,
    method: method,
    receipt: receipt,
    notes: notes,
    date: new Date().toISOString(),
    recordedBy: currentUser.fullName
  };
  
  fees[studentId].payments.push(payment);
  fees[studentId].totalPaid += amount;
  fees[studentId].balance = fees[studentId].totalDue - fees[studentId].totalPaid;
  
  saveFeesData();
  closePaymentModal();
  loadFees();
  
  showToast('Payment recorded successfully', 'success');
}

// ── View Payment History ───────────────────────────
function viewHistory(studentId) {
  const student = students.find(s => s.studentId === studentId);
  const feeRecord = fees[studentId];
  
  if (!student || !feeRecord) return;
  
  const payments = feeRecord.payments || [];
  
  if (payments.length === 0) {
    showToast(`No payment history for ${student.fullName}`, 'info');
    return;
  }
  
  // Create modal for payment history
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="glass-card rounded-3xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-display text-2xl text-gray-900 dark:text-white">Payment History</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div class="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <p class="font-semibold text-gray-900 dark:text-white">${student.fullName}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">${student.studentId} • ${student.classLevel}</p>
        <div class="mt-2 grid grid-cols-3 gap-4">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Total Due</p>
            <p class="font-semibold text-gray-900 dark:text-white">UGX ${formatNumber(feeRecord.totalDue)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
            <p class="font-semibold text-green-600 dark:text-green-400">UGX ${formatNumber(feeRecord.totalPaid)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Balance</p>
            <p class="font-semibold text-red-600 dark:text-red-400">UGX ${formatNumber(feeRecord.balance)}</p>
          </div>
        </div>
      </div>
      
      <div class="space-y-3">
        ${payments.sort((a, b) => new Date(b.date) - new Date(a.date)).map((p, i) => {
          const date = new Date(p.date);
          // Color code by payment method
          let methodColor = 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'; // Default
          
          if (p.method.includes('MTN')) {
            methodColor = 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
          } else if (p.method.includes('Airtel')) {
            methodColor = 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
          } else if (p.method.includes('Bank') || p.method.includes('Wire')) {
            methodColor = 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
          } else if (p.method.includes('Card') || p.method.includes('PayPal')) {
            methodColor = 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
          } else if (p.method === 'Cash') {
            methodColor = 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
          } else if (p.method === 'Cheque') {
            methodColor = 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400';
          }
          
          return `
            <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${methodColor}">
                      ${p.method}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Receipt: ${p.receipt}</p>
                  ${p.notes ? `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${p.notes}</p>` : ''}
                  <p class="text-xs text-gray-400 mt-1">Recorded by: ${p.recordedBy}</p>
                </div>
                <div class="text-right">
                  <p class="text-xl font-bold text-green-600 dark:text-green-400">UGX ${formatNumber(p.amount)}</p>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onclick="exportStudentPaymentHistory('${studentId}')" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Export Payment History
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// ── Search & Filter ────────────────────────────────
function searchStudents() {
  const query = document.getElementById('search-student').value.toLowerCase();
  
  if (!query) {
    filteredStudents = [...students];
  } else {
    filteredStudents = students.filter(s =>
      s.fullName.toLowerCase().includes(query) ||
      s.studentId.toLowerCase().includes(query)
    );
  }
  
  renderFeesList();
}

function filterByStatus() {
  const status = document.getElementById('filter-status').value;
  
  if (status === 'all') {
    filteredStudents = [...students];
  } else {
    filteredStudents = students.filter(s => {
      const feeRecord = fees[s.studentId];
      if (!feeRecord) return false;
      
      const percentPaid = feeRecord.totalDue > 0 ? (feeRecord.totalPaid / feeRecord.totalDue) * 100 : 0;
      
      if (status === 'paid') return percentPaid === 100;
      if (status === 'partial') return percentPaid > 0 && percentPaid < 100;
      if (status === 'unpaid') return percentPaid === 0;
      
      return true;
    });
  }
  
  renderFeesList();
}

function filterByPaymentMethod() {
  const method = document.getElementById('filter-payment-method').value;
  
  if (method === 'all') {
    filteredStudents = [...students];
  } else {
    // Filter students who have made payments using the selected method
    filteredStudents = students.filter(s => {
      const feeRecord = fees[s.studentId];
      if (!feeRecord || !feeRecord.payments) return false;
      
      // Check if student has any payment with this method
      return feeRecord.payments.some(p => p.method === method);
    });
  }
  
  renderFeesList();
  
  // Show info message
  if (method !== 'all') {
    showToast(`Showing students who paid via ${method}`, 'info');
  }
}

// ── Update Stats ───────────────────────────────────
function updateStats() {
  let totalCollected = 0;
  let totalOutstanding = 0;
  let fullyPaid = 0;
  let defaulters = 0;
  
  students.forEach(student => {
    const feeRecord = fees[student.studentId];
    if (feeRecord) {
      totalCollected += feeRecord.totalPaid;
      totalOutstanding += feeRecord.balance;
      
      if (feeRecord.balance === 0) fullyPaid++;
      if (feeRecord.balance > 0 && feeRecord.totalPaid === 0) defaulters++;
    }
  });
  
  document.getElementById('stat-collected').textContent = 'UGX ' + formatNumber(totalCollected);
  document.getElementById('stat-outstanding').textContent = 'UGX ' + formatNumber(totalOutstanding);
  document.getElementById('stat-fullypaid').textContent = fullyPaid;
  document.getElementById('stat-defaulters').textContent = defaulters;
}

// ── Export Fees ────────────────────────────────────
function exportFees() {
  if (students.length === 0) {
    showToast('No data to export', 'error');
    return;
  }
  
  // Create CSV
  const csv = [
    ['Student ID', 'Full Name', 'Class', 'Total Due', 'Total Paid', 'Balance', 'Status'],
    ...students.map(s => {
      const feeRecord = fees[s.studentId] || { totalDue: 0, totalPaid: 0, balance: 0 };
      const percentPaid = feeRecord.totalDue > 0 ? (feeRecord.totalPaid / feeRecord.totalDue) * 100 : 0;
      let status = 'Unpaid';
      if (percentPaid === 100) status = 'Paid';
      else if (percentPaid > 0) status = 'Partial';
      
      return [
        s.studentId,
        s.fullName,
        s.classLevel,
        feeRecord.totalDue,
        feeRecord.totalPaid,
        feeRecord.balance,
        status
      ];
    })
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fees_report_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('Fees report exported', 'success');
}

// ── Export Student Payment History ────────────────
function exportStudentPaymentHistory(studentId) {
  const student = students.find(s => s.studentId === studentId);
  const feeRecord = fees[studentId];
  
  if (!student || !feeRecord || !feeRecord.payments || feeRecord.payments.length === 0) {
    showToast('No payment history to export', 'error');
    return;
  }
  
  const csv = [
    ['Date', 'Time', 'Amount', 'Payment Method', 'Receipt/Transaction', 'Notes', 'Recorded By'],
    ...feeRecord.payments.map(p => {
      const date = new Date(p.date);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        p.amount,
        p.method,
        p.receipt,
        p.notes || '',
        p.recordedBy
      ];
    })
  ].map(row => row.map(c => `"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payment_history_${student.studentId}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('Payment history exported', 'success');
}

// ── Export By Payment Method ──────────────────────
function exportByPaymentMethod() {
  // Collect all payments with student info
  const allPayments = [];
  
  students.forEach(student => {
    const feeRecord = fees[student.studentId];
    if (feeRecord && feeRecord.payments) {
      feeRecord.payments.forEach(payment => {
        allPayments.push({
          studentId: student.studentId,
          studentName: student.fullName,
          class: student.classLevel,
          ...payment
        });
      });
    }
  });
  
  if (allPayments.length === 0) {
    showToast('No payments to export', 'error');
    return;
  }
  
  // Group by payment method
  const byMethod = {};
  allPayments.forEach(p => {
    if (!byMethod[p.method]) {
      byMethod[p.method] = [];
    }
    byMethod[p.method].push(p);
  });
  
  // Create summary CSV
  const summaryRows = [
    ['Payment Method Summary Report'],
    ['Generated:', new Date().toLocaleString()],
    [''],
    ['Payment Method', 'Total Transactions', 'Total Amount (UGX)'],
  ];
  
  Object.entries(byMethod).forEach(([method, payments]) => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    summaryRows.push([method, payments.length, total]);
  });
  
  summaryRows.push(['']);
  summaryRows.push(['Detailed Transactions']);
  summaryRows.push(['Date', 'Time', 'Student ID', 'Student Name', 'Class', 'Amount', 'Payment Method', 'Receipt/Transaction', 'Recorded By']);
  
  allPayments.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(p => {
    const date = new Date(p.date);
    summaryRows.push([
      date.toLocaleDateString(),
      date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      p.studentId,
      p.studentName,
      p.class,
      p.amount,
      p.method,
      p.receipt,
      p.recordedBy
    ]);
  });
  
  const csv = summaryRows.map(row => row.map(c => `"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payment_methods_report_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('Payment methods report exported', 'success');
}

// ── Helpers ────────────────────────────────────────
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
