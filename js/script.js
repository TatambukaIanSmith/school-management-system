/* ===================================================
   School Registration System — script.js
   =================================================== */

'use strict';

// ── State ──────────────────────────────────────────
const STORAGE_KEY  = 'srs_students';
const SESSION_KEY  = 'srs_session';
const PAGE_SIZE    = 8;

let students       = [];        // all records
let filtered       = [];        // after search/sort
let editingId      = null;      // uuid of record being edited
let currentPage    = 1;
let pendingDelete  = null;      // uuid pending confirmation
let darkMode       = false;
let currentUser    = null;      // logged in user
let permissions    = null;      // user permissions
let currentPhoto   = null;      // current photo being uploaded
let statusFilter   = '';        // status filter
let classFilter    = '';        // class filter

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
  loadFromStorage();
  initDarkMode();
  bindForm();
  bindSearch();
  renderAll();
  updateUIForRole();
  
  // Start onboarding tour for new users
  if (currentUser && permissions) {
    initOnboarding('students', currentUser.role);
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
}

// logout function is in auth.js - no need to duplicate it here

// ── Storage ────────────────────────────────────────
function loadFromStorage() {
  try {
    students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { students = []; }
  filtered = [...students];
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
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

// ── Form Binding ───────────────────────────────────
function bindForm() {
  const form = document.getElementById('student-form');
  form.addEventListener('submit', handleSubmit);

  // Live progress bar
  const fields = ['full-name', 'student-id', 'gender', 'dob', 'class-level', 'parent-name', 'contact'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateProgress);
    if (el) el.addEventListener('change', updateProgress);
  });
}

function bindSearch() {
  document.getElementById('search-input').addEventListener('input', handleSearch);
}

// ── Progress Bar ───────────────────────────────────
function updateProgress() {
  const fields = ['full-name', 'student-id', 'gender', 'dob', 'class-level', 'parent-name', 'contact'];
  const filled = fields.filter(id => {
    const el = document.getElementById(id);
    return el && el.value.trim() !== '';
  }).length;
  const pct = Math.round((filled / fields.length) * 100);
  document.getElementById('form-progress-bar').style.width = pct + '%';
}

// ── Form Submission ────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  
  // Check permissions
  if (editingId && !permissions.canEdit) {
    toast('You do not have permission to edit students', 'error');
    return;
  }
  
  if (!editingId && !permissions.canCreate) {
    toast('You do not have permission to add students', 'error');
    return;
  }
  
  if (!validateForm()) return;

  const data = collectForm();

  if (editingId) {
    const idx = students.findIndex(s => s.id === editingId);
    if (idx !== -1) {
      students[idx] = { 
        ...students[idx], 
        ...data, 
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.fullName
      };
    }
    editingId = null;
    setFormMode('add');
    toast('Student updated successfully 🎉', 'success');
  } else {
    const newStudent = {
      id: uuid(),
      ...data,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.fullName
    };
    students.unshift(newStudent);
    toast('Student registered successfully ✅', 'success');
  }

  saveToStorage();
  resetForm();
  applyFilters();
  renderAll();
  
  // Create notification
  if (editingId) {
    createNotification('student_updated', `${data.fullName} (${data.studentId}) was updated`);
  } else {
    createNotification('student_added', `${data.fullName} (${data.studentId}) was registered`);
  }
}

