// Test Data for LearnSphere
export const testUsers = {
  admin: {
    email: "admin@learnsphere.com",
    password: "admin123",
    full_name: "System Administrator",
    role: "admin",
    id: "admin-001"
  },
  teacher: {
    email: "teacher@learnsphere.com", 
    password: "teacher123",
    full_name: "Test Teacher",
    role: "teacher",
    id: "teacher-001"
  },
  student: {
    email: "student@learnsphere.com",
    password: "student123", 
    full_name: "Test Student",
    role: "student",
    id: "student-001"
  }
};

export const testCourses = [
  {
    id: "course-001",
    title: "Introduction to Python Programming",
    description: "Learn Python from basics to advanced concepts including variables, functions, classes, and more. Perfect for beginners.",
    instructor: "Dr. Smith",
    instructor_id: "teacher-001",
    duration: "8 weeks",
    price: 99.99,
    category: "Programming",
    level: "Beginner",
    enrollment_count: 156,
    rating: 4.8,
    thumbnail: "/api/thumbnails/python-course.jpg",
    modules: [
      {
        id: "module-1",
        title: "Getting Started with Python",
        lessons: [
          { id: "lesson-1", title: "Installing Python", duration: "15 min" },
          { id: "lesson-2", title: "Your First Program", duration: "20 min" }
        ]
      }
    ]
  },
  {
    id: "course-002",
    title: "Machine Learning Fundamentals", 
    description: "Comprehensive guide to ML algorithms, data preprocessing, model training, and evaluation techniques.",
    instructor: "Dr. Johnson",
    instructor_id: "teacher-001",
    duration: "12 weeks",
    price: 199.99,
    category: "Data Science",
    level: "Intermediate", 
    enrollment_count: 89,
    rating: 4.9,
    thumbnail: "/api/thumbnails/ml-course.jpg",
    modules: [
      {
        id: "module-1",
        title: "Introduction to Machine Learning",
        lessons: [
          { id: "lesson-1", title: "What is ML?", duration: "25 min" },
          { id: "lesson-2", title: "Types of Learning", duration: "30 min" }
        ]
      }
    ]
  },
  {
    id: "course-003",
    title: "Web Development with React",
    description: "Build modern, responsive web applications using React, hooks, context, and best practices.",
    instructor: "Sarah Wilson",
    instructor_id: "teacher-001", 
    duration: "10 weeks",
    price: 149.99,
    category: "Web Development",
    level: "Intermediate",
    enrollment_count: 234,
    rating: 4.7,
    thumbnail: "/api/thumbnails/react-course.jpg",
    modules: [
      {
        id: "module-1",
        title: "React Basics",
        lessons: [
          { id: "lesson-1", title: "Components and JSX", duration: "35 min" },
          { id: "lesson-2", title: "Props and State", duration: "40 min" }
        ]
      }
    ]
  }
];

export const testAssignments = [
  {
    id: "assignment-001",
    course_id: "course-001",
    title: "Python Variables Exercise",
    description: "Create a program that demonstrates different variable types in Python.",
    due_date: "2025-10-20",
    points: 100,
    submissions: [
      {
        id: "submission-001",
        student_id: "student-001",
        content: "Here's my solution...",
        grade: 95,
        feedback: "Great work! Minor syntax improvements needed."
      }
    ]
  }
];

export const testQuizzes = [
  {
    id: "quiz-001",
    course_id: "course-001",
    title: "Python Basics Quiz",
    questions: [
      {
        id: "q1",
        question: "What is Python?",
        options: [
          "A programming language",
          "A type of snake",
          "A database", 
          "An operating system"
        ],
        correct_answer: 0,
        explanation: "Python is a high-level programming language known for its simplicity."
      },
      {
        id: "q2",
        question: "Which keyword is used to define a function in Python?",
        options: [
          "function",
          "def", 
          "define",
          "func"
        ],
        correct_answer: 1,
        explanation: "The 'def' keyword is used to define functions in Python."
      }
    ],
    duration: 30,
    attempts: [
      {
        id: "attempt-001",
        student_id: "student-001",
        answers: { q1: 0, q2: 1 },
        score: 100,
        completed_at: "2025-10-10T10:30:00Z"
      }
    ]
  }
];

export const testForumPosts = [
  {
    id: "post-001",
    course_id: "course-001",
    author_id: "student-001",
    title: "Help with Python variables",
    content: "I'm having trouble understanding local vs global variables. Can someone explain?",
    replies: [
      {
        id: "reply-001",
        author_id: "teacher-001",
        content: "Great question! Local variables are defined inside functions, while global variables are accessible throughout the program.",
        created_at: "2025-10-10T11:00:00Z"
      }
    ],
    created_at: "2025-10-10T10:45:00Z"
  }
];

export const testNotifications = [
  {
    id: "notif-001",
    user_id: "student-001",
    title: "New Assignment Posted",
    message: "Python Variables Exercise has been posted for Introduction to Python Programming",
    type: "assignment",
    read: false,
    created_at: "2025-10-10T09:00:00Z"
  },
  {
    id: "notif-002", 
    user_id: "student-001",
    title: "Assignment Graded",
    message: "Your submission for Python Variables Exercise has been graded: 95/100",
    type: "grade",
    read: true,
    created_at: "2025-10-09T14:30:00Z"
  }
];

export const testAIResponses = {
  tutor: {
    greeting: "Hello! I'm your AI tutor. I can help you with:\n\n• Explaining concepts\n• Solving problems\n• Providing examples\n• Answering questions\n\nWhat would you like to learn about today?",
    suggestions: [
      "Explain Python variables",
      "Help with this math problem", 
      "Show me examples of React components",
      "What is machine learning?"
    ]
  },
  quizGenerator: {
    topics: [
      "Python Programming",
      "Machine Learning",
      "Web Development", 
      "Data Structures",
      "Algorithms"
    ]
  }
};
