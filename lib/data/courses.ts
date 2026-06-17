// ─── Types ───────────────────────────────────────────────────────────────────

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced"
export type CourseCategory =
  | "Engineering"
  | "Data Science"
  | "Design"
  | "Business"
  | "Compliance"
  | "Leadership"
  | "Security"
  | "Product"

export interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "quiz" | "reading" | "assignment" | "live"
  completed: boolean
  locked: boolean
  videoId?: string
  questions?: QuizQuestion[]
}

export interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  instructor: string
  instructorTitle: string
  category: CourseCategory
  level: CourseLevel
  totalDuration: string
  rating: number
  reviewCount: number
  studentsCount: number
  thumbnail: string
  thumbnailColor: string
  description: string
  shortDesc: string
  tags: string[]
  price: number | "Free"
  isMandatory?: boolean // enterprise compliance
  certificateOffered: boolean
  sections: Section[]
  // For enrolled courses
  progress?: number
  enrolledDate?: string
  lastAccessed?: string
  grade?: number
  nextLessonId?: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  category: CourseCategory
  courseIds: string[]
  skills: string[]
  estimatedHours: number
  progress: number
  isMandatory: boolean
  mandatoryDeadline?: string
  thumbnail: string
  color: string
  enrolledCount: number
  level: CourseLevel
}

