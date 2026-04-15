/* ===================================================
   Notifications System — notifications.js
   =================================================== */

'use strict';

const NOTIFICATIONS_KEY = 'srs_notifications';

// Notification types and their configurations
const NOTIFICATION_TYPES = {
  student_added: {
    icon: 'user-add',
    color: 'green',
    title: 'New Student'
  },
  student_updated: {
    icon: 'edit',
    color: 'blue',
    title: 'Student Updated'
  },
  student_deleted: {
    icon: 'trash',
    color: 'red',
    title: 'Student Removed'
  },
  user_added: {
    icon: 'user-add',
    color: 'purple',
    title: 'New User'
  },
  user_updated: {
    icon: 'edit',
    color: 'blue',
    title: 'User Updated'
  },
  system: {
    icon: 'info',
    color: 'gray',
    title: 'System'
  }
};

// ── Create Notification ────────────────────────────
function createNotification(type, message, data = {}) {
  const notifications = getNotifications();
  
  const notification = {
    id: generateId(),
    type,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString(),
    createdBy: getCurrentUser()?.fullName || 'System'
  };
  
  notifications.unshift(notification);
  
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.splice(50);
  }
  
  saveNotifications(notifications);
  updateNotificationBadge();
  
  return notification;
}

// ── Get Notifications ──────────────────────────────
function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// ── Mark as Read ───────────────────────────────────
function markAsRead(notificationId) {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.read = true;
    saveNotifications(notifications);
    updateNotificationBadge();
  }
}

function markAllAsRead() {
  const notifications = getNotifications();
  notifications.forEach(n => n.read = true);
  saveNotifications(notifications);
  updateNotificationBadge();
}

// ── Get Unread Count ───────────────────────────────
function getUnreadCount() {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}

// ── Update Badge ───────────────────────────────────
function updateNotificationBadge() {
  const badge = document.getElementById('notification-badge');
  const count = getUnreadCount();
  
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

// ── Render Notifications ───────────────────────────
function renderNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;
  
  const notifications = getNotifications();
  
  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center">
        <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background: rgba(240,73,35,0.08)">
          <svg class="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>
        <p class="text-gray-500 dark:text-gray-400">No notifications yet</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = notifications.map(n => {
    const config = NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.system;
    const timeAgo = formatTimeAgo(n.createdAt);
    
    return `
      <div class="notification-item p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${n.read ? 'opacity-60' : ''}" onclick="markAsRead('${n.id}')">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background: rgba(240,73,35,0.1)">
            ${getNotificationIcon(config.icon)}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">${config.title}</p>
              ${!n.read ? '<span class="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1"></span>' : ''}
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">${n.message}</p>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">${timeAgo} • ${n.createdBy}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Toggle Notifications Panel ─────────────────────
function toggleNotifications() {
  const panel = document.getElementById('notifications-panel');
  if (!panel) return;
  
  const isHidden = panel.classList.contains('hidden');
  
  if (isHidden) {
    panel.classList.remove('hidden');
    renderNotifications();
  } else {
    panel.classList.add('hidden');
  }
}

// ── Helper Functions ───────────────────────────────
function getNotificationIcon(type) {
  const icons = {
    'user-add': '<svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>',
    'edit': '<svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>',
    'trash': '<svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>',
    'info': '<svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  };
  
  return icons[type] || icons.info;
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

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('srs_session'));
  } catch {
    return null;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ── Initialize on Page Load ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNotificationBadge();
  
  // Close notifications panel when clicking outside
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('notifications-panel');
    const button = document.getElementById('notifications-button');
    
    if (panel && button && !panel.contains(e.target) && !button.contains(e.target)) {
      panel.classList.add('hidden');
    }
  });
});

