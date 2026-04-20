/* ===================================================
   Supabase Database Operations — supabase-db.js
   CRUD operations for students, users, and exams
   =================================================== */

'use strict';

// ══════════════════════════════════════════════════
// STUDENTS TABLE
// ══════════════════════════════════════════════════

// Get all students
async function getStudents() {
  try {
    const { data, error } = await supabaseClient
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting students:', error);
    return [];
  }
}

// Get student by ID
async function getStudent(studentId) {
  try {
    const { data, error } = await supabaseClient
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting student:', error);
    return null;
  }
}

// Add new student
async function addStudent(studentData) {
  try {
    const { data, error } = await supabaseClient
      .from('students')
      .insert([studentData])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Student added:', data.id);
    return { success: true, id: data.id, data: data };
  } catch (error) {
    console.error('Error adding student:', error);
    return { success: false, error: error.message };
  }
}

// Update student
async function updateStudent(studentId, studentData) {
  try {
    const { data, error } = await supabaseClient
      .from('students')
      .update(studentData)
      .eq('id', studentId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Student updated:', studentId);
    return { success: true, data: data };
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, error: error.message };
  }
}

// Delete student
async function deleteStudent(studentId) {
  try {
    const { error } = await supabaseClient
      .from('students')
      .delete()
      .eq('id', studentId);
    
    if (error) throw error;
    
    console.log('Student deleted:', studentId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting student:', error);
    return { success: false, error: error.message };
  }
}

// Listen to students in real-time
function listenToStudents(callback) {
  const channel = supabaseClient
    .channel('students-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'students' },
      async (payload) => {
        console.log('Students changed:', payload);
        // Fetch all students and call callback
        const students = await getStudents();
        callback(students);
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabaseClient.removeChannel(channel);
  };
}

// ══════════════════════════════════════════════════
// USERS TABLE
// ══════════════════════════════════════════════════

// Get all users
async function getUsers() {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

// Get user by ID
async function getUser(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Update user
async function updateUser(userId, userData) {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('User updated:', userId);
    return { success: true, data: data };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
}

// ══════════════════════════════════════════════════
// EXAMS TABLE
// ══════════════════════════════════════════════════

// Get all exams
async function getExams() {
  try {
    const { data, error } = await supabaseClient
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting exams:', error);
    return [];
  }
}

// Add new exam
async function addExam(examData) {
  try {
    const { data, error } = await supabaseClient
      .from('exams')
      .insert([examData])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Exam added:', data.id);
    return { success: true, id: data.id, data: data };
  } catch (error) {
    console.error('Error adding exam:', error);
    return { success: false, error: error.message };
  }
}

// Update exam
async function updateExam(examId, examData) {
  try {
    const { data, error } = await supabaseClient
      .from('exams')
      .update(examData)
      .eq('id', examId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Exam updated:', examId);
    return { success: true, data: data };
  } catch (error) {
    console.error('Error updating exam:', error);
    return { success: false, error: error.message };
  }
}

// Delete exam
async function deleteExam(examId) {
  try {
    const { error } = await supabaseClient
      .from('exams')
      .delete()
      .eq('id', examId);
    
    if (error) throw error;
    
    console.log('Exam deleted:', examId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting exam:', error);
    return { success: false, error: error.message };
  }
}

// ══════════════════════════════════════════════════
// STORAGE OPERATIONS
// ══════════════════════════════════════════════════

// Upload profile picture
async function uploadProfilePicture(file, userId) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;
    
    const { data, error } = await supabaseClient.storage
      .from('avatars')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    console.log('Profile picture uploaded:', publicUrl);
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { success: false, error: error.message };
  }
}

// Upload student photo
async function uploadStudentPhoto(file, studentId) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}-${Date.now()}.${fileExt}`;
    const filePath = `student-photos/${fileName}`;
    
    const { data, error } = await supabaseClient.storage
      .from('student-photos')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('student-photos')
      .getPublicUrl(filePath);
    
    console.log('Student photo uploaded:', publicUrl);
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading student photo:', error);
    return { success: false, error: error.message };
  }
}

// ══════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ══════════════════════════════════════════════════

window.getStudents = getStudents;
window.getStudent = getStudent;
window.addStudent = addStudent;
window.updateStudent = updateStudent;
window.deleteStudent = deleteStudent;
window.listenToStudents = listenToStudents;

window.getUsers = getUsers;
window.getUser = getUser;
window.updateUser = updateUser;

window.getExams = getExams;
window.addExam = addExam;
window.updateExam = updateExam;
window.deleteExam = deleteExam;

window.uploadProfilePicture = uploadProfilePicture;
window.uploadStudentPhoto = uploadStudentPhoto;