export interface Assignment {
  id: string
  courseId: string
  courseName: string
  title: string
  description: string
  dueDate: string
  submittedDate?: string
  status: "pending" | "submitted" | "graded" | "late" | "overdue"
  grade?: number
  maxGrade: number
  type: "project" | "essay" | "practical" | "report" | "presentation"
  attachments?: string[]
  feedback?: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

export interface Quiz {
  id: string
  courseId: string
  courseName: string
  title: string
  description: string
  questions: QuizQuestion[]
  timeLimit: number // minutes
  attempts: number
  maxAttempts: number
  bestScore?: number
  passingScore: number
  status: "available" | "in-progress" | "completed" | "locked"
  dueDate?: string
}

export interface Certificate {
  id: string
  courseId: string
  courseName: string
  instructorName: string
  issuedDate: string
  expiryDate?: string
  credentialId: string
  skills: string[]
  category: CourseCategory
  thumbnail: string
  thumbnailColor: string
  verificationUrl: string
  grade: number
}

export interface DiscussionThread {
  id: string
  courseId: string
  courseName: string
  title: string
  body: string
  author: string
  authorAvatar: string
  authorRole: "student" | "instructor"
  createdAt: string
  replies: number
  views: number
  isPinned: boolean
  isSolved: boolean
  tags: string[]
  lastReplyAt: string
  lastReplyBy: string
}

export interface ScheduleEvent {
  id: string
  type: "live-session" | "assignment-due" | "quiz" | "exam" | "office-hours" | "workshop"
  title: string
  courseId: string
  courseName: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string
  description?: string
  meetLink?: string
  status: "upcoming" | "today" | "past"
  color: string
}

// ─── Course Catalog ───────────────────────────────────────────────────────────

export const COURSES: Course[] = [
  {
    id: "c1",
    title: "React & Next.js Masterclass",
    instructor: "Sarah Chen",
    instructorTitle: "Senior Engineer @ Meta",
    category: "Engineering",
    level: "Intermediate",
    totalDuration: "42h 30m",
    rating: 4.9,
    reviewCount: 3847,
    studentsCount: 28400,
    thumbnail: "⚛️",
    thumbnailColor: "#3B82F6",
    description:
      "A deep dive into building production-grade applications with React 19 and Next.js 15. Covers Server Components, streaming, App Router patterns, performance optimization, and deployment strategies on Vercel and AWS.",
    shortDesc: "Master modern React with Next.js 15, Server Components, and production deployment.",
    tags: ["React", "Next.js", "TypeScript", "Server Components", "Vercel"],
    price: 149,
    certificateOffered: true,
    progress: 68,
    enrolledDate: "2024-09-15",
    lastAccessed: "2025-06-11",
    grade: 87,
    nextLessonId: "l-c1-2-3",
    sections: [
      {
        id: "s1",
        title: "Foundations of React 19",
        lessons: [
          { id: "l-c1-1-1", title: "What's New in React 19", duration: "14:32", type: "video", completed: true, locked: false, videoId: "Tn6-PIqc4UM" },
          { id: "l-c1-1-2", title: "JSX Deep Dive", duration: "22:15", type: "video", completed: true, locked: false, videoId: "Tn6-PIqc4UM" },
          { id: "l-c1-1-3", title: "Component Lifecycle & Hooks", duration: "38:44", type: "video", completed: true, locked: false, videoId: "Tn6-PIqc4UM" },
          { id: "l-c1-1-4", title: "State Management Patterns", duration: "31:20", type: "video", completed: true, locked: false, videoId: "Tn6-PIqc4UM" },
          { id: "l-c1-1-5", title: "Module Quiz: React Basics", duration: "15:00", type: "quiz", completed: true, locked: false, questions: [
            { id: "sq-1", question: "Which hook lets you run code after a component renders?", options: ["useState", "useEffect", "useContext", "useRef"], correctIndex: 1 },
            { id: "sq-2", question: "What is JSX?", options: ["A JavaScript framework", "A CSS preprocessor", "A syntax extension that looks like HTML", "A build tool"], correctIndex: 2 },
            { id: "sq-3", question: "What does React.memo do?", options: ["Memoizes a hook value", "Prevents re-renders if props haven't changed", "Creates a memoized selector", "Caches API responses"], correctIndex: 1 },
            { id: "sq-4", question: "What is the virtual DOM?", options: ["A browser API", "A lightweight in-memory representation of the real DOM", "A server-side rendering technique", "A CSS layout engine"], correctIndex: 1 },
          ]},
        ],
      },
      {
        id: "s2",
        title: "Next.js App Router",
        lessons: [
          { id: "l-c1-2-1", title: "App Router Architecture", duration: "28:10", type: "video", completed: true, locked: false, videoId: "Tn6-PIqc4UM" },
          { id: "l-c1-2-2", title: "Server vs Client Components", duration: "35:05", type: "video", completed: true, locked: false, videoId: "Tn6-PIqc4UM" },
          { id: "l-c1-2-3", title: "Server Components Deep Dive", duration: "24:18", type: "video", completed: false, locked: false, videoId: "Tn6-PIqc4UM" },
          { id: "l-c1-2-4", title: "Data Fetching Patterns", duration: "42:30", type: "video", completed: false, locked: false, videoId: "Tn6-PIqc4UM" },
          { id: "l-c1-2-5", title: "Streaming & Suspense", duration: "29:55", type: "video", completed: false, locked: false, videoId: "Tn6-PIqc4UM" },
          { id: "l-c1-2-6", title: "Lab: Build a Blog App", duration: "60:00", type: "assignment", completed: false, locked: false },
        ],
      },
      {
        id: "s3",
        title: "Performance & Production",
        lessons: [
          { id: "l-c1-3-1", title: "Code Splitting & Lazy Loading", duration: "18:45", type: "video", completed: false, locked: true },
          { id: "l-c1-3-2", title: "Image & Font Optimization", duration: "16:20", type: "video", completed: false, locked: true },
          { id: "l-c1-3-3", title: "Core Web Vitals", duration: "22:10", type: "video", completed: false, locked: true },
          { id: "l-c1-3-4", title: "Deployment on Vercel & AWS", duration: "35:00", type: "video", completed: false, locked: true },
          { id: "l-c1-3-5", title: "Final Project: SaaS Dashboard", duration: "120:00", type: "assignment", completed: false, locked: true },
          { id: "l-c1-3-6", title: "Final Exam", duration: "45:00", type: "quiz", completed: false, locked: true },
        ],
      },
    ],
  },
  {
    id: "c2",
    title: "TypeScript for Professional Developers",
    instructor: "Marcus Webb",
    instructorTitle: "Staff Engineer @ Stripe",
    category: "Engineering",
    level: "Intermediate",
    totalDuration: "28h 15m",
    rating: 4.8,
    reviewCount: 2193,
    studentsCount: 19200,
    thumbnail: "🔷",
    thumbnailColor: "#2563EB",
    description:
      "Go beyond the basics. Learn advanced TypeScript — generics, mapped types, conditional types, declaration merging, and how to build rock-solid type systems for large-scale applications.",
    shortDesc: "Advanced TypeScript: generics, utility types, and type-safe architecture.",
    tags: ["TypeScript", "Generics", "Design Patterns", "Node.js"],
    price: 119,
    certificateOffered: true,
    progress: 42,
    enrolledDate: "2024-11-02",
    lastAccessed: "2025-06-09",
    grade: 91,
    nextLessonId: "l-c2-2-2",
    sections: [
      {
        id: "s1",
        title: "TypeScript Fundamentals Review",
        lessons: [
          { id: "l-c2-1-1", title: "Types, Interfaces & Enums", duration: "18:40", type: "video", completed: true, locked: false },
          { id: "l-c2-1-2", title: "Union & Intersection Types", duration: "24:15", type: "video", completed: true, locked: false },
          { id: "l-c2-1-3", title: "Type Guards & Narrowing", duration: "32:00", type: "video", completed: true, locked: false },
        ],
      },
      {
        id: "s2",
        title: "Generics & Utility Types",
        lessons: [
          { id: "l-c2-2-1", title: "Understanding Generics", duration: "38:20", type: "video", completed: true, locked: false },
          { id: "l-c2-2-2", title: "Generics & Utility Types", duration: "18:30", type: "video", completed: false, locked: false },
          { id: "l-c2-2-3", title: "Mapped Types", duration: "29:45", type: "video", completed: false, locked: false },
          { id: "l-c2-2-4", title: "Conditional Types", duration: "35:10", type: "video", completed: false, locked: false },
          { id: "l-c2-2-5", title: "Module Quiz", duration: "20:00", type: "quiz", completed: false, locked: false },
        ],
      },
      {
        id: "s3",
        title: "Real-World Type Systems",
        lessons: [
          { id: "l-c2-3-1", title: "Declaration Merging", duration: "22:30", type: "video", completed: false, locked: true },
          { id: "l-c2-3-2", title: "Module Augmentation", duration: "18:15", type: "video", completed: false, locked: true },
          { id: "l-c2-3-3", title: "Type-Safe API Clients", duration: "44:00", type: "video", completed: false, locked: true },
          { id: "l-c2-3-4", title: "Capstone Project", duration: "90:00", type: "assignment", completed: false, locked: true },
        ],
      },
    ],
  },
  {
    id: "c3",
    title: "System Design for Engineers",
    instructor: "Priya Nair",
    instructorTitle: "Principal Engineer @ Google",
    category: "Engineering",
    level: "Advanced",
    totalDuration: "55h 00m",
    rating: 4.9,
    reviewCount: 5120,
    studentsCount: 41800,
    thumbnail: "🏗️",
    thumbnailColor: "#8B5CF6",
    description:
      "Comprehensive system design course covering scalability, distributed systems, microservices, databases, caching, load balancing, and interview preparation for FAANG-level engineering roles.",
    shortDesc: "Design scalable systems: databases, caching, microservices, and more.",
    tags: ["System Design", "Distributed Systems", "Microservices", "Databases"],
    price: 199,
    certificateOffered: true,
    progress: 15,
    enrolledDate: "2025-01-20",
    lastAccessed: "2025-06-08",
    grade: 78,
    nextLessonId: "l-c3-1-4",
    sections: [
      {
        id: "s1",
        title: "Foundations of Scale",
        lessons: [
          { id: "l-c3-1-1", title: "Horizontal vs Vertical Scaling", duration: "20:30", type: "video", completed: true, locked: false },
          { id: "l-c3-1-2", title: "CAP Theorem", duration: "28:15", type: "video", completed: true, locked: false },
          { id: "l-c3-1-3", title: "Reading: Distributed Systems Primer", duration: "45:00", type: "reading", completed: false, locked: false },
          { id: "l-c3-1-4", title: "Load Balancing Strategies", duration: "32:10", type: "video", completed: false, locked: false },
          { id: "l-c3-1-5", title: "CDN & Edge Computing", duration: "24:45", type: "video", completed: false, locked: false },
        ],
      },
      {
        id: "s2",
        title: "Database Design at Scale",
        lessons: [
          { id: "l-c3-2-1", title: "SQL vs NoSQL Trade-offs", duration: "35:00", type: "video", completed: false, locked: true },
          { id: "l-c3-2-2", title: "Database Sharding", duration: "40:20", type: "video", completed: false, locked: true },
          { id: "l-c3-2-3", title: "Replication Patterns", duration: "28:15", type: "video", completed: false, locked: true },
          { id: "l-c3-2-4", title: "Lab: Design a URL Shortener", duration: "60:00", type: "assignment", completed: false, locked: true },
        ],
      },
      {
        id: "s3",
        title: "Microservices & Messaging",
        lessons: [
          { id: "l-c3-3-1", title: "Microservices Architecture", duration: "45:00", type: "video", completed: false, locked: true },
          { id: "l-c3-3-2", title: "Event-Driven Architecture", duration: "38:30", type: "video", completed: false, locked: true },
          { id: "l-c3-3-3", title: "Message Queues (Kafka, RabbitMQ)", duration: "42:00", type: "video", completed: false, locked: true },
          { id: "l-c3-3-4", title: "Service Mesh & API Gateway", duration: "30:15", type: "video", completed: false, locked: true },
        ],
      },
    ],
  },
  {
    id: "c4",
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Aisha Patel",
    instructorTitle: "AI Research Lead @ DeepMind",
    category: "Data Science",
    level: "Intermediate",
    totalDuration: "48h 20m",
    rating: 4.8,
    reviewCount: 4210,
    studentsCount: 35600,
    thumbnail: "🤖",
    thumbnailColor: "#10B981",
    description:
      "From linear regression to neural networks. Covers supervised and unsupervised learning, model evaluation, feature engineering, and practical implementation with Python, scikit-learn, and TensorFlow.",
    shortDesc: "Practical ML from regression to neural networks with Python and TensorFlow.",
    tags: ["Machine Learning", "Python", "TensorFlow", "scikit-learn", "Neural Networks"],
    price: 179,
    certificateOffered: true,
    progress: 0,
    enrolledDate: "2025-06-01",
    lastAccessed: "2025-06-01",
    nextLessonId: "l-c4-1-1",
    sections: [
      {
        id: "s1",
        title: "ML Foundations",
        lessons: [
          { id: "l-c4-1-1", title: "What is Machine Learning?", duration: "18:00", type: "video", completed: false, locked: false },
          { id: "l-c4-1-2", title: "Types of ML: Supervised, Unsupervised, RL", duration: "25:30", type: "video", completed: false, locked: false },
          { id: "l-c4-1-3", title: "The ML Pipeline", duration: "20:45", type: "video", completed: false, locked: false },
        ],
      },
      {
        id: "s2",
        title: "Supervised Learning",
        lessons: [
          { id: "l-c4-2-1", title: "Linear & Logistic Regression", duration: "42:00", type: "video", completed: false, locked: true },
          { id: "l-c4-2-2", title: "Decision Trees & Random Forests", duration: "38:15", type: "video", completed: false, locked: true },
          { id: "l-c4-2-3", title: "Support Vector Machines", duration: "35:40", type: "video", completed: false, locked: true },
          { id: "l-c4-2-4", title: "Lab: Predict House Prices", duration: "90:00", type: "assignment", completed: false, locked: true },
        ],
      },
    ],
  },
  {
    id: "c5",
    title: "Cybersecurity Fundamentals",
    instructor: "James Okafor",
    instructorTitle: "CISO @ Fortune 500",
    category: "Security",
    level: "Beginner",
    totalDuration: "22h 00m",
    rating: 4.7,
    reviewCount: 1890,
    studentsCount: 22100,
    thumbnail: "🔒",
    thumbnailColor: "#EF4444",
    description:
      "Essential cybersecurity knowledge for every professional. Covers threat modeling, network security, identity & access management, incident response, and compliance frameworks (SOC2, ISO 27001).",
    shortDesc: "Core cybersecurity skills: threats, IAM, incident response, and compliance.",
    tags: ["Cybersecurity", "Network Security", "IAM", "SOC2", "Compliance"],
    price: "Free",
    isMandatory: true,
    certificateOffered: true,
    progress: 100,
    enrolledDate: "2024-08-01",
    lastAccessed: "2025-02-28",
    grade: 96,
    nextLessonId: "l-c5-1-1",
    sections: [
      {
        id: "s1",
        title: "Threat Landscape",
        lessons: [
          { id: "l-c5-1-1", title: "Understanding Cyber Threats", duration: "16:30", type: "video", completed: true, locked: false },
          { id: "l-c5-1-2", title: "Social Engineering & Phishing", duration: "22:00", type: "video", completed: true, locked: false },
          { id: "l-c5-1-3", title: "Network Vulnerabilities", duration: "28:45", type: "video", completed: true, locked: false },
        ],
      },
      {
        id: "s2",
        title: "Identity & Access Management",
        lessons: [
          { id: "l-c5-2-1", title: "Authentication Methods", duration: "20:15", type: "video", completed: true, locked: false },
          { id: "l-c5-2-2", title: "Zero Trust Architecture", duration: "32:40", type: "video", completed: true, locked: false },
          { id: "l-c5-2-3", title: "Certification Exam", duration: "45:00", type: "quiz", completed: true, locked: false },
        ],
      },
    ],
  },
  {
    id: "c6",
    title: "Data Privacy & GDPR Compliance",
    instructor: "Dr. Elena Vasquez",
    instructorTitle: "DPO Specialist",
    category: "Compliance",
    level: "Beginner",
    totalDuration: "12h 00m",
    rating: 4.6,
    reviewCount: 982,
    studentsCount: 15400,
    thumbnail: "📋",
    thumbnailColor: "#F59E0B",
    description:
      "Mandatory compliance training on GDPR, CCPA, and data handling best practices. Covers data subject rights, breach notification requirements, and organizational policies.",
    shortDesc: "Mandatory GDPR & data privacy compliance for all employees.",
    tags: ["GDPR", "CCPA", "Compliance", "Data Privacy"],
    price: "Free",
    isMandatory: true,
    certificateOffered: true,
    progress: 60,
    enrolledDate: "2025-04-01",
    lastAccessed: "2025-06-05",
    grade: 82,
    nextLessonId: "l-c6-2-1",
    sections: [
      {
        id: "s1",
        title: "GDPR Foundations",
        lessons: [
          { id: "l-c6-1-1", title: "What is GDPR?", duration: "18:20", type: "video", completed: true, locked: false },
          { id: "l-c6-1-2", title: "Data Subject Rights", duration: "24:15", type: "video", completed: true, locked: false },
          { id: "l-c6-1-3", title: "Lawful Basis for Processing", duration: "20:00", type: "video", completed: true, locked: false },
        ],
      },
      {
        id: "s2",
        title: "Organizational Compliance",
        lessons: [
          { id: "l-c6-2-1", title: "Data Mapping & Inventory", duration: "28:30", type: "video", completed: false, locked: false },
          { id: "l-c6-2-2", title: "Breach Notification Process", duration: "22:10", type: "video", completed: false, locked: false },
          { id: "l-c6-2-3", title: "Compliance Assessment Exam", duration: "30:00", type: "quiz", completed: false, locked: false },
        ],
      },
    ],
  },
  {
    id: "c7",
    title: "Product Management Fundamentals",
    instructor: "Ryan Park",
    instructorTitle: "VP Product @ Shopify",
    category: "Product",
    level: "Beginner",
    totalDuration: "30h 45m",
    rating: 4.8,
    reviewCount: 3421,
    studentsCount: 29800,
    thumbnail: "📱",
    thumbnailColor: "#EC4899",
    description:
      "Learn the complete PM toolkit: user research, product discovery, prioritization frameworks (RICE, ICE), roadmapping, A/B testing, metrics, and stakeholder communication.",
    shortDesc: "Full PM toolkit: discovery, prioritization, roadmaps, and metrics.",
    tags: ["Product Management", "User Research", "Roadmapping", "A/B Testing"],
    price: 129,
    certificateOffered: true,
    sections: [],
  },
  {
    id: "c8",
    title: "Leadership & Management Excellence",
    instructor: "Dr. Monica Shah",
    instructorTitle: "Executive Coach & Author",
    category: "Leadership",
    level: "Intermediate",
    totalDuration: "24h 15m",
    rating: 4.7,
    reviewCount: 2150,
    studentsCount: 18900,
    thumbnail: "🎯",
    thumbnailColor: "#F97316",
    description:
      "Develop the skills to lead high-performing teams: communication, conflict resolution, performance management, coaching, and building inclusive team cultures.",
    shortDesc: "Lead with impact: team building, coaching, performance management.",
    tags: ["Leadership", "Management", "Communication", "Team Building"],
    price: 99,
    isMandatory: false,
    certificateOffered: true,
    sections: [],
  },
  {
    id: "c9",
    title: "UX Design & Research",
    instructor: "Chloe Martin",
    instructorTitle: "Lead Designer @ Airbnb",
    category: "Design",
    level: "Beginner",
    totalDuration: "36h 30m",
    rating: 4.9,
    reviewCount: 4820,
    studentsCount: 37500,
    thumbnail: "🎨",
    thumbnailColor: "#14B8A6",
    description:
      "A comprehensive UX course covering the full design process: research methods, personas, journey mapping, wireframing, prototyping in Figma, usability testing, and design systems.",
    shortDesc: "Full UX process: research, Figma prototyping, and usability testing.",
    tags: ["UX Design", "Figma", "User Research", "Prototyping", "Design Systems"],
    price: 139,
    certificateOffered: true,
    sections: [],
  },
  {
    id: "c10",
    title: "Cloud Architecture on AWS",
    instructor: "David Liu",
    instructorTitle: "AWS Solutions Architect",
    category: "Engineering",
    level: "Advanced",
    totalDuration: "60h 00m",
    rating: 4.8,
    reviewCount: 3980,
    studentsCount: 32400,
    thumbnail: "☁️",
    thumbnailColor: "#F59E0B",
    description:
      "Architect and deploy cloud-native applications on AWS. Covers VPC, IAM, EC2, S3, RDS, Lambda, ECS, CloudFormation, and preparation for the AWS Solutions Architect Professional exam.",
    shortDesc: "AWS architecture: from VPC to serverless, with SAP exam prep.",
    tags: ["AWS", "Cloud", "Lambda", "Serverless", "CloudFormation"],
    price: 189,
    certificateOffered: true,
    sections: [],
  },
  {
    id: "c11",
    title: "Data Analysis with Python & SQL",
    instructor: "Nina Torres",
    instructorTitle: "Senior Data Analyst @ Airbnb",
    category: "Data Science",
    level: "Beginner",
    totalDuration: "26h 40m",
    rating: 4.8,
    reviewCount: 5690,
    studentsCount: 48200,
    thumbnail: "📊",
    thumbnailColor: "#3B82F6",
    description:
      "Learn data analysis from scratch using Python (pandas, NumPy, matplotlib) and SQL. Build real-world dashboards, clean messy datasets, and derive actionable insights.",
    shortDesc: "Data analysis with Python, pandas, SQL, and visualization libraries.",
    tags: ["Python", "SQL", "pandas", "Data Analysis", "Visualization"],
    price: 109,
    certificateOffered: true,
    sections: [],
  },
  {
    id: "c12",
    title: "Diversity, Equity & Inclusion in the Workplace",
    instructor: "Keisha Thompson",
    instructorTitle: "Chief People Officer",
    category: "Compliance",
    level: "Beginner",
    totalDuration: "8h 00m",
    rating: 4.5,
    reviewCount: 720,
    studentsCount: 12300,
    thumbnail: "🤝",
    thumbnailColor: "#8B5CF6",
    description:
      "Mandatory DEI training covering unconscious bias, inclusive language, psychological safety, and building equitable team practices.",
    shortDesc: "Mandatory DEI training: bias, inclusion, and equitable practices.",
    tags: ["DEI", "Inclusion", "Diversity", "Workplace Culture"],
    price: "Free",
    isMandatory: true,
    certificateOffered: true,
    progress: 100,
    enrolledDate: "2024-07-01",
    lastAccessed: "2024-09-15",
    grade: 100,
    nextLessonId: "",
    sections: [],
  },
]

// ─── Learning Paths ───────────────────────────────────────────────────────────

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "lp1",
    title: "Full-Stack Web Development",
    description:
      "Become a job-ready full-stack developer with React, Node.js, databases, and cloud deployment. Includes 5 guided projects and a portfolio-ready capstone.",
    category: "Engineering",
    courseIds: ["c1", "c2", "c10"],
    skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    estimatedHours: 130,
    progress: 48,
    isMandatory: false,
    thumbnail: "💻",
    color: "#3B82F6",
    enrolledCount: 14200,
    level: "Intermediate",
  },
  {
    id: "lp2",
    title: "Security & Compliance Certification",
    description:
      "Mandatory compliance track for all employees. Complete cybersecurity fundamentals, GDPR, and DEI training to maintain your compliance status.",
    category: "Compliance",
    courseIds: ["c5", "c6", "c12"],
    skills: ["Cybersecurity", "GDPR", "Data Privacy", "DEI", "SOC2"],
    estimatedHours: 42,
    progress: 85,
    isMandatory: true,
    mandatoryDeadline: "2025-06-30",
    thumbnail: "🛡️",
    color: "#EF4444",
    enrolledCount: 8900,
    level: "Beginner",
  },
  {
    id: "lp3",
    title: "Data Science & AI Track",
    description:
      "End-to-end data science curriculum from analysis to machine learning to AI deployment. Ideal for engineers transitioning to data roles.",
    category: "Data Science",
    courseIds: ["c11", "c4"],
    skills: ["Python", "SQL", "Machine Learning", "TensorFlow", "Data Analysis"],
    estimatedHours: 75,
    progress: 10,
    isMandatory: false,
    thumbnail: "📈",
    color: "#10B981",
    enrolledCount: 9800,
    level: "Intermediate",
  },
  {
    id: "lp4",
    title: "Engineering Leadership",
    description:
      "Transition from individual contributor to engineering leader. Covers people management, system design, product thinking, and executive communication.",
    category: "Leadership",
    courseIds: ["c8", "c3", "c7"],
    skills: ["Leadership", "System Design", "Product Strategy", "Communication", "Team Building"],
    estimatedHours: 110,
    progress: 0,
    isMandatory: false,
    thumbnail: "🚀",
    color: "#F97316",
    enrolledCount: 5600,
    level: "Advanced",
  },
]