function collectForm() {
  return {
    studentId:  v('student-id'),
    fullName:   v('full-name'),
    gender:     v('gender'),
    dob:        v('dob'),
    classLevel: v('class-level'),
    parentName: v('parent-name'),
    contact:    v('contact'),
    status:     v('student-status') || 'Active',
    photo:      currentPhoto || null
  };
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ── Validation ─────────────────────────────────────
function validateForm() {
  const rules = [
    { id: 'full-name',    err: 'err-full-name',    msg: 'Full name is required' },
    { id: 'student-id',   err: 'err-student-id',   msg: 'Student ID is required' },
    { id: 'gender',       err: 'err-gender',        msg: 'Please select a gender' },
    { id: 'dob',          err: 'err-dob',           msg: 'Date of birth is required' },
    { id: 'class-level',  err: 'err-class-level',   msg: 'Please select a class' },
    { id: 'parent-name',  err: 'err-parent-name',   msg: 'Guardian name is required' },
    { id: 'contact',      err: 'err-contact',       msg: 'Contact is required' },
  ];

  let valid = true;

  rules.forEach(({ id, err }) => {
    const el  = document.getElementById(id);
    const errEl = document.getElementById(err);
    const empty = !el || el.value.trim() === '';
    errEl.classList.toggle('hidden', !empty);
    if (empty) {
      valid = false;
      el && el.classList.add('border-red-400');
    } else {
      el && el.classList.remove('border-red-400');
    }
  });

  // Check for duplicate ID when adding
  if (valid && !editingId) {
    const sid = v('student-id');
    const exists = students.some(s => s.studentId === sid);
    if (exists) {
      const errEl = document.getElementById('err-student-id');
      errEl.textContent = 'This Student ID already exists';
      errEl.classList.remove('hidden');
      document.getElementById('student-id').classList.add('border-red-400');
      valid = false;
    }
  }

  return valid;
}

function clearErrors() {
  ['err-full-name', 'err-student-id', 'err-gender', 'err-dob', 'err-class-level', 'err-parent-name', 'err-contact']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.add('hidden'); el.textContent = ''; }
    });
  ['full-name', 'student-id', 'gender', 'dob', 'class-level', 'parent-name', 'contact']
    .forEach(id => document.getElementById(id)?.classList.remove('border-red-400'));
}

// ── Reset Form ─────────────────────────────────────
function resetForm() {
  document.getElementById('student-form').reset();
  clearErrors();
  editingId = null;
  currentPhoto = null;
  setFormMode('add');
  document.getElementById('form-progress-bar').style.width = '0%';
  
  // Reset photo preview
  const preview = document.getElementById('photo-preview');
  preview.innerHTML = `<svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>`;
}

function setFormMode(mode) {
  const isEdit = mode === 'edit';
  document.getElementById('form-title').textContent    = isEdit ? 'Edit Student'    : 'New Student';
  document.getElementById('form-subtitle').textContent = isEdit ? 'Update the fields' : 'Fill in the details below';
  document.getElementById('submit-text').textContent   = isEdit ? 'Save Changes'    : 'Register Student';
  const submitIcon = document.getElementById('submit-icon');
  const formIcon   = document.getElementById('form-icon');
  if (isEdit) {
    submitIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>';
    formIcon.innerHTML   = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>';
  } else {
    submitIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>';
    formIcon.innerHTML   = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>';
  }
}

// ── Toggle Form Collapse ───────────────────────────
function toggleFormCollapse() {
  const form = document.getElementById('student-form');
  const progressBar = document.querySelector('.form-progress');
  const icon = document.getElementById('form-icon');
  
  if (!form || !icon) return;
  
  const isCollapsed = form.style.display === 'none';
  
  if (isCollapsed) {
    // Expand
    form.style.display = 'grid';
    if (progressBar) progressBar.style.display = 'block';
    icon.style.transform = 'rotate(0deg)';
    toast('Form expanded', 'info');
  } else {
    // Collapse
    form.style.display = 'none';
    if (progressBar) progressBar.style.display = 'none';
    icon.style.transform = 'rotate(45deg)';
    toast('Form collapsed - Click + to expand', 'info');
  }
}

