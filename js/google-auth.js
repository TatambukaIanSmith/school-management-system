/* ===================================================
   Google Authentication — google-auth.js (FIXED)
   Supabase OAuth Integration (CLEAN VERSION)
   =================================================== */

'use strict';

// ⚠️ Supabase instance MUST already exist globally:
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Initialize Google Sign-In (Supabase OAuth)
 */
function initGoogleSignIn() {
  console.log('Initializing Supabase Google Sign-In...');
}

/**
 * Handle Google Sign-In button click
 */
async function handleGoogleSignIn() {
  try {
    // Redirect user to Google OAuth via Supabase
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/dashboard.html`
      }
    });

    if (error) {
      console.error('Google Sign-In Error:', error.message);
      showGoogleError('Failed to sign in with Google. Please try again.');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
    showGoogleError('Something went wrong during login.');
  }
}

/**
 * Handle OAuth callback + session restoration
 * MUST be called on dashboard page
 */
async function handleAuthRedirect() {
  try {
    // 🔥 CRITICAL: converts OAuth code into Supabase session
    const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

    if (error) {
      console.error('Session exchange error:', error.message);
    }

    // Get session after exchange
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.warn('No session found — redirecting to login');
      window.location.href = '../auth/login.html';
      return;
    }

    console.log('User logged in:', session.user);

    showGoogleSuccess('Login successful! Redirecting...');

    // Optional: small delay for UX
    setTimeout(() => {
      window.location.href = '../app/dashboard.html';
    }, 800);

  } catch (err) {
    console.error('Auth redirect error:', err);
    window.location.href = '../auth/login.html';
  }
}

/**
 * Show error message
 */
function showGoogleError(message) {
  const errorDiv = document.getElementById('login-error') ||
                   document.getElementById('signup-error');

  if (errorDiv) {
    const text = errorDiv.querySelector('span');
    if (text) text.textContent = message;

    errorDiv.classList.remove('hidden');

    setTimeout(() => {
      errorDiv.classList.add('hidden');
    }, 5000);
  } else {
    alert(message);
  }
}

/**
 * Show success message (toast)
 */
function showGoogleSuccess(message) {
  const toast = document.createElement('div');
  toast.className =
    'fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-lg text-white text-sm font-medium bg-green-500';

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Check if user is authenticated (use in dashboard)
 */
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = '../auth/login.html';
    return null;
  }

  return session;
}

/**
 * Initialize on page load
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    initGoogleSignIn();

    // Only run redirect handler on dashboard
    if (window.location.pathname.includes('dashboard')) {
      await handleAuthRedirect();
    }
  });
} else {
  initGoogleSignIn();

  if (window.location.pathname.includes('dashboard')) {
    handleAuthRedirect();
  }
}

// Expose functions globally
window.handleGoogleSignIn = handleGoogleSignIn;
window.handleAuthRedirect = handleAuthRedirect;
window.checkAuth = checkAuth;