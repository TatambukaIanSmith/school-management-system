/* ===================================================
   Supabase Authentication — supabase-auth.js
   Handle user authentication with Supabase
   =================================================== */

'use strict';

// Authentication state observer
async function initSupabaseAuth() {
  if (!window.supabaseClient) {
    console.error('❌ Supabase client not initialized');
    return;
  }

  console.log('✅ Initializing Supabase Auth...');

  // CRITICAL: Handle OAuth callback - exchange code for session
  // This must run BEFORE checking session
  const urlParams = new URLSearchParams(window.location.search);
  const hasOAuthCode = urlParams.has('code');
  
  if (hasOAuthCode) {
    console.log('🔵 OAuth callback detected, exchanging code for session...');
    try {
      const { data, error } = await supabaseClient.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error('❌ Session exchange error:', error);
      } else {
        console.log('✅ Session exchange successful:', data);
        // Clean up URL (remove OAuth params)
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('❌ Error during session exchange:', error);
    }
  }

  // Listen for auth state changes
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event);
    
    if (event === 'SIGNED_IN' && session) {
      console.log('User signed in:', session.user.email);
      handleAuthenticatedUser(session.user);
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      handleUnauthenticatedUser();
    }
  });

  // Check current session
  checkCurrentSession();
}

// Check current session
async function checkCurrentSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (session) {
    handleAuthenticatedUser(session.user);
  }
}

// Handle authenticated user
async function handleAuthenticatedUser(user) {
  try {
    console.log('🔵 Handling authenticated user:', user.email);
    
    // Get or create user profile in database
    const { data: profile, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log('Profile query result:', { profile, error });
    
    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create profile
      console.log('🔵 Creating new user profile...');
      const newProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        role: 'staff', // Default role
        photo_url: user.user_metadata?.avatar_url || null,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      const { error: insertError } = await supabaseClient.from('users').insert([newProfile]);
      
      if (insertError) {
        console.warn('⚠️ Could not create profile in database (RLS policy):', insertError.message);
        console.log('✅ Creating session anyway with user metadata');
        // Still create session even if profile creation fails
      } else {
        console.log('✅ Profile created successfully');
      }
      
      createSupabaseSession(user, newProfile);
    } else if (profile) {
      console.log('✅ Profile found, updating last login');
      // Update last login (may fail due to RLS, that's ok)
      await supabaseClient
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) {
            console.warn('⚠️ Could not update last login (RLS policy)');
          }
        });
      
      createSupabaseSession(user, profile);
    } else if (error) {
      console.warn('⚠️ Error fetching profile:', error.message);
      // Create session anyway with basic info
      createSupabaseSession(user, {
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        role: 'staff',
        photo_url: user.user_metadata?.avatar_url
      });
    }
    
    console.log('✅ Session created, user authenticated');
  } catch (error) {
    console.error('❌ Error handling authenticated user:', error);
    // Create basic session as fallback
    createSupabaseSession(user, {
      full_name: user.user_metadata?.full_name || user.email.split('@')[0],
      role: 'staff',
      photo_url: user.user_metadata?.avatar_url
    });
  }
}

// Handle unauthenticated user
function handleUnauthenticatedUser() {
  // Clear session
  localStorage.removeItem('srs_session');
  
  // Redirect to login if not on auth pages
  const currentPath = window.location.pathname;
  if (!currentPath.includes('/auth/') && !currentPath.includes('index.html')) {
    window.location.href = '../auth/login.html';
  }
}

// Create session from Supabase user
function createSupabaseSession(user, profile) {
  const session = {
    userId: user.id,
    email: user.email,
    fullName: profile.full_name || user.user_metadata?.full_name,
    role: profile.role || 'staff',
    photoURL: user.user_metadata?.avatar_url || profile.photo_url,
    loginAt: new Date().toISOString()
  };
  
  if (profile.class) {
    session.class = profile.class;
  }
  
  localStorage.setItem('srs_session', JSON.stringify(session));
}

// Sign in with email and password
async function supabaseSignIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) throw error;
    
    console.log('Sign in successful:', data.user.email);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Sign up with email and password
async function supabaseSignUp(email, password, fullName, role = 'staff') {
  try {
    // Create user account with email confirmation
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: window.location.origin + '/app/dashboard.html'
      }
    });
    
    if (error) throw error;
    
    // Create user profile in database
    if (data.user) {
      await supabaseClient.from('users').insert([{
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: role,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }]);
    }
    
    console.log('Sign up successful:', data.user.email);
    
    // Check if email confirmation is required
    if (data.user && !data.session) {
      return { 
        success: true, 
        user: data.user,
        message: 'Please check your email to verify your account!'
      };
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in with Google
async function supabaseSignInWithGoogle() {
  try {
    console.log('🔵 Starting Google Sign-In...');
    
    if (!window.supabaseClient) {
      console.error('❌ Supabase client not available');
      alert('Authentication system not ready. Please refresh the page.');
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    console.log('✅ Supabase Client available');
    
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/app/dashboard.html',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    console.log('OAuth Response:', { data, error });
    
    if (error) {
      console.error('❌ OAuth Error:', error);
      alert('Google Sign-In Error: ' + error.message);
      return { success: false, error: error.message };
    }
    
    if (data && data.url) {
      console.log('🔵 Redirecting to Google:', data.url);
      
      // Direct redirect (works best)
      window.location.href = data.url;
      
      return { success: true };
    } else {
      console.error('❌ No redirect URL received from Supabase');
      alert('Failed to initiate Google Sign-In. Please try again.');
      return { success: false, error: 'No redirect URL' };
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    alert('Google Sign-In Error: ' + error.message);
    return { success: false, error: error.message };
  }
}

// Sign out
async function supabaseSignOut() {
  try {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('srs_session');
    window.location.href = '../auth/login.html';
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Reset password
async function supabaseResetPassword(email) {
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password.html'
    });
    
    if (error) throw error;
    
    return { success: true, message: 'Password reset email sent!' };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message };
  }
}

// Resend verification email
async function supabaseResendVerification(email) {
  try {
    const { error } = await supabaseClient.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: window.location.origin + '/app/dashboard.html'
      }
    });
    
    if (error) throw error;
    
    return { success: true, message: 'Verification email sent!' };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, error: error.message };
  }
}

// Verify email with token (called when user clicks link in email)
async function supabaseVerifyEmail(token) {
  try {
    const { data, error } = await supabaseClient.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });
    
    if (error) throw error;
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: error.message };
  }
}

// Check if user is authenticated
async function isSupabaseAuthenticated() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session !== null;
}

// Get current Supabase user
async function getCurrentSupabaseUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSupabaseAuth();
  });
} else {
  initSupabaseAuth();
}

// Export functions
window.supabaseSignIn = supabaseSignIn;
window.supabaseSignUp = supabaseSignUp;
window.supabaseSignInWithGoogle = supabaseSignInWithGoogle;
window.supabaseSignOut = supabaseSignOut;
window.supabaseResetPassword = supabaseResetPassword;
window.supabaseResendVerification = supabaseResendVerification;
window.supabaseVerifyEmail = supabaseVerifyEmail;
window.isSupabaseAuthenticated = isSupabaseAuthenticated;
window.getCurrentSupabaseUser = getCurrentSupabaseUser;
