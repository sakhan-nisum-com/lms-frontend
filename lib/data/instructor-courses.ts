export interface QuizQuestion {
  id: string
  question: string
  options: string[]      // exactly 4
  correctIndex: number   // 0–3
}

export interface LessonKnowledgeCheck {
  questions: QuizQuestion[]
  passingScore: number   // 0–100 percentage
  isMandatory: boolean   // if true, student cannot bypass the KC
}

export interface SessionKCPart {
  lessonId: string
  questions: QuizQuestion[]
  passingScore: number   // 0–100, per-part threshold
}

export interface SessionKnowledgeCheck {
  isMandatory: boolean
  parts: SessionKCPart[] // one entry per lesson in the section
}

export interface LessonResource {
  id: string
  type: "file" | "link"
  name: string
  url: string
  fileType?: "zip" | "pdf" | "image" | "text" | "other"
  size?: string
}

export interface Lesson {
  id: string
  title: string
  type: "video" | "text" | "quiz"
  duration: string
  isPreview: boolean
  questions?: QuizQuestion[]
  videoFileName?: string
  videoUrl?: string
  textContent?: string
  quizMode?: "fixed" | "bank"
  randomQuestionCount?: number
  isMandatory?: boolean
  minCorrectToPass?: number
  resources?: LessonResource[]
  lessonKC?: LessonKnowledgeCheck
}

export interface Section {
  id: string
  title: string
  expanded: boolean
  lessons: Lesson[]
  sessionKC?: SessionKnowledgeCheck
}

export interface CourseData {
  id: number
  title: string
  description: string
  category: string
  students: number
  rating: number
  reviews: number
  revenue: string
  price: string
  status: "published" | "draft" | "review"
  lessons: number
  duration: string
  updated: string
  color: string
  sections: Section[]
}

