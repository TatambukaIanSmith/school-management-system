/* ===================================================
   Sidebar Component — sidebar.js
   =================================================== */

'use strict';

// Sidebar toggle for mobile
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (sidebar && overlay) {
    sidebar.classList.toggle('show');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
  }
}

// Update sidebar stats
function updateSidebarStats() {
  try {
    const students = JSON.parse(localStorage.getItem('srs_students')) || [];
    const exams = JSON.parse(localStorage.getItem('srs_exams')) || [];
    
    const studentsCount = document.getElementById('sidebar-students-count');
    const examsCount = document.getElementById('sidebar-exams-count');
    
    if (studentsCount) studentsCount.textContent = students.length;
    if (examsCount) examsCount.textContent = exams.length;
  } catch (error) {
    console.error('Error updating sidebar stats:', error);
  }
}

// Show/hide sidebar links based on role
function updateSidebarLinks() {
  try {
    const session = JSON.parse(localStorage.getItem('srs_session') || '{}');
    const role = session.role;
    
    const examsLink = document.getElementById('sidebar-exams-link');
    const studentExamsLink = document.getElementById('sidebar-student-exams-link');
    const usersLink = document.getElementById('sidebar-users-link');
    
    if (['teacher', 'counselor', 'administrator'].includes(role) && examsLink) {
      examsLink.style.display = 'flex';
    }
    
    if (role === 'student' && studentExamsLink) {
      studentExamsLink.style.display = 'flex';
    }
    
    if (role === 'administrator' && usersLink) {
      usersLink.style.display = 'flex';
    }
  } catch (error) {
    console.error('Error updating sidebar links:', error);
  }
}

// Highlight active page in sidebar
function highlightActivePage() {
  try {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.sidebar-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  } catch (error) {
    console.error('Error highlighting active page:', error);
  }
}

// Load sidebar HTML
async function loadSidebar() {
  try {
    const response = await fetch('sidebar.html');
    const html = await response.text();
    
    // Insert sidebar after navbar
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.insertAdjacentHTML('afterend', html);
    }
    
    // Initialize sidebar
    updateSidebarStats();
    updateSidebarLinks();
    highlightActivePage();
    
    // Update stats every 5 seconds
    setInterval(updateSidebarStats, 5000);
  } catch (error) {
    console.error('Error loading sidebar:', error);
  }
}

// Add sidebar styles
function addSidebarStyles() {
  if (document.getElementById('sidebar-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'sidebar-styles';
  style.textContent = `
    /* Sidebar Styles */
    .sidebar-glass {
      background: rgba(255,255,255,0.82);
      backdrop-filter: blur(30px) saturate(200%);
      -webkit-backdrop-filter: blur(30px) saturate(200%);
      border-right: 1px solid rgba(240,73,35,0.12);
    }

    .dark .sidebar-glass {
      background: rgba(15,13,12,0.88);
      border-right: 1px solid rgba(240,73,35,0.2);
    }

    .sidebar-link.active {
      background: rgba(240,73,35,0.12);
      color: #000000 !important;
    }

    @media (max-width: 1023px) {
      #sidebar.show {
        transform: translateX(0);
      }
    }
    
    /* Adjust main content for sidebar */
    @media (min-width: 1024px) {
      main {
        margin-left: 16rem; /* 256px = w-64 */
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addSidebarStyles();
    loadSidebar();
  });
} else {
  addSidebarStyles();
  loadSidebar();
}

