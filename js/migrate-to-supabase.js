/* ===================================================
   Migrate localStorage to Supabase (SAFE VERSION)
   =================================================== */

async function migrateToSupabase() {
  console.log('🚀 Starting migration to Supabase...');

  // Check Supabase
  if (!window.supabaseClient) {
    console.error('❌ Supabase not configured!');
    return;
  }

  const supabase = window.supabaseClient;

  try {
    /* =========================
       1. MIGRATE USERS (PROFILE ONLY)
       ========================= */
    const users = JSON.parse(localStorage.getItem('srs_users') || '[]');
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`Migrating user profile: ${user.email}`);

      const { error } = await supabase.from('users').upsert([
        {
          email: user.email,
          full_name: user.fullName,
          role: user.role,
          is_active: user.isActive ?? true,
          created_at: user.createdAt || new Date().toISOString()
        }
      ], { onConflict: 'email' });

      if (error) {
        console.warn(`⚠️ User migration failed (${user.email}):`, error.message);
      } else {
        console.log(`✅ Migrated user profile: ${user.email}`);
      }
    }

    /* =========================
       2. MIGRATE STUDENTS
       ========================= */
    const students = JSON.parse(localStorage.getItem('srs_students') || '[]');
    console.log(`Found ${students.length} students`);

    for (const student of students) {
      const { error } = await supabase.from('students').upsert([
        {
          student_id: student.studentId,
          full_name: student.fullName,
          email: student.email,
          gender: student.gender,
          date_of_birth: student.dateOfBirth,
          class_level: student.classLevel,
          parent_name: student.parentName,
          contact: student.contact,
          address: student.address,
          photo_url: student.photoUrl,
          status: student.status || 'active',
          created_at: student.createdAt || new Date().toISOString()
        }
      ], { onConflict: 'student_id' });

      if (error) {
        console.warn(`⚠️ Student failed (${student.studentId}):`, error.message);
      } else {
        console.log(`✅ Migrated student: ${student.fullName}`);
      }
    }

    console.log('🎉 Migration complete!');
    console.log('⚠️ Note: Auth users must be recreated in Supabase Auth manually');

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

/* =========================
   HELPERS
   ========================= */
window.migrateToSupabase = migrateToSupabase;

console.log('💡 Run migration using: migrateToSupabase()');