export const INSTRUCTOR_COURSES: CourseData[] = [
  {
    id: 1,
    title: "React & TypeScript Masterclass",
    description: "Build production-grade React apps with TypeScript, hooks, and modern patterns.",
    category: "Software Engineering",
    students: 1204,
    rating: 4.9,
    reviews: 342,
    revenue: "$3,612",
    price: "$79.99",
    status: "published",
    lessons: 48,
    duration: "18h 30m",
    updated: "2 days ago",
    color: "#3B82F6",
    sections: [
      {
        id: "s-1-1",
        title: "Getting Started with React & TypeScript",
        expanded: true,
        lessons: [
          { id: "l-1-1-1", title: "Why TypeScript with React?", type: "video", duration: "8:20", isPreview: true },
          { id: "l-1-1-2", title: "Project Setup & tsconfig Walkthrough", type: "video", duration: "12:45", isPreview: false },
          { id: "l-1-1-3", title: "TypeScript Basics Refresher", type: "text", duration: "", isPreview: false },
        ],
      },
      {
        id: "s-1-2",
        title: "React Hooks & Patterns",
        expanded: false,
        lessons: [
          { id: "l-1-2-1", title: "useState & useReducer Deep Dive", type: "video", duration: "22:10", isPreview: false },
          { id: "l-1-2-2", title: "Custom Hooks with TypeScript", type: "video", duration: "18:30", isPreview: false },
          { id: "l-1-2-3", title: "Hooks Knowledge Check", type: "quiz", duration: "", isPreview: false, questions: [
            { id: "q-1-1", question: "What does useState return?", options: ["A single value", "A value and setter function", "A ref object", "An effect cleanup function"], correctIndex: 1 },
            { id: "q-1-2", question: "When does useEffect run by default (no dependency array)?", options: ["Only on mount", "Only on unmount", "After every render", "Only when state changes"], correctIndex: 2 },
            { id: "q-1-3", question: "What is the purpose of useCallback?", options: ["Memoize a computed value", "Memoize a function reference", "Trigger a side effect", "Access a DOM element"], correctIndex: 1 },
            { id: "q-1-4", question: "Which hook stores a mutable value without triggering re-renders?", options: ["useState", "useMemo", "useRef", "useReducer"], correctIndex: 2 },
          ]},
        ],
      },
      {
        id: "s-1-3",
        title: "Context API & Global State",
        expanded: false,
        lessons: [
          { id: "l-1-3-1", title: "Context API Patterns", type: "video", duration: "20:00", isPreview: false },
          { id: "l-1-3-2", title: "Typed Context with Generics", type: "video", duration: "15:00", isPreview: false },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Node.js REST API Development",
    description: "Design and build scalable REST APIs with Node.js, Express, and PostgreSQL.",
    category: "Software Engineering",
    students: 876,
    rating: 4.7,
    reviews: 218,
    revenue: "$2,628",
    price: "$69.99",
    status: "published",
    lessons: 35,
    duration: "12h 15m",
    updated: "1 week ago",
    color: "#10B981",
    sections: [
      {
        id: "s-2-1",
        title: "Node.js Fundamentals",
        expanded: true,
        lessons: [
          { id: "l-2-1-1", title: "Introduction to Node.js", type: "video", duration: "10:00", isPreview: true },
          { id: "l-2-1-2", title: "Setting Up Express", type: "video", duration: "15:30", isPreview: false },
          { id: "l-2-1-3", title: "Middleware Patterns", type: "text", duration: "", isPreview: false },
        ],
      },
      {
        id: "s-2-2",
        title: "Database Integration",
        expanded: false,
        lessons: [
          { id: "l-2-2-1", title: "PostgreSQL Setup & Docker", type: "video", duration: "20:00", isPreview: false },
          { id: "l-2-2-2", title: "Sequelize ORM & Migrations", type: "video", duration: "25:00", isPreview: false },
          { id: "l-2-2-3", title: "Database Design Quiz", type: "quiz", duration: "", isPreview: false, questions: [
            { id: "q-2-1", question: "What does ORM stand for?", options: ["Object Relational Mapping", "Optimized Resource Manager", "Object Routing Module", "Organised Record Management"], correctIndex: 0 },
            { id: "q-2-2", question: "Which SQL clause filters rows after grouping?", options: ["WHERE", "HAVING", "FILTER", "GROUP BY"], correctIndex: 1 },
            { id: "q-2-3", question: "What type of relationship does a foreign key represent?", options: ["One-to-one", "Many-to-many", "One-to-many", "Any of the above"], correctIndex: 2 },
          ]},
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Advanced CSS & Animation",
    description: "Master CSS grid, flexbox, custom properties, and silky-smooth animations.",
    category: "Design & UX",
    students: 543,
    rating: 4.8,
    reviews: 97,
    revenue: "$1,629",
    price: "$49.99",
    status: "published",
    lessons: 27,
    duration: "9h 45m",
    updated: "3 days ago",
    color: "#F59E0B",
    sections: [
      {
        id: "s-3-1",
        title: "CSS Architecture",
        expanded: true,
        lessons: [
          { id: "l-3-1-1", title: "CSS Grid Mastery", type: "video", duration: "18:00", isPreview: true },
          { id: "l-3-1-2", title: "Flexbox Patterns & Tricks", type: "video", duration: "14:30", isPreview: false },
          { id: "l-3-1-3", title: "CSS Custom Properties Guide", type: "text", duration: "", isPreview: false },
        ],
      },
      {
        id: "s-3-2",
        title: "Animations & Transitions",
        expanded: false,
        lessons: [
          { id: "l-3-2-1", title: "Keyframe Animations", type: "video", duration: "22:00", isPreview: false },
          { id: "l-3-2-2", title: "Performance & Hardware Acceleration", type: "video", duration: "16:00", isPreview: false },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "System Design Fundamentals",
    description: "Learn to architect scalable distributed systems used at top tech companies.",
    category: "Software Engineering",
    students: 0,
    rating: 0,
    reviews: 0,
    revenue: "$0",
    price: "$89.99",
    status: "draft",
    lessons: 12,
    duration: "6h 00m",
    updated: "Today",
    color: "#8B5CF6",
    sections: [
      {
        id: "s-4-1",
        title: "Distributed Systems Basics",
        expanded: true,
        lessons: [
          { id: "l-4-1-1", title: "CAP Theorem Explained", type: "video", duration: "15:00", isPreview: true },
          { id: "l-4-1-2", title: "Consistency vs Availability", type: "text", duration: "", isPreview: false },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Docker & Kubernetes for Developers",
    description: "Containerise apps with Docker and orchestrate them with Kubernetes end-to-end.",
    category: "Cloud & DevOps",
    students: 0,
    rating: 0,
    reviews: 0,
    revenue: "$0",
    price: "$74.99",
    status: "review",
    lessons: 31,
    duration: "14h 20m",
    updated: "Yesterday",
    color: "#EF4444",
    sections: [
      {
        id: "s-5-1",
        title: "Docker Fundamentals",
        expanded: true,
        lessons: [
          { id: "l-5-1-1", title: "What is Docker?", type: "video", duration: "10:00", isPreview: true },
          { id: "l-5-1-2", title: "Writing Dockerfiles", type: "video", duration: "18:00", isPreview: false },
          { id: "l-5-1-3", title: "Docker Compose Deep Dive", type: "video", duration: "22:00", isPreview: false },
        ],
      },
      {
        id: "s-5-2",
        title: "Kubernetes Basics",
        expanded: false,
        lessons: [
          { id: "l-5-2-1", title: "Kubernetes Architecture Overview", type: "video", duration: "15:00", isPreview: false },
          { id: "l-5-2-2", title: "Pods, Deployments & Services", type: "video", duration: "20:00", isPreview: false },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "GraphQL with Apollo",
    description: "Replace REST with GraphQL — schema design, resolvers, subscriptions, and caching.",
    category: "Software Engineering",
    students: 312,
    rating: 4.6,
    reviews: 54,
    revenue: "$936",
    price: "$59.99",
    status: "published",
    lessons: 22,
    duration: "8h 10m",
    updated: "5 days ago",
    color: "#EC4899",
    sections: [
      {
        id: "s-6-1",
        title: "GraphQL Fundamentals",
        expanded: true,
        lessons: [
          { id: "l-6-1-1", title: "What is GraphQL?", type: "video", duration: "8:00", isPreview: true },
          { id: "l-6-1-2", title: "Schema Design Best Practices", type: "video", duration: "16:00", isPreview: false },
          { id: "l-6-1-3", title: "Queries & Mutations", type: "video", duration: "20:00", isPreview: false },
        ],
      },
      {
        id: "s-6-2",
        title: "Apollo Client & Server",
        expanded: false,
        lessons: [
          { id: "l-6-2-1", title: "Apollo Server Setup", type: "video", duration: "18:00", isPreview: false },
          { id: "l-6-2-2", title: "Apollo Client Integration", type: "video", duration: "22:00", isPreview: false },
          { id: "l-6-2-3", title: "Subscriptions & Caching Quiz", type: "quiz", duration: "", isPreview: false, questions: [
            { id: "q-6-1", question: "What transport does Apollo use for GraphQL subscriptions?", options: ["HTTP long-polling", "Server-Sent Events", "WebSockets", "gRPC"], correctIndex: 2 },
            { id: "q-6-2", question: "Which Apollo Client policy fetches from cache first, then network?", options: ["cache-only", "network-only", "cache-and-network", "no-cache"], correctIndex: 2 },
            { id: "q-6-3", question: "What is the purpose of Apollo InMemoryCache?", options: ["Persist data to localStorage", "Store query results client-side", "Cache server responses on disk", "Encrypt GraphQL payloads"], correctIndex: 1 },
          ]},
        ],
      },
    ],
  },
]