// ── Edit ───────────────────────────────────────────
function editStudent(id) {
  if (!permissions.canEdit) {
    toast('You do not have permission to edit students', 'error');
    return;
  }
  
  const s = students.find(s => s.id === id);
  if (!s) return;

  editingId = id;
  setVal('full-name',    s.fullName);
  setVal('student-id',   s.studentId);
  setVal('gender',       s.gender);
  setVal('dob',          s.dob);
  setVal('class-level',  s.classLevel);
  setVal('parent-name',  s.parentName);
  setVal('contact',      s.contact);
  setVal('student-status', s.status || 'Active');
  
  // Set photo
  currentPhoto = s.photo || null;
  const preview = document.getElementById('photo-preview');
  if (s.photo) {
    preview.innerHTML = `<img src="${s.photo}" alt="Preview" class="w-full h-full object-cover" />`;
  } else {
    preview.innerHTML = `<svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>`;
  }
  
  setFormMode('edit');
  clearErrors();
  updateProgress();

  // Scroll to form
  document.getElementById('form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

// ── Delete ─────────────────────────────────────────
function confirmDelete(id) {
  if (!permissions.canDelete) {
    toast('You do not have permission to delete students', 'error');
    return;
  }
  
  const s = students.find(s => s.id === id);
  if (!s) return;
  pendingDelete = id;
  document.getElementById('modal-subtitle').textContent =
    `You are about to remove ${s.fullName} (${s.studentId}). This cannot be undone.`;
  document.getElementById('confirm-modal').classList.remove('hidden');
  document.getElementById('confirm-modal').classList.add('flex');
}

document.getElementById('modal-cancel').addEventListener('click', () => {
  pendingDelete = null;
  closeModal();
});

document.getElementById('modal-confirm').addEventListener('click', () => {
  if (pendingDelete) {
    const student = students.find(s => s.id === pendingDelete);
    const studentName = student ? `${student.fullName} (${student.studentId})` : 'Student';
    
    students = students.filter(s => s.id !== pendingDelete);
    saveToStorage();
    applyFilters();
    renderAll();
    toast('Student removed', 'error');
    
    // Create notification
    createNotification('student_deleted', `${studentName} was removed from the system`);
    
    pendingDelete = null;
  }
  closeModal();
});

document.getElementById('confirm-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('confirm-modal')) {
    pendingDelete = null;
    closeModal();
  }
});

function closeModal() {
  document.getElementById('confirm-modal').classList.add('hidden');
  document.getElementById('confirm-modal').classList.remove('flex');
}

// ── Search & Sort ──────────────────────────────────
function handleSearch() {
  currentPage = 1;
  applyFilters();
  renderTable();
}

function handleSort() {
  applyFilters();
  renderTable();
}

