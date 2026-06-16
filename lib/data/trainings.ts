import { Shield, GraduationCap, Briefcase, BookOpen } from "lucide-react"

export interface TrainingModule {
  id: string
  title: string
  duration: string
  type: "course" | "quiz" | "assessment"
  completed: boolean
}

export interface TrainingTrack {
  id: string
  title: string
  type: "enterprise" | "academic"
  category: "Technical" | "Compliance" | "Soft Skills"
  icon: string
  description: string
  courses: number
  totalHours: number
  completed: number
  isMandatory: boolean
  deadline: string | null
  progress: number
  level: string
  enrolledUsers: number
  badge: string
  badgeColor: string
  // Whether the learner has actually enrolled in this track. Mandatory
  // tracks are auto-enrolled for everyone; others need to be started first.
  enrolled: boolean
  modules: TrainingModule[]
}

export const TRAINING_TRACKS: TrainingTrack[] = [
  {
    id: "tt1",
    title: "Software Engineering Excellence",
    type: "enterprise",
    category: "Technical",
    icon: "💻",
    description: "Core technical skills required for all engineers: architecture, testing, code quality, and performance optimization.",
    courses: 8,
    totalHours: 42,
    completed: 5,
    isMandatory: false,
    deadline: null,
    progress: 62,
    level: "Intermediate",
    enrolledUsers: 1240,
    badge: "Engineering Pro",
    badgeColor: "#3B82F6",
    enrolled: true,
    modules: [
      { id: "tt1-m1", title: "Software Architecture Fundamentals", duration: "5h", type: "course", completed: true },
      { id: "tt1-m2", title: "Clean Code & Code Review Practices", duration: "4h", type: "course", completed: true },
      { id: "tt1-m3", title: "Unit & Integration Testing", duration: "6h", type: "course", completed: true },
      { id: "tt1-m4", title: "Test-Driven Development", duration: "5h", type: "course", completed: true },
      { id: "tt1-m5", title: "Performance Profiling & Optimization", duration: "5h", type: "course", completed: true },
      { id: "tt1-m6", title: "Design Patterns in Practice", duration: "6h", type: "course", completed: false },
      { id: "tt1-m7", title: "Scalable System Architecture", duration: "7h", type: "course", completed: false },
      { id: "tt1-m8", title: "Capstone: Architecture Review", duration: "4h", type: "assessment", completed: false },
    ],
  },
  {
    id: "tt2",
    title: "Information Security Awareness",
    type: "enterprise",
    category: "Compliance",
    icon: "🔐",
    description: "Mandatory annual security training covering phishing, data handling, access control, and incident reporting.",
    courses: 5,
    totalHours: 12,
    completed: 5,
    isMandatory: true,
    deadline: "2026-06-30",
    progress: 100,
    level: "All Levels",
    enrolledUsers: 4500,
    badge: "Security Certified",
    badgeColor: "#10B981",
    enrolled: true,
    modules: [
      { id: "tt2-m1", title: "Phishing & Social Engineering Awareness", duration: "2h", type: "course", completed: true },
      { id: "tt2-m2", title: "Password & Access Management", duration: "2h", type: "course", completed: true },
      { id: "tt2-m3", title: "Data Handling & Classification", duration: "3h", type: "course", completed: true },
      { id: "tt2-m4", title: "Incident Reporting Procedures", duration: "2h", type: "course", completed: true },
      { id: "tt2-m5", title: "Annual Security Certification Exam", duration: "3h", type: "assessment", completed: true },
    ],
  },
  {
    id: "tt3",
    title: "Data Privacy & GDPR",
    type: "enterprise",
    category: "Compliance",
    icon: "📋",
    description: "GDPR compliance requirements for all employees handling EU customer data. Certification required by Q2.",
    courses: 4,
    totalHours: 8,
    completed: 2,
    isMandatory: true,
    deadline: "2026-07-15",
    progress: 50,
    level: "All Levels",
    enrolledUsers: 3800,
    badge: "GDPR Compliant",
    badgeColor: "#8B5CF6",
    enrolled: true,
    modules: [
      { id: "tt3-m1", title: "GDPR Fundamentals", duration: "2h", type: "course", completed: true },
      { id: "tt3-m2", title: "Data Subject Rights & Requests", duration: "2h", type: "course", completed: true },
      { id: "tt3-m3", title: "Breach Notification & Response", duration: "2h", type: "course", completed: false },
      { id: "tt3-m4", title: "GDPR Compliance Assessment", duration: "2h", type: "assessment", completed: false },
    ],
  },
  {
    id: "tt4",
    title: "Leadership & Management Fundamentals",
    type: "enterprise",
    category: "Soft Skills",
    icon: "🧑‍💼",
    description: "Designed for senior ICs and managers: delegation, feedback, conflict resolution, and team performance.",
    courses: 6,
    totalHours: 24,
    completed: 1,
    isMandatory: false,
    deadline: null,
    progress: 17,
    level: "Advanced",
    enrolledUsers: 620,
    badge: "Leadership Ready",
    badgeColor: "#F59E0B",
    enrolled: true,
    modules: [
      { id: "tt4-m1", title: "Foundations of People Leadership", duration: "4h", type: "course", completed: true },
      { id: "tt4-m2", title: "Delegation & Accountability", duration: "4h", type: "course", completed: false },
      { id: "tt4-m3", title: "Giving & Receiving Feedback", duration: "3h", type: "course", completed: false },
      { id: "tt4-m4", title: "Conflict Resolution Strategies", duration: "4h", type: "course", completed: false },
      { id: "tt4-m5", title: "Performance Management Essentials", duration: "5h", type: "course", completed: false },
      { id: "tt4-m6", title: "Leading High-Performing Teams", duration: "4h", type: "course", completed: false },
    ],
  },
  {
    id: "tt5",
    title: "Frontend Web Development",
    type: "academic",
    category: "Technical",
    icon: "⚛️",
    description: "Comprehensive curriculum from HTML/CSS basics to advanced React, TypeScript, and modern build tooling.",
    courses: 12,
    totalHours: 68,
    completed: 9,
    isMandatory: false,
    deadline: null,
    progress: 75,
    level: "Beginner to Advanced",
    enrolledUsers: 2340,
    badge: "Frontend Dev",
    badgeColor: "#3B82F6",
    enrolled: true,
    modules: [
      { id: "tt5-m1", title: "HTML & Semantic Markup", duration: "4h", type: "course", completed: true },
      { id: "tt5-m2", title: "CSS Layout & Responsive Design", duration: "6h", type: "course", completed: true },
      { id: "tt5-m3", title: "JavaScript Fundamentals", duration: "8h", type: "course", completed: true },
      { id: "tt5-m4", title: "DOM & Browser APIs", duration: "5h", type: "course", completed: true },
      { id: "tt5-m5", title: "Introduction to React", duration: "6h", type: "course", completed: true },
      { id: "tt5-m6", title: "React Hooks & State Management", duration: "6h", type: "course", completed: true },
      { id: "tt5-m7", title: "TypeScript for Frontend Engineers", duration: "6h", type: "course", completed: true },
      { id: "tt5-m8", title: "Component Design Systems", duration: "5h", type: "course", completed: true },
      { id: "tt5-m9", title: "Frontend Testing & Debugging", duration: "5h", type: "course", completed: true },
      { id: "tt5-m10", title: "Next.js & Server Components", duration: "7h", type: "course", completed: false },
      { id: "tt5-m11", title: "Build Tooling & Performance", duration: "5h", type: "course", completed: false },
      { id: "tt5-m12", title: "Capstone: Production Web App", duration: "5h", type: "assessment", completed: false },
    ],
  },
  {
    id: "tt6",
    title: "Cloud & Infrastructure",
    type: "academic",
    category: "Technical",
    icon: "☁️",
    description: "AWS, Azure, and GCP fundamentals plus Kubernetes, Terraform, and monitoring with real lab environments.",
    courses: 10,
    totalHours: 55,
    completed: 3,
    isMandatory: false,
    deadline: null,
    progress: 30,
    level: "Intermediate",
    enrolledUsers: 1890,
    badge: "Cloud Practitioner",
    badgeColor: "#06B6D4",
    enrolled: true,
    modules: [
      { id: "tt6-m1", title: "Cloud Computing Fundamentals", duration: "4h", type: "course", completed: true },
      { id: "tt6-m2", title: "AWS Core Services", duration: "6h", type: "course", completed: true },
      { id: "tt6-m3", title: "Networking & VPC Design", duration: "5h", type: "course", completed: true },
      { id: "tt6-m4", title: "Azure Fundamentals", duration: "5h", type: "course", completed: false },
      { id: "tt6-m5", title: "GCP Fundamentals", duration: "5h", type: "course", completed: false },
      { id: "tt6-m6", title: "Infrastructure as Code with Terraform", duration: "6h", type: "course", completed: false },
      { id: "tt6-m7", title: "Kubernetes Fundamentals", duration: "7h", type: "course", completed: false },
      { id: "tt6-m8", title: "Container Orchestration at Scale", duration: "6h", type: "course", completed: false },
      { id: "tt6-m9", title: "Monitoring & Observability", duration: "5h", type: "course", completed: false },
      { id: "tt6-m10", title: "Capstone: Multi-Cloud Deployment", duration: "6h", type: "assessment", completed: false },
    ],
  },
  {
    id: "tt7",
    title: "Anti-Harassment & Workplace Ethics",
    type: "enterprise",
    category: "Compliance",
    icon: "🤝",
    description: "Annual mandatory training on workplace respect, discrimination prevention, and reporting procedures.",
    courses: 3,
    totalHours: 6,
    completed: 3,
    isMandatory: true,
    deadline: "2026-08-01",
    progress: 100,
    level: "All Levels",
    enrolledUsers: 4500,
    badge: "Ethics Certified",
    badgeColor: "#10B981",
    enrolled: true,
    modules: [
      { id: "tt7-m1", title: "Workplace Respect & Inclusion", duration: "2h", type: "course", completed: true },
      { id: "tt7-m2", title: "Recognizing & Preventing Discrimination", duration: "2h", type: "course", completed: true },
      { id: "tt7-m3", title: "Reporting Procedures & Your Rights", duration: "2h", type: "assessment", completed: true },
    ],
  },
  {
    id: "tt8",
    title: "Data Science & Machine Learning",
    type: "academic",
    category: "Technical",
    icon: "🧠",
    description: "Python, statistical foundations, ML algorithms, and practical model deployment with MLflow and FastAPI.",
    courses: 14,
    totalHours: 80,
    completed: 0,
    isMandatory: false,
    deadline: null,
    progress: 0,
    level: "Intermediate",
    enrolledUsers: 1560,
    badge: "ML Engineer",
    badgeColor: "#8B5CF6",
    enrolled: false,
    modules: [
      { id: "tt8-m1", title: "Python for Data Science", duration: "6h", type: "course", completed: false },
      { id: "tt8-m2", title: "Statistics & Probability Foundations", duration: "6h", type: "course", completed: false },
      { id: "tt8-m3", title: "Data Wrangling with pandas", duration: "5h", type: "course", completed: false },
      { id: "tt8-m4", title: "Data Visualization", duration: "4h", type: "course", completed: false },
      { id: "tt8-m5", title: "Supervised Learning Algorithms", duration: "6h", type: "course", completed: false },
      { id: "tt8-m6", title: "Unsupervised Learning & Clustering", duration: "5h", type: "course", completed: false },
      { id: "tt8-m7", title: "Feature Engineering", duration: "5h", type: "course", completed: false },
      { id: "tt8-m8", title: "Model Evaluation & Validation", duration: "5h", type: "course", completed: false },
      { id: "tt8-m9", title: "Neural Networks Fundamentals", duration: "6h", type: "course", completed: false },
      { id: "tt8-m10", title: "Deep Learning with TensorFlow", duration: "7h", type: "course", completed: false },
      { id: "tt8-m11", title: "Natural Language Processing Basics", duration: "6h", type: "course", completed: false },
      { id: "tt8-m12", title: "MLOps & Model Deployment", duration: "6h", type: "course", completed: false },
      { id: "tt8-m13", title: "Building APIs with FastAPI", duration: "5h", type: "course", completed: false },
      { id: "tt8-m14", title: "Capstone: End-to-End ML Project", duration: "8h", type: "assessment", completed: false },
    ],
  },
]

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Compliance: Shield,
  Technical: GraduationCap,
  "Soft Skills": Briefcase,
}

export const DEFAULT_CATEGORY_ICON = BookOpen
