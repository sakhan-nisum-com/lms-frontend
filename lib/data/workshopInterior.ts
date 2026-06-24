export type WorkshopPhase = "setup" | "submission" | "peer-review" | "grading" | "closed"

export interface RubricLevel {
  label: string
  points: number
  description: string
}

export interface RubricCriterion {
  id: string
  title: string
  description: string
  maxPoints: number
  levels: RubricLevel[]
}

export interface BreakoutRoom {
  id: string
  name: string
  topic: string
  capacity: number
  participants: number
  host: string
}

export interface ChatMessage {
  id: string
  sender: string
  senderRole: "instructor" | "student"
  message: string
  timestamp: string
  isInstructor: boolean
}

export interface LiveSession {
  platform: "zoom" | "teams" | "webex" | "google-meet"
  joinUrl: string
  scheduledDate: string
  scheduledTime: string
  duration: string
  host: string
  breakoutRooms: BreakoutRoom[]
  whiteboardLabel: string
  recordingAvailable: boolean
  chatMessages: ChatMessage[]
}

export interface PeerAssignment {
  id: string
  anonymousId: string
  submissionType: "text" | "file" | "link"
  contentPreview: string
  fileName?: string
  status: "pending" | "in-progress" | "submitted"
  scores: Record<string, number | null>
  feedback: string
  overallComment: string
}

export interface ReceivedReview {
  reviewerLabel: string
  scores: Record<string, number>
  feedback: string
  overallComment: string
}

export interface GradeData {
  receivedReviews: ReceivedReview[]
  selfScore: number | null
  selfFeedback: string
  instructorScore: number | null
  instructorComment: string
  peerWeight: number
  selfWeight: number
  instructorWeight: number
  totalPossible: number
}

export interface AttendanceRecord {
  sessionName: string
  date: string
  checkIn: string
  checkOut: string
  durationMinutes: number
  method: "qr-code" | "digital-signature" | "auto-detected"
  status: "present" | "late" | "absent"
}

export interface WorkshopInteriorData {
  workshopId: string
  currentPhase: WorkshopPhase
  phaseDeadlines: Partial<Record<WorkshopPhase, string>>

  assignment: {
    title: string
    brief: string
    submissionTypes: ("file" | "text" | "link" | "video" | "audio")[]
    dueDate: string
    maxScore: number
    selfAssessmentRequired: boolean
    anonymousReview: boolean
    peerReviewCount: number
    rubric: RubricCriterion[]
    benchmarkExample: {
      title: string
      content: string
      expectedGrades: Record<string, number>
      instructorFeedback: string
    }
  }

  mySubmission: {
    status: "not-started" | "draft" | "submitted"
    type: "text" | "file" | "link" | null
    content: string
    fileName?: string
    submittedAt: string | null
    selfAssessmentScores: Record<string, number | null>
    selfAssessmentFeedback: string
  }

  peerAssignments: PeerAssignment[]
  liveSession: LiveSession
  grades: GradeData
  attendance: AttendanceRecord[]
}

const RUBRIC: RubricCriterion[] = [
  {
    id: "code-quality",
    title: "Code Quality",
    description: "Clean, readable code with consistent naming, formatting, and no dead code",
    maxPoints: 25,
    levels: [
      { label: "Excellent", points: 25, description: "Perfectly structured, well-named, zero dead code" },
      { label: "Good", points: 18, description: "Mostly clean with minor inconsistencies" },
      { label: "Satisfactory", points: 12, description: "Readable but with notable style issues" },
      { label: "Needs Work", points: 5, description: "Hard to follow, poor naming conventions" },
    ],
  },
  {
    id: "functionality",
    title: "Functionality",
    description: "All required features work: Server Components, DB queries, auth flow, and deployment",
    maxPoints: 25,
    levels: [
      { label: "Excellent", points: 25, description: "All 5 exercises complete, no broken features" },
      { label: "Good", points: 18, description: "4 of 5 features working with minor gaps" },
      { label: "Satisfactory", points: 12, description: "Core flow works, 2–3 features incomplete" },
      { label: "Needs Work", points: 5, description: "Major features missing or broken" },
    ],
  },
  {
    id: "best-practices",
    title: "Next.js Best Practices",
    description: "Correct use of App Router, Server vs Client Components, error boundaries, and loading states",
    maxPoints: 25,
    levels: [
      { label: "Excellent", points: 25, description: "Optimal patterns throughout the codebase" },
      { label: "Good", points: 18, description: "Generally correct with a couple of anti-patterns" },
      { label: "Satisfactory", points: 12, description: "Mixed patterns, some misuse of client components" },
      { label: "Needs Work", points: 5, description: "Mostly client components, no RSC patterns used" },
    ],
  },
  {
    id: "deployment",
    title: "Deployment & Accessibility",
    description: "App is live on Vercel, URL is shared, and the site loads correctly",
    maxPoints: 25,
    levels: [
      { label: "Excellent", points: 25, description: "Live URL works, fast load, no console errors" },
      { label: "Good", points: 18, description: "Deployed but minor runtime warnings" },
      { label: "Satisfactory", points: 12, description: "Partially deployed or URL not consistently accessible" },
      { label: "Needs Work", points: 5, description: "Not deployed or site errors on load" },
    ],
  },
]