function applyFilters() {
  const q   = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const sort = document.getElementById('sort-select')?.value || '';

  filtered = students.filter(s => {
    // Text search
    const matchesSearch = !q || 
      s.fullName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.classLevel?.toLowerCase().includes(q) ||
      s.parentName?.toLowerCase().includes(q);
    
    // Status filter
    const matchesStatus = !statusFilter || (s.status || 'Active') === statusFilter;
    
    // Class filter
    const matchesClass = !classFilter || s.classLevel === classFilter;
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  if (sort === 'name')      filtered.sort((a,b) => a.fullName.localeCompare(b.fullName));
  else if (sort === 'name-desc') filtered.sort((a,b) => b.fullName.localeCompare(a.fullName));
  else if (sort === 'class')     filtered.sort((a,b) => a.classLevel.localeCompare(b.classLevel));
  else if (sort === 'id')        filtered.sort((a,b) => a.studentId.localeCompare(b.studentId));
  else if (sort === 'age')       filtered.sort((a,b) => (calculateAge(a.dob) || 0) - (calculateAge(b.dob) || 0));
}

// ── Render ─────────────────────────────────────────
function renderAll() {
  applyFilters();
  renderTable();
  updateStats();
}

function renderTable() {
  const tbody = document.getElementById('student-table-body');
  const empty = document.getElementById('empty-state');

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  const q = (document.getElementById('search-input')?.value || '').trim();

  tbody.innerHTML = '';

  if (total === 0) {
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    page.forEach((s, i) => {
      const tr = document.createElement('tr');
      tr.className = 'student-row border-b border-gray-50 dark:border-white/5 last:border-0';
      tr.style.animationDelay = (i * 40) + 'ms';
      if (s.id === editingId) tr.classList.add('editing-row');

      const dobFormatted = s.dob ? formatDate(s.dob) : '—';
      const age = calculateAge(s.dob);
      const status = s.status || 'Active';
      const statusColors = {
        'Active': 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        'Inactive': 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
        'Graduated': 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        'Transferred': 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
      };

      tr.innerHTML = `
        <td class="px-4 py-3">
          <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            ${s.photo ? 
              `<img src="${s.photo}" alt="${s.fullName}" class="w-full h-full object-cover" />` :
              `<svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>`
            }
          </div>
        </td>
        <td class="px-4 py-3 font-mono text-xs font-medium text-brand-600 dark:text-brand-400">${highlight(s.studentId, q)}</td>
        <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">${highlight(s.fullName, q)}</td>
        <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">${age ? age + ' yrs' : '—'}</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.gender === 'Male' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'}">
            ${s.gender === 'Male' ? '♂' : '♀'} ${s.gender}
          </span>
        </td>
        <td class="px-4 py-3">
          <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style="background:rgba(240,73,35,0.08);color:#000000">${highlight(s.classLevel, q)}</span>
        </td>
        <td class="px-4 py-3">
          <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.Active}">
            ${status}
          </span>
        </td>
        <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">${highlight(s.parentName, q)}</td>
        <td class="px-4 py-3 text-right">
          <div class="flex items-center justify-end gap-2">
            ${permissions.canEdit ? `
            <button onclick="editStudent('${s.id}')"
              class="btn-edit px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Edit
            </button>
            ` : ''}
            ${permissions.canDelete ? `
            <button onclick="confirmDelete('${s.id}')"
              class="btn-delete px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Del
            </button>
            ` : ''}
            ${!permissions.canEdit && !permissions.canDelete ? '<span class="text-xs text-gray-400">View Only</span>' : ''}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderPagination(totalPages, total, start, page.length);
  document.getElementById('table-subtitle').textContent =
    `${total} record${total !== 1 ? 's' : ''} found`;
}

// ── Pagination ─────────────────────────────────────
function renderPagination(totalPages, total, start, count) {
  const info = document.getElementById('pagination-info');
  const ctrl = document.getElementById('pagination-controls');

  const end = start + count;
  info.textContent = total === 0
    ? 'No students to show'
    : `Showing ${start + 1}–${end} of ${total} student${total !== 1 ? 's' : ''}`;

  ctrl.innerHTML = '';
  if (totalPages <= 1) return;

  const prev = pageBtn('‹', currentPage > 1, () => { currentPage--; renderTable(); });
  ctrl.appendChild(prev);

  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 7 && (p > 2 && p < totalPages - 1) && Math.abs(p - currentPage) > 1) {
      if (p === 3 || p === totalPages - 2) {
        const dot = document.createElement('span');
        dot.textContent = '…';
        dot.className = 'page-btn text-gray-400';
        ctrl.appendChild(dot);
      }
      continue;
    }
    const btn = pageBtn(p, true, () => { currentPage = p; renderTable(); });
    if (p === currentPage) btn.classList.add('active');
    ctrl.appendChild(btn);
  }

  const next = pageBtn('›', currentPage < totalPages, () => { currentPage++; renderTable(); });
  ctrl.appendChild(next);
}

function pageBtn(label, enabled, onClick) {
  const btn = document.createElement('button');
  btn.className = 'page-btn text-gray-500 dark:text-gray-400';
  btn.textContent = label;
  btn.disabled = !enabled;
  if (!enabled) btn.classList.add('opacity-30', 'cursor-not-allowed');
  else btn.addEventListener('click', onClick);
  return btn;
}

// ── Stats ──────────────────────────────────────────
function updateStats() {
  document.getElementById('nav-count').textContent = students.length;
}

// ── Export CSV ─────────────────────────────────────
function exportCSV() {
  if (!permissions.canExport) {
    toast('You do not have permission to export data', 'error');
    return;
  }
  
  if (students.length === 0) {
    toast('No students to export', 'info');
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
  toast(`Exported ${students.length} student records 📁`, 'success');
}

// ── Toast ──────────────────────────────────────────
function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');

  const icons = {
    success: `<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
    error:   `<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    info:    `<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  };

  t.className = `toast toast-${type}`;
  t.innerHTML = (icons[type] || '') + `<span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3100);
}

// ── Helpers ────────────────────────────────────────
function uuid() {
  return crypto.randomUUID?.() ||
    ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function highlight(text, query) {
  if (!query || !text) return text || '';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="search-hl">$1</mark>');
}

// ── UI Role Updates ────────────────────────────────
function updateUIForRole() {
  if (!permissions) return;
  
  // Hide form if user cannot create
  const formCard = document.getElementById('form-card');
  if (!permissions.canCreate && !editingId) {
    formCard.style.display = 'none';
  }
  
  // Hide export button if user cannot export
  const exportBtn = document.querySelector('[onclick="exportCSV()"]');
  if (exportBtn && !permissions.canExport) {
    exportBtn.style.display = 'none';
  }
  
  // Show exams link for teachers, counselors, and administrators
  if (['teacher', 'counselor', 'administrator'].includes(currentUser.role)) {
    const examsLink = document.getElementById('exams-link');
    if (examsLink) examsLink.style.display = 'block';
  }
  
  // Update navbar with user info
  updateNavbar();
}

function updateNavbar() {
  const navCount = document.getElementById('nav-count');
  if (navCount && navCount.parentElement) {
    // Add user info after student count
    const userInfo = document.createElement('div');
    userInfo.className = 'flex items-center gap-3 px-3 py-1.5 rounded-full glass-card text-sm';
    const names = currentUser.fullName.split(' ');
    userInfo.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style="background: linear-gradient(135deg, #1a1a1a, #de2d0c)">
          ${names.length >= 2 ? names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase() : currentUser.fullName.charAt(0).toUpperCase()}
        </div>
        <div class="hidden sm:block">
          <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">${currentUser.fullName}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">${permissions.label}</p>
        </div>
      </div>
      <button onclick="logout()" class="ml-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"/>
        </svg>
      </button>
    `;
    
    // Insert before dark mode toggle
    const darkToggleParent = document.getElementById('dark-toggle').parentElement;
    darkToggleParent.parentElement.insertBefore(userInfo, darkToggleParent);
  }
}

// ── CSV Import ─────────────────────────────────────
function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.name.endsWith('.csv')) {
    toast('Please upload a CSV file', 'error');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const csv = e.target.result;
      const lines = csv.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast('CSV file is empty or invalid', 'error');
        return;
      }
      
      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Expected headers
      const requiredHeaders = ['Student ID', 'Full Name', 'Gender', 'Date of Birth', 'Class', 'Guardian', 'Contact'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast(`Missing required columns: ${missingHeaders.join(', ')}`, 'error');
        return;
      }
      
      // Parse rows
      const newStudents = [];
      const errors = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }
        
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        // Validate required fields
        if (!row['Student ID'] || !row['Full Name'] || !row['Gender'] || !row['Date of Birth'] || !row['Class'] || !row['Guardian'] || !row['Contact']) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }
        
        // Check for duplicate student ID
        if (students.some(s => s.studentId === row['Student ID'])) {
          errors.push(`Row ${i + 1}: Student ID ${row['Student ID']} already exists`);
          continue;
        }
        
        // Create student object
        const student = {
          id: uuid(),
          studentId: row['Student ID'],
          fullName: row['Full Name'],
          gender: row['Gender'],
          dob: row['Date of Birth'],
          classLevel: row['Class'],
          parentName: row['Guardian'],
          contact: row['Contact'],
          createdAt: new Date().toISOString(),
          createdBy: currentUser.fullName
        };
        
        newStudents.push(student);
      }
      
      // Add students
      if (newStudents.length > 0) {
        students = [...newStudents, ...students];
        saveToStorage();
        applyFilters();
        renderAll();
        
        toast(`Successfully imported ${newStudents.length} student${newStudents.length !== 1 ? 's' : ''}`, 'success');
        createNotification('system', `Bulk import: ${newStudents.length} students added`);
      }
      
      // Show errors if any
      if (errors.length > 0) {
        console.error('Import errors:', errors);
        toast(`Imported with ${errors.length} error${errors.length !== 1 ? 's' : ''} (check console)`, 'error');
      }
      
    } catch (error) {
      console.error('CSV parsing error:', error);
      toast('Failed to parse CSV file', 'error');
    }
  };
  
  reader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values.map(v => v.replace(/^"|"$/g, ''));
}

