/* ===================================================
   Supabase Configuration — supabase-config.js
   Initialize Supabase client
   =================================================== */

'use strict';

// Supabase configuration
const SUPABASE_URL = 'https://abtzakbsfcdmjmnmfety.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHpha2JzZmNkbWptbm1mZXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODA2NTcsImV4cCI6MjA5MjI1NjY1N30.nFtJnA7LNMqudEvalQZX3wjnN7FEKYnBBXEwEen7Z2M';

// Initialize Supabase client
let supabaseClient;

try {
  // Check if supabase library is loaded
  if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded. Make sure supabase.min.js is loaded before this script.');
  } else {
    // Create Supabase client
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Expose to window for other scripts
    window.supabaseClient = supabaseClient;
    
    console.log('✅ Supabase initialized successfully');
  }
} catch (error) {
  console.error('❌ Error initializing Supabase:', error);
}
