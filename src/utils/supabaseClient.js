import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn if environment variables are not set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key'
);

// Course operations
export const courseOperations = {
  // Export supabase client for direct access
  supabase,
  // Fetch all courses for a teacher
  async fetchTeacherCourses(teacherId) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create a new course
  async createCourse(courseData) {
    console.log('Creating course with data:', courseData);

    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating course:', error);
      throw error;
    }

    console.log('Course created successfully:', data);
    return data;
  },

  // Update a course
  async updateCourse(courseId, updates) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a course
  async deleteCourse(courseId) {
    console.log('Deleting course from database:', courseId);

    // First get the course data before deleting (for real-time)
    const { data: courseToDelete } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    console.log('Course deleted successfully:', courseId);
    return courseToDelete;
  },

  // Upload thumbnail to Supabase Storage
  async uploadThumbnail(file, courseId) {
    console.log('Uploading thumbnail:', file.name, 'for course:', courseId);

    const fileExt = file.name.split('.').pop();
    const fileName = `${courseId}-${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('course-thumbnails')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-thumbnails')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      throw error;
    }
  },

  // Subscribe to real-time changes
  subscribeToChanges(teacherId, callback) {
    console.log('Creating subscription for teacher:', teacherId);

    const channel = supabase
      .channel(`courses-changes-${teacherId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses',
          filter: `teacher_id=eq.${teacherId}`
        },
        (payload) => {
          console.log('Raw subscription payload:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return channel;
  }
};

// Enrollment operations
export const enrollmentOperations = {
  // Get all available courses (for All Courses page)
  async getAllCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles!courses_teacher_id_fkey(full_name)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get enrolled courses for a student
  async getEnrolledCourses(studentId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses(
          *,
          profiles!courses_teacher_id_fkey(full_name)
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Check if student is enrolled in a course
  async checkEnrollment(studentId, courseId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Enroll student in a course
  async enrollInCourse(studentId, courseId) {
    console.log('Enrolling student:', studentId, 'in course:', courseId);

    const { data, error } = await supabase
      .from('enrollments')
      .insert([{
        student_id: studentId,
        course_id: courseId,
        status: 'active',
        progress: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Enrollment error:', error);
      throw error;
    }

    console.log('Enrollment successful:', data);
    return data;
  },

  // Unenroll from course
  async unenrollFromCourse(studentId, courseId) {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (error) throw error;
    return true;
  },

  // Get course with enrollment status
  async getCourseWithEnrollment(courseId, studentId) {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        profiles!courses_teacher_id_fkey(full_name)
      `)
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    return {
      ...course,
      enrollment: enrollment || null,
      isEnrolled: !!enrollment
    };
  }
};

// Admin operations
export const adminOperations = {
  // Get dashboard statistics
  async getDashboardStats() {
    const { data, error } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  // Get pending teacher approval requests
  async getPendingApprovals() {
    const { data, error } = await supabase
      .from('teacher_approval_requests')
      .select(`
        *,
        profiles!teacher_approval_requests_teacher_id_fkey(
          id,
          email,
          full_name,
          created_at
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Approve teacher request
  async approveTeacher(requestId, teacherId, adminId, notes = '') {
    console.log('Approving teacher:', { requestId, teacherId, adminId });

    // Update approval request
    const { error: requestError } = await supabase
      .from('teacher_approval_requests')
      .update({
        status: 'approved',
        admin_id: adminId,
        admin_notes: notes,
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (requestError) throw requestError;

    // Update teacher profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        approval_status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq('id', teacherId);

    if (profileError) throw profileError;

    return true;
  },

  // Reject teacher request
  async rejectTeacher(requestId, teacherId, adminId, reason) {
    console.log('Rejecting teacher:', { requestId, teacherId, adminId, reason });

    // Update approval request
    const { error: requestError } = await supabase
      .from('teacher_approval_requests')
      .update({
        status: 'rejected',
        admin_id: adminId,
        admin_notes: reason,
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (requestError) throw requestError;

    // Update teacher profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        approval_status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', teacherId);

    if (profileError) throw profileError;

    return true;
  },

  // Get all users for management
  async getAllUsers(role = null) {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Toggle user active status
  async toggleUserStatus(userId, isActive, adminId) {
    console.log('Toggling user status:', { userId, isActive, adminId });

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (error) throw error;

    // Log the action
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        action: isActive ? 'user_enabled' : 'user_disabled',
        admin_id: adminId,
        details: { previous_status: !isActive, new_status: isActive }
      });

    return true;
  },

  // Get user activity logs
  async getUserActivityLogs(limit = 50) {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select(`
        *,
        profiles!user_activity_logs_user_id_fkey(full_name, email, role),
        admin:profiles!user_activity_logs_admin_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get email notifications
  async getEmailNotifications(limit = 50) {
    const { data, error } = await supabase
      .from('email_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Subscribe to real-time admin updates
  subscribeToAdminUpdates(callback) {
    const channel = supabase
      .channel('admin-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teacher_approval_requests'
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        callback
      )
      .subscribe();

    return channel;
  }
};

export default supabase;