// ── User Menu Functions ────────────────────────────
function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function restartTour() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.classList.add('hidden');
  
  if (typeof resetOnboarding === 'function') {
    resetOnboarding();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('user-menu');
  if (!menu) return;
  
  const userInfo = menu.closest('.relative');
  if (userInfo && !userInfo.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

// ── Photo Upload ───────────────────────────────────
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast('Please upload an image file', 'error');
    return;
  }
  
  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    toast('Image size must be less than 2MB', 'error');
    return;
  }
  
  // Read and preview image
  const reader = new FileReader();
  reader.onload = function(e) {
    currentPhoto = e.target.result;
    const preview = document.getElementById('photo-preview');
    preview.innerHTML = `<img src="${currentPhoto}" alt="Preview" class="w-full h-full object-cover" />`;
  };
  reader.readAsDataURL(file);
}

// ── Calculate Age ──────────────────────────────────
function calculateAge(dob) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// ── Status Filter ──────────────────────────────────
function handleStatusFilter() {
  statusFilter = document.getElementById('status-filter')?.value || '';
  currentPage = 1;
  applyFilters();
  renderTable();
}

function handleClassFilter() {
  classFilter = document.getElementById('class-filter')?.value || '';
  currentPage = 1;
  applyFilters();
  renderTable();
}

