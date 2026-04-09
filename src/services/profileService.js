// Profile Management Service (Chrome-style)
import { STORAGE_KEYS } from '../config/constants.js';

const PROFILES_KEY = 'srs_profiles';
const ACTIVE_PROFILE_KEY = 'srs_active_profile';

// Get all saved profiles
export function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY)) || [];
  } catch {
    return [];
  }
}

// Save profiles
function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

// Get active profile ID
export function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

// Set active profile
function setActiveProfileId(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
}

// Add current session as a profile
export function addProfile(session, nickname = null) {
  const profiles = getProfiles();
  
  // Check if profile already exists
  const existing = profiles.find(p => p.userId === session.userId);
  if (existing) {
    throw new Error('This account is already saved as a profile');
  }
  
  const profile = {
    id: Date.now().toString(),
    userId: session.userId,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    nickname: nickname || session.fullName,
    avatar: generateAvatar(session.fullName),
    color: generateColor(session.role),
    addedAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  };
  
  if (session.class) {
    profile.class = session.class;
  }
  
  profiles.push(profile);
  saveProfiles(profiles);
  setActiveProfileId(profile.id);
  
  return profile;
}

// Remove a profile
export function removeProfile(profileId) {
  let profiles = getProfiles();
  profiles = profiles.filter(p => p.id !== profileId);
  saveProfiles(profiles);
  
  // If removed profile was active, clear active
  if (getActiveProfileId() === profileId) {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

// Switch to a profile
export function switchToProfile(profileId) {
  const profiles = getProfiles();
  const profile = profiles.find(p => p.id === profileId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // Get user credentials from users storage
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  const user = users.find(u => u.id === profile.userId);
  
  if (!user) {
    throw new Error('User account not found');
  }
  
  if (!user.isActive) {
    throw new Error('This account has been deactivated');
  }
  
  // Create session for this profile
  const session = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    employeeId: user.employeeId,
    loginAt: new Date().toISOString()
  };
  
  if (user.class) {
    session.class = user.class;
  }
  
  // Save session
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  
  // Update profile last used
  profile.lastUsed = new Date().toISOString();
  const updatedProfiles = profiles.map(p => p.id === profileId ? profile : p);
  saveProfiles(updatedProfiles);
  setActiveProfileId(profileId);
  
  return session;
}

// Update profile nickname
export function updateProfileNickname(profileId, nickname) {
  const profiles = getProfiles();
  const profile = profiles.find(p => p.id === profileId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  profile.nickname = nickname;
  const updatedProfiles = profiles.map(p => p.id === profileId ? profile : p);
  saveProfiles(updatedProfiles);
  
  return profile;
}

// Get current profile
export function getCurrentProfile() {
  const activeId = getActiveProfileId();
  if (!activeId) return null;
  
  const profiles = getProfiles();
  return profiles.find(p => p.id === activeId);
}

// Check if current session is saved as profile
export function isCurrentSessionSaved() {
  const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || '{}');
  if (!session.userId) return false;
  
  const profiles = getProfiles();
  return profiles.some(p => p.userId === session.userId);
}

// Generate avatar initials
function generateAvatar(fullName) {
  const names = fullName.split(' ');
  if (names.length >= 2) {
    return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
  }
  return fullName.charAt(0).toUpperCase();
}

// Generate color based on role
function generateColor(role) {
  const colors = {
    administrator: '#ef4444',
    registrar: '#3b82f6',
    teacher: '#10b981',
    counselor: '#8b5cf6',
    staff: '#6b7280',
    security: '#f59e0b',
    student: '#ec4899'
  };
  return colors[role] || '#f04923';
}

// Get profile stats
export function getProfileStats() {
  const profiles = getProfiles();
  return {
    total: profiles.length,
    byRole: profiles.reduce((acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1;
      return acc;
    }, {}),
    recentlyUsed: profiles
      .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
      .slice(0, 3)
  };
}