// ─── Assignments ──────────────────────────────────────────────────────────────

export const ASSIGNMENTS: Assignment[] = [
  {
    id: "a1",
    courseId: "c1",
    courseName: "React & Next.js Masterclass",
    title: "Build a Blog App with App Router",
    description:
      "Create a full-featured blog application using Next.js App Router. The app must include dynamic routing, server-side data fetching, and authentication.",
    dueDate: "2025-06-20",
    status: "pending",
    maxGrade: 100,
    type: "project",
    attachments: ["starter-code.zip", "requirements.pdf"],
  },
  {
    id: "a2",
    courseId: "c2",
    courseName: "TypeScript for Professional Developers",
    title: "Type-Safe REST API Client",
    description:
      "Implement a fully typed REST API client for a given OpenAPI specification using TypeScript generics, conditional types, and template literal types.",
    dueDate: "2025-06-25",
    status: "submitted",
    submittedDate: "2025-06-10",
    maxGrade: 100,
    type: "project",
    attachments: ["api-spec.yaml"],
    feedback: "Good use of generics. Consider using discriminated unions for the error types.",
  },
  {
    id: "a3",
    courseId: "c3",
    courseName: "System Design for Engineers",
    title: "Design a Real-Time Chat System",
    description:
      "Design a scalable real-time chat system supporting 1M concurrent users. Provide architecture diagrams, data models, API contracts, and capacity estimates.",
    dueDate: "2025-06-15",
    submittedDate: "2025-06-14",
    status: "graded",
    grade: 88,
    maxGrade: 100,
    type: "report",
    feedback:
      "Strong architecture. WebSocket handling was well thought out. Missing: read receipts system and message persistence strategy. Good capacity estimates.",
  },
  {
    id: "a4",
    courseId: "c6",
    courseName: "Data Privacy & GDPR Compliance",
    title: "Data Privacy Impact Assessment",
    description:
      "Conduct a Data Protection Impact Assessment (DPIA) for a hypothetical SaaS product. Identify data flows, risks, and mitigation strategies.",
    dueDate: "2025-07-01",
    status: "pending",
    maxGrade: 100,
    type: "report",
  },
  {
    id: "a5",
    courseId: "c1",
    courseName: "React & Next.js Masterclass",
    title: "Performance Optimization Report",
    description:
      "Analyze and optimize a provided Next.js app. Document your findings, changes made, and measurable improvements in Core Web Vitals.",
    dueDate: "2025-05-30",
    submittedDate: "2025-05-28",
    status: "graded",
    grade: 94,
    maxGrade: 100,
    type: "report",
    feedback: "Excellent analysis. Lighthouse scores improved significantly. Well-documented with before/after metrics.",
  },
  {
    id: "a6",
    courseId: "c3",
    courseName: "System Design for Engineers",
    title: "Design a URL Shortener",
    description:
      "Design a URL shortening service (like bit.ly) with 100M URLs, read-heavy workload, and analytics tracking.",
    dueDate: "2025-05-15",
    submittedDate: "2025-05-13",
    status: "graded",
    grade: 78,
    maxGrade: 100,
    type: "report",
    feedback: "Good base design. The caching layer was well implemented. Consider bloom filters for URL existence checks.",
  },
  {
    id: "a7",
    courseId: "c2",
    courseName: "TypeScript for Professional Developers",
    title: "Implement a State Machine with TypeScript",
    description:
      "Build a type-safe finite state machine library using TypeScript's advanced type features.",
    dueDate: "2025-06-18",
    status: "pending",
    maxGrade: 100,
    type: "project",
  },
  {
    id: "a8",
    courseId: "c4",
    courseName: "Machine Learning Fundamentals",
    title: "House Price Prediction Model",
    description:
      "Build, train, and evaluate a regression model to predict house prices using the provided dataset. Submit a Jupyter notebook with full analysis.",
    dueDate: "2025-07-10",
    status: "pending",
    maxGrade: 100,
    type: "practical",
    attachments: ["housing-dataset.csv"],
  },
]

