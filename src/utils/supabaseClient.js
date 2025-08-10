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

// Function to set authentication token
export const setSupabaseAuth = (accessToken) => {
  if (accessToken) {
    console.log('Setting Supabase auth token');
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: accessToken // Using same token for both
    });
  }
};

// Initialize auth from localStorage
const initializeAuth = () => {
  try {
    const storedToken = localStorage.getItem('learnsphere_token');
    if (storedToken) {
      console.log('Initializing Supabase auth from localStorage');
      setSupabaseAuth(storedToken);
    }
  } catch (error) {
    console.warn('Failed to initialize Supabase auth:', error);
  }
};

// Initialize on module load
initializeAuth();

// Course operations
export const courseOperations = {
  // Export supabase client for direct access
  supabase,
  // Fetch all courses for a teacher
  async fetchTeacherCourses(teacherId) {
    console.log('=== FETCH TEACHER COURSES ===');
    console.log('Fetching courses for teacher ID:', teacherId);

    if (!teacherId) {
      throw new Error('Teacher ID is required');
    }

    try {
      console.log('Making Supabase query...');
      const startTime = Date.now();

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      const endTime = Date.now();
      console.log(`Query completed in ${endTime - startTime}ms`);

      if (error) {
        console.error('Supabase error fetching teacher courses:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Successfully fetched courses:', data);
      console.log('Number of courses found:', data?.length || 0);
      console.log('=== FETCH TEACHER COURSES SUCCESS ===');
      return data || [];
    } catch (error) {
      console.error('=== FETCH TEACHER COURSES ERROR ===');
      console.error('Error in fetchTeacherCourses:', error);
      throw error;
    }
  },

  // Create a new course
  async createCourse(courseData) {
    console.log('=== SUPABASE CREATE COURSE ===');
    console.log('Creating course with data:', courseData);

    try {
      // Check authentication status
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session);
      console.log('Session error:', sessionError);

      if (!session) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Validate required fields
      if (!courseData.teacher_id) {
        throw new Error('Teacher ID is required');
      }
      if (!courseData.title) {
        throw new Error('Course title is required');
      }

      console.log('Attempting to insert course...');
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating course:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Course created successfully:', data);
      console.log('=== SUPABASE CREATE COURSE SUCCESS ===');
      return data;
    } catch (error) {
      console.error('=== SUPABASE CREATE COURSE ERROR ===');
      console.error('Error in createCourse:', error);
      throw error;
    }
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
    console.log('AdminOperations: Fetching pending approvals...');

    // First, let's check what's in the teacher_approval_requests table
    const { data: allRequests, error: allError } = await supabase
      .from('teacher_approval_requests')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('All teacher approval requests:', allRequests);

    // Try the simplest approach first - just get the requests and manually join
    const { data: requests, error } = await supabase
      .from('teacher_approval_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teacher approval requests:', error);
      throw error;
    }

    console.log('Raw teacher approval requests:', requests);

    // If no requests, return empty array
    if (!requests || requests.length === 0) {
      console.log('No pending teacher approval requests found');
      return [];
    }

    // Get profile data for each teacher
    const teacherIds = requests.map(req => req.teacher_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .in('id', teacherIds);

    if (profileError) {
      console.error('Error fetching teacher profiles:', profileError);
      throw profileError;
    }

    console.log('Teacher profiles:', profiles);

    // Combine the data
    const combinedData = requests.map(request => {
      const profile = profiles?.find(p => p.id === request.teacher_id);
      return {
        ...request,
        profiles: profile
      };
    });

    console.log('Combined approval requests with profiles:', combinedData);

    return combinedData;
  },

  // Approve teacher request
  async approveTeacher(requestId, teacherId, adminId, notes = '') {
    console.log('AdminOperations - Approving teacher:', { requestId, teacherId, adminId, notes });

    try {
      // Use backend admin API for proper permissions
      console.log('AdminOperations - Making API call to backend...');
      const response = await fetch('http://localhost:8000/api/admin/approve-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          teacher_id: teacherId,
          admin_id: adminId,
          notes: notes
        })
      });

      console.log('AdminOperations - API response status:', response.status);
      console.log('AdminOperations - API response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AdminOperations - API error response:', errorData);
        throw new Error(errorData.detail || 'Failed to approve teacher');
      }

      const result = await response.json();
      console.log('AdminOperations - Teacher approved successfully:', result);
      return result;
    } catch (error) {
      console.error('AdminOperations - Exception in approveTeacher:', error);
      throw error;
    }

    console.log('Teacher approved successfully and account activated');

    // Send approval notification email
    try {
      const { data: teacherProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', teacherId)
        .single();

      if (teacherProfile) {
        // Get admin name
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', adminId)
          .single();

        const adminName = adminProfile?.full_name || 'Administrator';

        // Send notification via backend API
        await fetch('http://localhost:8000/api/notifications/teacher-approval', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teacher_email: teacherProfile.email,
            teacher_name: teacherProfile.full_name,
            admin_name: adminName
          })
        });

        console.log('Teacher approval notification email sent');
      }
    } catch (emailError) {
      console.warn('Failed to send approval notification email:', emailError);
      // Don't fail the approval process if email fails
    }

    return true;
  },

  // Reject teacher request
  async rejectTeacher(requestId, teacherId, adminId, reason) {
    console.log('Rejecting teacher:', { requestId, teacherId, adminId, reason });

    // Use backend admin API for proper permissions
    const response = await fetch('http://localhost:8000/api/admin/reject-teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_id: requestId,
        teacher_id: teacherId,
        admin_id: adminId,
        reason: reason
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to reject teacher');
    }

    const result = await response.json();
    console.log('Teacher rejected successfully:', result);

    // Send rejection notification email
    try {
      const { data: teacherProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', teacherId)
        .single();

      if (teacherProfile) {
        // Get admin name
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', adminId)
          .single();

        const adminName = adminProfile?.full_name || 'Administrator';

        // Send notification via backend API
        await fetch('http://localhost:8000/api/notifications/teacher-rejection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teacher_email: teacherProfile.email,
            teacher_name: teacherProfile.full_name,
            reason: reason,
            admin_name: adminName
          })
        });

        console.log('Teacher rejection notification email sent');
      }
    } catch (emailError) {
      console.warn('Failed to send rejection notification email:', emailError);
      // Don't fail the rejection process if email fails
    }

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

    // Use backend admin API for proper permissions
    const response = await fetch('http://localhost:8000/api/admin/toggle-user-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        is_active: isActive,
        admin_id: adminId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update user status');
    }

    const result = await response.json();
    console.log('User status updated successfully:', result);

    // Try to log the action (don't fail if this fails)
    try {
      const { error: logError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          action: isActive ? 'user_enabled' : 'user_disabled',
          admin_id: adminId,
          details: {
            previous_status: currentUser.is_active,
            new_status: isActive,
            user_email: currentUser.email,
            user_name: currentUser.full_name
          }
        });

      if (logError) {
        console.warn('Failed to log user action (non-critical):', logError);
      }
    } catch (logException) {
      console.warn('Exception while logging user action (non-critical):', logException);
    }

    // Send user status change notification email
    try {
      // Get admin name
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', adminId)
        .single();

      const adminName = adminProfile?.full_name || 'Administrator';

      // Send notification via backend API
      await fetch('http://localhost:8000/api/notifications/user-status-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: currentUser.email,
          user_name: currentUser.full_name,
          is_enabled: isActive,
          admin_name: adminName
        })
      });

      console.log('User status change notification email sent');
    } catch (emailError) {
      console.warn('Failed to send user status change notification email:', emailError);
      // Don't fail the status change if email fails
    }

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
