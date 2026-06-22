import { Shield, GraduationCap, Briefcase, BookOpen } from "lucide-react"
import type { SubmissionFormat, AssignmentMCQQuestion } from "./assignmentShared"
export type { SubmissionFormat, AssignmentMCQQuestion }

export interface TrainingAssignment {
  id: string
  title: string
  description: string
  dueDate: string
  maxScore: number
  submissionFormat: SubmissionFormat
  mcqQuestions?: AssignmentMCQQuestion[]
}

export interface TrainingModule {
  id: string
  title: string
  duration: string
  type: "course" | "quiz" | "assessment"
  completed: boolean
}

export interface MCQKnowledgeCheckQuestion {
  id: string
  type: "mcq"
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export interface TextKnowledgeCheckQuestion {
  id: string
  type: "text"
  question: string
  acceptedAnswers: string[]
  explanation?: string
}

export type KnowledgeCheckQuestion = MCQKnowledgeCheckQuestion | TextKnowledgeCheckQuestion

export interface KnowledgeCheck {
  id: string
  title: string
  questions: KnowledgeCheckQuestion[]
  passingScore: number
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
  knowledgeChecks: KnowledgeCheck[]
  assignments: TrainingAssignment[]
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
    knowledgeChecks: [
      {
        id: "tt1-kc1",
        title: "Clean Code & Testing Check",
        passingScore: 70,
        questions: [
          {
            id: "tt1-kc1-q1",
            type: "mcq",
            question: "Which testing approach involves writing the test before the implementation code?",
            options: ["Integration testing", "Test-Driven Development", "Smoke testing", "Regression testing"],
            correctIndex: 1,
          },
          {
            id: "tt1-kc1-q2",
            type: "mcq",
            question: "What is the primary goal of a code review?",
            options: ["Slow down delivery", "Catch bugs and share knowledge across the team", "Replace automated tests", "Assign blame for defects"],
            correctIndex: 1,
          },
          {
            id: "tt1-kc1-q3",
            type: "text",
            question: "Name the testing layer that verifies how multiple modules work together (not just in isolation).",
            acceptedAnswers: ["integration testing", "integration test", "integration tests"],
            explanation: "Integration tests check that independently-developed units behave correctly when combined.",
          },
        ],
      },
      {
        id: "tt1-kc2",
        title: "Architecture & Performance Check",
        passingScore: 70,
        questions: [
          {
            id: "tt1-kc2-q1",
            type: "mcq",
            question: "Which technique helps identify performance bottlenecks in production code?",
            options: ["Code formatting", "Profiling", "Renaming variables", "Adding comments"],
            correctIndex: 1,
          },
          {
            id: "tt1-kc2-q2",
            type: "text",
            question: "What architectural pattern splits an application into independently deployable services?",
            acceptedAnswers: ["microservices", "microservice architecture", "microservices architecture"],
          },
        ],
      },
    ],
    assignments: [
      {
        id: "tt1-as1",
        title: "Architecture Decision Record",
        description: "Submit an Architecture Decision Record (ADR) for a system you've worked on, documenting the context, options considered, and your decision.",
        dueDate: "2026-07-15",
        maxScore: 100,
        submissionFormat: "file",
      },
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
    knowledgeChecks: [
      {
        id: "tt2-kc1",
        title: "Phishing Awareness Check",
        passingScore: 80,
        questions: [
          {
            id: "tt2-kc1-q1",
            type: "mcq",
            question: "What should you do if you receive an email asking you to urgently reset your password via a link?",
            options: ["Click the link immediately", "Reply with your current password to confirm", "Verify the sender and report it to IT/Security", "Forward it to a coworker"],
            correctIndex: 2,
          },
          {
            id: "tt2-kc1-q2",
            type: "text",
            question: "What is the common term for a deceptive email designed to trick you into revealing sensitive information?",
            acceptedAnswers: ["phishing", "phishing email", "a phishing attack", "phishing attack"],
          },
        ],
      },
      {
        id: "tt2-kc2",
        title: "Data Handling Check",
        passingScore: 80,
        questions: [
          {
            id: "tt2-kc2-q1",
            type: "mcq",
            question: "Which classification level should customer financial data typically receive?",
            options: ["Public", "Internal", "Confidential/Restricted", "No classification needed"],
            correctIndex: 2,
          },
          {
            id: "tt2-kc2-q2",
            type: "mcq",
            question: "Who should you notify first after discovering a potential data breach?",
            options: ["No one, handle it yourself", "Post about it on social media", "Your manager and the security incident response team", "Wait until the next team meeting"],
            correctIndex: 2,
          },
        ],
      },
    ],
    assignments: [
      {
        id: "tt2-as1",
        title: "Annual Security Certification Checkpoint",
        description: "Complete this short multiple-choice checkpoint to certify your understanding of this year's security awareness material.",
        dueDate: "2026-06-30",
        maxScore: 100,
        submissionFormat: "mcq",
        mcqQuestions: [
          {
            id: "tt2-as1-q1",
            question: "What should you do before plugging an unknown USB drive into a work computer?",
            options: ["Plug it in immediately to see what's on it", "Check with IT/Security first", "Give it to a coworker to test", "Format it yourself"],
            correctIndex: 1,
          },
          {
            id: "tt2-as1-q2",
            question: "Which of these is the strongest password practice?",
            options: ["Reusing one password everywhere", "Using a unique passphrase with a password manager", "Writing passwords on a sticky note", "Sharing passwords with trusted teammates"],
            correctIndex: 1,
          },
        ],
      },
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
    knowledgeChecks: [
      {
        id: "tt3-kc1",
        title: "GDPR Fundamentals Check",
        passingScore: 80,
        questions: [
          {
            id: "tt3-kc1-q1",
            type: "mcq",
            question: "What does GDPR primarily regulate?",
            options: ["Email marketing budgets", "The processing of personal data of EU individuals", "Corporate tax filings", "Software licensing"],
            correctIndex: 1,
          },
          {
            id: "tt3-kc1-q2",
            type: "text",
            question: "What is the maximum timeframe to notify a supervisory authority of a personal data breach under GDPR?",
            acceptedAnswers: ["72 hours", "72h", "seventy-two hours"],
          },
        ],
      },
      {
        id: "tt3-kc2",
        title: "Data Subject Rights Check",
        passingScore: 80,
        questions: [
          {
            id: "tt3-kc2-q1",
            type: "mcq",
            question: "Which of these is a right granted to individuals under GDPR?",
            options: ["Right to unlimited data retention by companies", "Right to erasure", "Right to sell their own data to third parties without consent", "Right to bypass identity verification"],
            correctIndex: 1,
          },
          {
            id: "tt3-kc2-q2",
            type: "mcq",
            question: "If a customer asks what personal data a company holds about them, which right are they exercising?",
            options: ["Right to access", "Right to be forgotten", "Right to portability", "Right to object"],
            correctIndex: 0,
          },
        ],
      },
    ],
    assignments: [],
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
    knowledgeChecks: [],
    assignments: [],
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
    knowledgeChecks: [
      {
        id: "tt5-kc1",
        title: "HTML, CSS & JavaScript Check",
        passingScore: 70,
        questions: [
          {
            id: "tt5-kc1-q1",
            type: "mcq",
            question: "Which CSS layout model is best suited for building a one-dimensional row or column of items?",
            options: ["Grid", "Flexbox", "Float", "Table"],
            correctIndex: 1,
          },
          {
            id: "tt5-kc1-q2",
            type: "text",
            question: "What does the acronym DOM stand for?",
            acceptedAnswers: ["document object model"],
          },
        ],
      },
      {
        id: "tt5-kc2",
        title: "React & TypeScript Check",
        passingScore: 70,
        questions: [
          {
            id: "tt5-kc2-q1",
            type: "mcq",
            question: "Which React hook lets you store and update local component state?",
            options: ["useEffect", "useState", "useRef", "useContext"],
            correctIndex: 1,
          },
          {
            id: "tt5-kc2-q2",
            type: "mcq",
            question: "What is the main benefit of using TypeScript over plain JavaScript?",
            options: ["Faster runtime execution", "Static type checking that catches errors before runtime", "Smaller bundle size automatically", "No need to write tests"],
            correctIndex: 1,
          },
        ],
      },
    ],
    assignments: [],
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
    knowledgeChecks: [],
    assignments: [],
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
    knowledgeChecks: [],
    assignments: [],
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
    knowledgeChecks: [],
    assignments: [],
  },
]

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Compliance: Shield,
  Technical: GraduationCap,
  "Soft Skills": Briefcase,
}

export const DEFAULT_CATEGORY_ICON = BookOpen