// ─── Quizzes ──────────────────────────────────────────────────────────────────

export const QUIZZES: Quiz[] = [
  {
    id: "q1",
    courseId: "c1",
    courseName: "React & Next.js Masterclass",
    title: "Module 1: React 19 Foundations",
    description: "Test your understanding of React 19 fundamentals, hooks, and component patterns.",
    timeLimit: 20,
    attempts: 1,
    maxAttempts: 3,
    bestScore: 85,
    passingScore: 70,
    status: "completed",
    questions: [
      {
        id: "qq1",
        question: "Which hook is used to run side effects in a React component?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctIndex: 1,
      },
      {
        id: "qq2",
        question: "What is the primary advantage of Server Components in Next.js?",
        options: [
          "They allow client-side interactivity",
          "They reduce JavaScript bundle size by running on the server",
          "They replace the need for hooks",
          "They automatically cache all database queries",
        ],
        correctIndex: 1,
      },
      {
        id: "qq3",
        question: "What does the 'use client' directive do in Next.js?",
        options: [
          "Marks the component for client-side only rendering",
          "Enables server-side caching",
          "Disables hydration for the component",
          "Forces static generation",
        ],
        correctIndex: 0,
      },
      {
        id: "qq4",
        question: "Which of the following is NOT a React 19 feature?",
        options: ["use() hook", "Server Actions", "Concurrent Mode", "useFormStatus"],
        correctIndex: 2,
      },
      {
        id: "qq5",
        question: "What is the correct way to create a context in React?",
        options: [
          "React.makeContext()",
          "React.createContext()",
          "useContext(null)",
          "createProvider()",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "q2",
    courseId: "c1",
    courseName: "React & Next.js Masterclass",
    title: "Module 2: App Router Architecture",
    description: "Questions on App Router, layouts, loading states, and server vs client components.",
    timeLimit: 25,
    attempts: 0,
    maxAttempts: 2,
    passingScore: 75,
    status: "available",
    dueDate: "2025-06-30",
    questions: [
      {
        id: "qq6",
        question: "In Next.js App Router, what file defines a shared UI for a route segment?",
        options: ["page.tsx", "layout.tsx", "template.tsx", "route.tsx"],
        correctIndex: 1,
      },
      {
        id: "qq7",
        question: "What does loading.tsx do in App Router?",
        options: [
          "Defines a loading spinner for static pages",
          "Creates an instant loading UI shown while content streams in",
          "Replaces error.tsx when data is loading",
          "Enables lazy loading for all images",
        ],
        correctIndex: 1,
      },
      {
        id: "qq8",
        question: "How do you pass data from a Server Component to a Client Component?",
        options: [
          "Using global state",
          "Through component props serialized to JSON",
          "Via Context API",
          "Through window.__SERVER_DATA__",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "q3",
    courseId: "c2",
    courseName: "TypeScript for Professional Developers",
    title: "Generics Deep Dive",
    description: "Advanced quiz on TypeScript generics, constraints, and conditional types.",
    timeLimit: 30,
    attempts: 2,
    maxAttempts: 3,
    bestScore: 92,
    passingScore: 75,
    status: "completed",
    questions: [
      {
        id: "qq9",
        question: "What does the 'extends' keyword do in a generic constraint?",
        options: [
          "Creates inheritance",
          "Restricts the type parameter to a subset of types",
          "Checks runtime type",
          "Defines optional parameters",
        ],
        correctIndex: 1,
      },
      {
        id: "qq10",
        question: "What is the result type of: type IsString<T> = T extends string ? 'yes' : 'no'?",
        options: [
          "A conditional type",
          "A mapped type",
          "A union type",
          "An intersection type",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "q4",
    courseId: "c5",
    courseName: "Cybersecurity Fundamentals",
    title: "Final Certification Exam",
    description: "Comprehensive exam covering all cybersecurity topics. Minimum 80% required for certificate.",
    timeLimit: 45,
    attempts: 1,
    maxAttempts: 1,
    bestScore: 96,
    passingScore: 80,
    status: "completed",
    questions: [],
  },
  {
    id: "q5",
    courseId: "c6",
    courseName: "Data Privacy & GDPR Compliance",
    title: "GDPR Compliance Assessment",
    description: "Test your knowledge of GDPR requirements, data subject rights, and organizational obligations.",
    timeLimit: 30,
    attempts: 0,
    maxAttempts: 2,
    passingScore: 80,
    status: "available",
    dueDate: "2025-07-01",
    questions: [
      {
        id: "qq11",
        question: "Under GDPR, what is the maximum timeframe to notify a data breach to the supervisory authority?",
        options: ["24 hours", "48 hours", "72 hours", "7 days"],
        correctIndex: 2,
      },
      {
        id: "qq12",
        question: "Which of the following is a lawful basis for processing personal data under GDPR?",
        options: [
          "Business interest",
          "Legitimate interest",
          "Corporate mandate",
          "Technical necessity",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "q6",
    courseId: "c3",
    courseName: "System Design for Engineers",
    title: "CAP Theorem & Distributed Systems",
    description: "Questions on CAP theorem, consistency models, and distributed system trade-offs.",
    timeLimit: 25,
    attempts: 0,
    maxAttempts: 3,
    passingScore: 70,
    status: "locked",
    questions: [],
  },
]

// ─── Certificates ─────────────────────────────────────────────────────────────

export const CERTIFICATES: Certificate[] = [
  {
    id: "cert1",
    courseId: "c5",
    courseName: "Cybersecurity Fundamentals",
    instructorName: "James Okafor",
    issuedDate: "2025-03-01",
    expiryDate: "2027-03-01",
    credentialId: "LF-SEC-2025-A4X9B1",
    skills: ["Threat Modeling", "Network Security", "IAM", "Zero Trust", "Incident Response"],
    category: "Security",
    thumbnail: "🔒",
    thumbnailColor: "#EF4444",
    verificationUrl: "https://learnflow.io/verify/LF-SEC-2025-A4X9B1",
    grade: 96,
  },
  {
    id: "cert2",
    courseId: "c12",
    courseName: "Diversity, Equity & Inclusion",
    instructorName: "Keisha Thompson",
    issuedDate: "2024-09-15",
    credentialId: "LF-DEI-2024-H7M2C8",
    skills: ["Inclusive Leadership", "Unconscious Bias", "Equitable Practices"],
    category: "Compliance",
    thumbnail: "🤝",
    thumbnailColor: "#8B5CF6",
    verificationUrl: "https://learnflow.io/verify/LF-DEI-2024-H7M2C8",
    grade: 100,
  },
  {
    id: "cert3",
    courseId: "c1",
    courseName: "React Foundations (Module 1)",
    instructorName: "Sarah Chen",
    issuedDate: "2025-01-10",
    credentialId: "LF-REACT-2025-R3N8K5",
    skills: ["React 19", "Hooks", "Component Design", "State Management"],
    category: "Engineering",
    thumbnail: "⚛️",
    thumbnailColor: "#3B82F6",
    verificationUrl: "https://learnflow.io/verify/LF-REACT-2025-R3N8K5",
    grade: 87,
  },
]

// ─── Discussions ──────────────────────────────────────────────────────────────

export const DISCUSSIONS: DiscussionThread[] = [
  {
    id: "d1",
    courseId: "c1",
    courseName: "React & Next.js Masterclass",
    title: "Server Components vs getServerSideProps — when to use what?",
    body: "I'm confused about when to use React Server Components vs the old getServerSideProps pattern. Can someone clarify with a real-world example?",
    author: "Alex Johnson",
    authorAvatar: "AJ",
    authorRole: "student",
    createdAt: "2025-06-10",
    replies: 14,
    views: 342,
    isPinned: false,
    isSolved: true,
    tags: ["server-components", "ssr", "architecture"],
    lastReplyAt: "2025-06-11",
    lastReplyBy: "Sarah Chen (Instructor)",
  },
  {
    id: "d2",
    courseId: "c1",
    courseName: "React & Next.js Masterclass",
    title: "📌 Welcome & Course Resources",
    body: "Welcome to the course! Find all starter files, course slides, and the Discord community link here.",
    author: "Sarah Chen",
    authorAvatar: "SC",
    authorRole: "instructor",
    createdAt: "2024-09-01",
    replies: 89,
    views: 4210,
    isPinned: true,
    isSolved: false,
    tags: ["welcome", "resources"],
    lastReplyAt: "2025-06-09",
    lastReplyBy: "Taylor Reid",
  },
  {
    id: "d3",
    courseId: "c2",
    courseName: "TypeScript for Professional Developers",
    title: "How do mapped types differ from index signatures?",
    body: "I understand mapped types iterate over keys, but I'm struggling to see the practical difference from index signatures. Looking for examples.",
    author: "Alex Johnson",
    authorAvatar: "AJ",
    authorRole: "student",
    createdAt: "2025-06-08",
    replies: 5,
    views: 128,
    isPinned: false,
    isSolved: false,
    tags: ["mapped-types", "index-signatures"],
    lastReplyAt: "2025-06-09",
    lastReplyBy: "Marcus Webb (Instructor)",
  },
  {
    id: "d4",
    courseId: "c3",
    courseName: "System Design for Engineers",
    title: "Feedback on my URL Shortener design — peer review",
    body: "Sharing my URL shortener design for peer feedback before submission. Would love critiques on my database choice and caching strategy.",
    author: "Jordan Lee",
    authorAvatar: "JL",
    authorRole: "student",
    createdAt: "2025-06-07",
    replies: 22,
    views: 415,
    isPinned: false,
    isSolved: false,
    tags: ["peer-review", "assignment", "url-shortener"],
    lastReplyAt: "2025-06-10",
    lastReplyBy: "Alex Johnson",
  },
  {
    id: "d5",
    courseId: "c1",
    courseName: "React & Next.js Masterclass",
    title: "Turbopack vs Webpack — should I switch?",
    body: "The course mentions Turbopack is now stable in Next.js 15. Has anyone migrated? Any gotchas to watch out for?",
    author: "Sam Rivera",
    authorAvatar: "SR",
    authorRole: "student",
    createdAt: "2025-06-06",
    replies: 11,
    views: 267,
    isPinned: false,
    isSolved: true,
    tags: ["turbopack", "webpack", "build-tools"],
    lastReplyAt: "2025-06-08",
    lastReplyBy: "Sarah Chen (Instructor)",
  },
  {
    id: "d6",
    courseId: "c6",
    courseName: "Data Privacy & GDPR Compliance",
    title: "Is cookie consent required for analytics-only tracking?",
    body: "Our team uses anonymous analytics. Does GDPR still require a consent banner if no personal data is technically stored?",
    author: "Alex Johnson",
    authorAvatar: "AJ",
    authorRole: "student",
    createdAt: "2025-06-04",
    replies: 7,
    views: 189,
    isPinned: false,
    isSolved: true,
    tags: ["cookies", "analytics", "consent"],
    lastReplyAt: "2025-06-05",
    lastReplyBy: "Dr. Elena Vasquez (Instructor)",
  },
]

// ─── Schedule Events ──────────────────────────────────────────────────────────

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    id: "se1",
    type: "live-session",
    title: "Live Q&A: Server Components Deep Dive",
    courseId: "c1",
    courseName: "React & Next.js Masterclass",
    date: "2025-06-12",
    startTime: "14:00",
    endTime: "15:30",
    description: "Office hours with Sarah Chen covering Server Components and streaming patterns.",
    meetLink: "https://meet.google.com/abc-defg-hij",
    status: "today",
    color: "#3B82F6",
  },
  {
    id: "se2",
    type: "assignment-due",
    title: "Design a Real-Time Chat System — Due",
    courseId: "c3",
    courseName: "System Design for Engineers",
    date: "2025-06-15",
    startTime: "23:59",
    endTime: "23:59",
    status: "upcoming",
    color: "#F59E0B",
  },
  {
    id: "se3",
    type: "quiz",
    title: "Module 2: App Router Quiz",
    courseId: "c1",
    courseName: "React & Next.js Masterclass",
    date: "2025-06-17",
    startTime: "10:00",
    endTime: "10:25",
    description: "Timed quiz. 3 attempts available. Open from June 17–30.",
    status: "upcoming",
    color: "#8B5CF6",
  },
  {
    id: "se4",
    type: "live-session",
    title: "TypeScript Office Hours",
    courseId: "c2",
    courseName: "TypeScript for Professional Developers",
    date: "2025-06-13",
    startTime: "16:00",
    endTime: "17:00",
    description: "Weekly office hours with Marcus Webb.",
    meetLink: "https://zoom.us/j/123456789",
    status: "upcoming",
    color: "#2563EB",
  },
  {
    id: "se5",
    type: "assignment-due",
    title: "Build a Blog App — Due",
    courseId: "c1",
    courseName: "React & Next.js Masterclass",
    date: "2025-06-20",
    startTime: "23:59",
    endTime: "23:59",
    status: "upcoming",
    color: "#F59E0B",
  },
  {
    id: "se6",
    type: "assignment-due",
    title: "Type-Safe API Client — Due",
    courseId: "c2",
    courseName: "TypeScript for Professional Developers",
    date: "2025-06-25",
    startTime: "23:59",
    endTime: "23:59",
    status: "upcoming",
    color: "#F59E0B",
  },
  {
    id: "se7",
    type: "workshop",
    title: "Study Group: System Design Patterns",
    courseId: "c3",
    courseName: "System Design for Engineers",
    date: "2025-06-14",
    startTime: "11:00",
    endTime: "12:30",
    description: "Student-led study group for the database design module.",
    status: "upcoming",
    color: "#8B5CF6",
  },
  {
    id: "se8",
    type: "live-session",
    title: "ML Kickoff: Course Introduction",
    courseId: "c4",
    courseName: "Machine Learning Fundamentals",
    date: "2025-06-16",
    startTime: "09:00",
    endTime: "10:00",
    description: "Orientation session with Dr. Patel. Q&A about course expectations.",
    meetLink: "https://meet.google.com/xyz-uvwx-yz",
    status: "upcoming",
    color: "#10B981",
  },
  {
    id: "se9",
    type: "assignment-due",
    title: "Implement a State Machine — Due",
    courseId: "c2",
    courseName: "TypeScript for Professional Developers",
    date: "2025-06-18",
    startTime: "23:59",
    endTime: "23:59",
    status: "upcoming",
    color: "#F59E0B",
  },
  {
    id: "se10",
    type: "exam",
    title: "GDPR Compliance Assessment",
    courseId: "c6",
    courseName: "Data Privacy & GDPR Compliance",
    date: "2025-06-19",
    startTime: "13:00",
    endTime: "13:30",
    description: "Final compliance exam. Minimum 80% required to receive certificate.",
    status: "upcoming",
    color: "#F97316",
  },
]

// ─── Student Profile ──────────────────────────────────────────────────────────

export const STUDENT_PROFILE = {
  id: "stu-001",
  name: "Alex Johnson",
  email: "alex.johnson@techcorp.com",
  avatar: "AJ",
  role: "student" as const,
  plan: "Enterprise Pro",
  institution: "TechCorp Inc.",
  department: "Engineering",
  jobTitle: "Software Engineer II",
  manager: "Linda Park",
  timezone: "America/New_York",
  language: "English",
  joinedDate: "2024-07-01",
  bio: "Software engineer passionate about frontend development, distributed systems, and continuous learning.",
  linkedIn: "linkedin.com/in/alexjohnson",
  github: "github.com/alexj",
  website: "",
  learningGoal: "Become a senior full-stack engineer and pass AWS Solutions Architect by Q4 2025.",
  weeklyGoal: 8, // hours
  streak: 7,
  totalHours: 48,
  xp: 4200,
  level: 12,
  xpToNextLevel: 800,
  stats: {
    enrolled: 6,
    completed: 2,
    inProgress: 4,
    certificates: 3,
    streak: 7,
    totalHours: 48,
    avgScore: 90.2,
    assignmentsSubmitted: 5,
    quizzesPassed: 3,
  },
}