export const WORKSHOP_INTERIORS: Record<string, WorkshopInteriorData> = {
  ws1: {
    workshopId: "ws1",
    currentPhase: "peer-review",
    phaseDeadlines: {
      setup: "2026-06-10",
      submission: "2026-06-20",
      "peer-review": "2026-06-23",
      grading: "2026-06-25",
      closed: "2026-06-28",
    },

    assignment: {
      title: "Build & Deploy a Production Next.js App",
      brief:
        "Build a full-stack Next.js application using everything covered in the workshop. Your app must include Server Components for data fetching, a Prisma-backed database, NextAuth.js authentication, and must be deployed to Vercel with a live URL. Complete all 5 exercises from the lab and submit your final repository link or a text summary of your work.",
      submissionTypes: ["file", "text", "link"],
      dueDate: "2026-06-20",
      maxScore: 100,
      selfAssessmentRequired: true,
      anonymousReview: true,
      peerReviewCount: 3,
      rubric: RUBRIC,
      benchmarkExample: {
        title: "Example Submission — Practice Grading",
        content:
          "I built a Next.js 14 dashboard app with full TypeScript support. The dashboard fetches data from a PostgreSQL database using Prisma and displays user analytics with Server Components. I added NextAuth.js with GitHub OAuth for authentication and protected the /admin route using middleware. The app is deployed at https://nextjs-workshop-demo.vercel.app — all 5 exercises were completed and verified. One issue I ran into: Prisma's Edge runtime requires the @prisma/client/edge import which wasn't mentioned in the exercise, but I figured it out through the docs.",
        expectedGrades: { "code-quality": 18, functionality: 25, "best-practices": 18, deployment: 25 },
        instructorFeedback:
          "Strong submission. Loses a few points on Code Quality because the Prisma client is initialized inside a route handler instead of using the singleton pattern, which causes connection pool issues in production.",
      },
    },

    mySubmission: {
      status: "submitted",
      type: "text",
      content:
        "Completed all 5 exercises from the lab session. My Next.js app includes Server Components for the dashboard page, a Prisma schema with User and Post models backed by a Vercel Postgres database, NextAuth.js with GitHub OAuth protecting the /admin route via middleware, and is deployed at https://my-nextjs-workshop.vercel.app. The trickiest part was the Prisma singleton pattern to avoid connection exhaustion — I added a lib/prisma.ts file that conditionally assigns the client to globalThis in development.",
      submittedAt: "2026-06-19T14:32:00Z",
      selfAssessmentScores: {
        "code-quality": 18,
        functionality: 25,
        "best-practices": 18,
        deployment: 25,
      },
      selfAssessmentFeedback:
        "I'm confident in the functionality and deployment, but I know my code quality could be improved — I have some repetitive data-fetching patterns I'd refactor given more time.",
    },

    peerAssignments: [
      {
        id: "pr1",
        anonymousId: "Peer A",
        submissionType: "text",
        contentPreview:
          "Built a full-stack Next.js 14 app with Server Components for all data-fetching pages. Integrated Prisma ORM with a SQLite database (switched to Vercel Postgres on deployment). Used NextAuth.js with Google OAuth, and the /admin route is protected by middleware. All 5 exercises complete. Deployed at https://nextjs-ws-peer.vercel.app — load time is fast, no console errors. The most interesting challenge was streaming data with Suspense boundaries.",
        status: "submitted",
        scores: { "code-quality": 22, functionality: 25, "best-practices": 22, deployment: 25 },
        feedback:
          "Excellent use of Suspense streaming and clean separation of Server/Client Components. Minor deduction on Code Quality for a few any types in the auth callbacks.",
        overallComment:
          "One of the strongest submissions I've reviewed. The Suspense streaming approach was impressive and shows a deep understanding of the App Router.",
      },
      {
        id: "pr2",
        anonymousId: "Peer B",
        submissionType: "link",
        contentPreview: "https://github.com/peer-b/nextjs-workshop — See README for setup and live URL.",
        status: "in-progress",
        scores: { "code-quality": null, functionality: null, "best-practices": null, deployment: null },
        feedback: "",
        overallComment: "",
      },
      {
        id: "pr3",
        anonymousId: "Peer C",
        submissionType: "text",
        contentPreview:
          "Completed the workshop exercises. My app uses the Next.js App Router with a mix of Server and Client Components. I used Prisma with Neon serverless Postgres. Auth is handled by NextAuth.js with credentials provider. Deployed to Vercel — there's a minor CORS issue on the API routes I'm still debugging. Exercises 1–4 are fully working; exercise 5 deployment URL is intermittently returning a 500 error.",
        status: "pending",
        scores: { "code-quality": null, functionality: null, "best-practices": null, deployment: null },
        feedback: "",
        overallComment: "",
      },
    ],

    liveSession: {
      platform: "zoom",
      joinUrl: "https://zoom.us/j/91234567890",
      scheduledDate: "2026-06-20",
      scheduledTime: "10:00 AM",
      duration: "6 hours",
      host: "Sarah Chen",
      breakoutRooms: [
        { id: "br1", name: "Room Alpha", topic: "Server Components & Data Fetching", capacity: 6, participants: 5, host: "Sarah Chen" },
        { id: "br2", name: "Room Beta", topic: "Database Integration with Prisma", capacity: 6, participants: 4, host: "James Park" },
        { id: "br3", name: "Room Gamma", topic: "Authentication with NextAuth.js", capacity: 6, participants: 6, host: "Alex Torres" },
        { id: "br4", name: "Room Delta", topic: "Deployment & Performance", capacity: 6, participants: 3, host: "Dana Whitfield" },
      ],
      whiteboardLabel: "Collaborative Whiteboard — Miro",
      recordingAvailable: true,
      chatMessages: [
        { id: "m1", sender: "Sarah Chen", senderRole: "instructor", message: "Welcome everyone! We'll start the lab in 5 minutes. Make sure your StackBlitz sandbox is open.", timestamp: "9:55 AM", isInstructor: true },
        { id: "m2", sender: "Student_42", senderRole: "student", message: "The sandbox is loading slowly for me — is there a fallback option?", timestamp: "9:57 AM", isInstructor: false },
        { id: "m3", sender: "Sarah Chen", senderRole: "instructor", message: "Yes! You can clone the repo locally — link is in the README. Let me know if you hit any setup issues.", timestamp: "9:58 AM", isInstructor: true },
        { id: "m4", sender: "Student_17", senderRole: "student", message: "How do we handle Prisma in the Edge runtime? I'm getting a PrismaClientInitializationError.", timestamp: "11:22 AM", isInstructor: false },
        { id: "m5", sender: "Sarah Chen", senderRole: "instructor", message: "Great question! Use `import { PrismaClient } from '@prisma/client/edge'` and add `output: 'edge'` to your Prisma schema generator. I'll demo this in 5 min.", timestamp: "11:24 AM", isInstructor: true },
        { id: "m6", sender: "Student_08", senderRole: "student", message: "Can we use a database other than Postgres for exercise 3?", timestamp: "1:10 PM", isInstructor: false },
        { id: "m7", sender: "Sarah Chen", senderRole: "instructor", message: "Absolutely — SQLite via Prisma works great locally, just swap the datasource provider. For Vercel deployment you'll want a hosted DB (Neon, PlanetScale, Vercel Postgres).", timestamp: "1:11 PM", isInstructor: true },
        { id: "m8", sender: "Student_33", senderRole: "student", message: "This has been the most hands-on session I've attended. Already deployed my app!", timestamp: "3:45 PM", isInstructor: false },
      ],
    },

    grades: {
      receivedReviews: [
        {
          reviewerLabel: "Peer 1",
          scores: { "code-quality": 22, functionality: 25, "best-practices": 20, deployment: 25 },
          feedback: "Excellent deployment and functionality. The Prisma singleton pattern is correctly implemented. Slight deduction on best practices — a few Client Components that could be Server Components.",
          overallComment: "Strong submission, clearly understands the App Router model.",
        },
        {
          reviewerLabel: "Peer 2",
          scores: { "code-quality": 18, functionality: 22, "best-practices": 18, deployment: 22 },
          feedback: "Good work overall. Functionality is solid but the auth middleware could be more robust — it doesn't handle expired sessions. Code quality is decent but some functions are too long.",
          overallComment: "Solid effort. Would benefit from breaking large components into smaller ones.",
        },
      ],
      selfScore: 86,
      selfFeedback:
        "I'm confident in functionality and deployment, but my code quality could be better with more refactoring time.",
      instructorScore: 88,
      instructorComment:
        "Excellent work. The Prisma singleton pattern is correctly applied and the auth middleware is solid. Bumping up 3 points from peer average — the edge case handling in the auth flow shows extra care.",
      peerWeight: 0.6,
      selfWeight: 0.1,
      instructorWeight: 0.3,
      totalPossible: 100,
    },

    attendance: [
      { sessionName: "Kick-off & Setup", date: "Jun 15", checkIn: "9:02 AM", checkOut: "11:00 AM", durationMinutes: 118, method: "qr-code", status: "present" },
      { sessionName: "Mid-point Lab Check-in", date: "Jun 18", checkIn: "10:17 AM", checkOut: "12:00 PM", durationMinutes: 103, method: "digital-signature", status: "late" },
      { sessionName: "Full-day Lab Session", date: "Jun 20", checkIn: "10:00 AM", checkOut: "4:02 PM", durationMinutes: 362, method: "auto-detected", status: "present" },
    ],
  },
}