// ── Print Student List ─────────────────────────────
function printStudentList() {
  const printWindow = window.open('', '_blank');
  const students = filtered.length > 0 ? filtered : [];
  
  if (students.length === 0) {
    toast('No students to print', 'info');
    return;
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student List - ${new Date().toLocaleDateString()}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          text-align: center;
          color: #000000;
          margin-bottom: 10px;
        }
        .subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #000000;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .photo {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
        }
        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-active { background: #d4edda; color: #155724; }
        .status-inactive { background: #f8d7da; color: #721c24; }
        .status-graduated { background: #d1ecf1; color: #0c5460; }
        .status-transferred { background: #fff3cd; color: #856404; }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>School Registration System</h1>
      <p class="subtitle">Student List - ${new Date().toLocaleDateString()} | Total: ${students.length} students</p>
      
      <table>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Student ID</th>
            <th>Full Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Class</th>
            <th>Status</th>
            <th>Guardian</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => `
            <tr>
              <td>
                ${s.photo ? `<img src="${s.photo}" class="photo" alt="${s.fullName}" />` : '—'}
              </td>
              <td>${s.studentId}</td>
              <td>${s.fullName}</td>
              <td>${calculateAge(s.dob) || '—'}</td>
              <td>${s.gender}</td>
              <td>${s.classLevel}</td>
              <td><span class="status status-${(s.status || 'Active').toLowerCase()}">${s.status || 'Active'}</span></td>
              <td>${s.parentName}</td>
              <td>${s.contact}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Generated by School Registration System | ${currentUser?.fullName || 'System'}</p>
        <p>Printed on: ${new Date().toLocaleString()}</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
}

