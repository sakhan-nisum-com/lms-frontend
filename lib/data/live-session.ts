// ── Student-facing types ──────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  authorName: string
  authorInitials: string
  authorColor: string
  text: string
  timestamp: Date
  isSelf: boolean
}

export interface QAItem {
  id: string
  question: string
  askedBy: string
  askedByInitials: string
  upvotes: number
  hasUpvoted: boolean
  isAnswered: boolean
  answeredAt?: string
}

export interface Participant {
  id: string
  name: string
  initials: string
  color: string
  isInstructor: boolean
  isSelf: boolean
}

// ── URL utilities ─────────────────────────────────────────────────────────────

/**
 * Extracts a Zoom meeting number from any common Zoom URL format:
 *   https://zoom.us/j/123456789
 *   https://zoom.us/wc/join/123456789
 *   https://us02web.zoom.us/j/123456789
 */
export function parseZoomMeetingNumber(meetLink: string): string | null {
  const match = meetLink.match(/zoom\.us\/(?:wc\/(?:join\/)?|j\/)(\d{8,11})/)
  return match ? match[1] : null
}

export function isZoomLink(meetLink: string): boolean {
  return meetLink.includes("zoom.us")
}

// ── Mock constants ────────────────────────────────────────────────────────────

const INITIALS_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B",
  "#EF4444", "#EC4899", "#14B8A6", "#F97316",
]

function colorForInitials(initials: string): string {
  return INITIALS_COLORS[initials.charCodeAt(0) % INITIALS_COLORS.length]
}

export const MOCK_PARTICIPANTS: Participant[] = [
  { id: "p-instructor", name: "Sarah Chen",     initials: "SC", color: "#3B82F6",  isInstructor: true,  isSelf: false },
  { id: "p-self",       name: "Alex Johnson",   initials: "AJ", color: "#10B981",  isInstructor: false, isSelf: true  },
  { id: "p3",  name: "Jordan Lee",    initials: "JL", color: colorForInitials("JL"), isInstructor: false, isSelf: false },
  { id: "p4",  name: "Taylor Reid",   initials: "TR", color: colorForInitials("TR"), isInstructor: false, isSelf: false },
  { id: "p5",  name: "Sam Rivera",    initials: "SR", color: colorForInitials("SR"), isInstructor: false, isSelf: false },
  { id: "p6",  name: "Morgan Blake",  initials: "MB", color: colorForInitials("MB"), isInstructor: false, isSelf: false },
  { id: "p7",  name: "Casey Chen",    initials: "CC", color: colorForInitials("CC"), isInstructor: false, isSelf: false },
  { id: "p8",  name: "Riley Park",    initials: "RP", color: colorForInitials("RP"), isInstructor: false, isSelf: false },
  { id: "p9",  name: "Avery Kim",     initials: "AK", color: colorForInitials("AK"), isInstructor: false, isSelf: false },
  { id: "p10", name: "Quinn Torres",  initials: "QT", color: colorForInitials("QT"), isInstructor: false, isSelf: false },
  { id: "p11", name: "Drew Patel",    initials: "DP", color: colorForInitials("DP"), isInstructor: false, isSelf: false },
  { id: "p12", name: "Skyler Nair",   initials: "SN", color: colorForInitials("SN"), isInstructor: false, isSelf: false },
  { id: "p13", name: "Reese Webb",    initials: "RW", color: colorForInitials("RW"), isInstructor: false, isSelf: false },
  { id: "p14", name: "Finley Okafor", initials: "FO", color: colorForInitials("FO"), isInstructor: false, isSelf: false },
]

export const CHAT_MESSAGE_POOL: string[] = [
  "Can you explain that again?",
  "This makes sense 👍",
  "Great session so far!",
  "Could you share the slides after?",
  "I had the same question!",
  "Thanks, that clears it up.",
  "What about edge cases here?",
  "Love this explanation 🙌",
  "Can we go slower on this part?",
  "This is exactly what I needed.",
  "Quick question — does this apply to async code too?",
  "Excellent explanation 💯",
  "I'll need to re-watch this section.",
  "Any recommended reading on this topic?",
  "Perfect timing with this topic 🔥",
]

const MOCK_AUTHOR_NAMES = [
  "Jordan Lee", "Taylor Reid", "Sam Rivera", "Morgan Blake",
  "Casey Chen", "Riley Park", "Avery Kim", "Quinn Torres",
]

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function buildInitialMessages(): ChatMessage[] {
  const now = new Date()
  return [
    {
      id: "msg-0",
      authorName: "Sarah Chen",
      authorInitials: "SC",
      authorColor: "#3B82F6",
      text: "Welcome everyone! We'll get started in just a moment. Feel free to say hi in the chat 👋",
      timestamp: new Date(now.getTime() - 4 * 60 * 1000),
      isSelf: false,
    },
    {
      id: "msg-1",
      authorName: "Jordan Lee",
      authorInitials: "JL",
      authorColor: colorForInitials("JL"),
      text: "Excited for this session! 🎉",
      timestamp: new Date(now.getTime() - 3 * 60 * 1000),
      isSelf: false,
    },
    {
      id: "msg-2",
      authorName: "Alex Johnson",
      authorInitials: "AJ",
      authorColor: "#10B981",
      text: "Looking forward to this!",
      timestamp: new Date(now.getTime() - 2 * 60 * 1000),
      isSelf: true,
    },
  ]
}

export function buildRandomMessage(id: string): ChatMessage {
  const name = MOCK_AUTHOR_NAMES[id.charCodeAt(id.length - 1) % MOCK_AUTHOR_NAMES.length]
  const text = CHAT_MESSAGE_POOL[id.charCodeAt(0) % CHAT_MESSAGE_POOL.length]
  const ini = initials(name)
  return {
    id,
    authorName: name,
    authorInitials: ini,
    authorColor: colorForInitials(ini),
    text,
    timestamp: new Date(),
    isSelf: false,
  }
}

export const INITIAL_QA_ITEMS: QAItem[] = [
  {
    id: "qa1",
    question: "Will there be a recording available after the session?",
    askedBy: "Jordan Lee",
    askedByInitials: "JL",
    upvotes: 8,
    hasUpvoted: false,
    isAnswered: true,
    answeredAt: "Yes, recordings are posted within 24 hours to the course page.",
  },
  {
    id: "qa2",
    question: "Is this concept applicable to React Server Components as well?",
    askedBy: "Sam Rivera",
    askedByInitials: "SR",
    upvotes: 5,
    hasUpvoted: false,
    isAnswered: false,
  },
  {
    id: "qa3",
    question: "Can you share the code snippets used in this demo?",
    askedBy: "Taylor Reid",
    askedByInitials: "TR",
    upvotes: 12,
    hasUpvoted: false,
    isAnswered: true,
    answeredAt: "Code is in the course GitHub repo — see the pinned discussion thread.",
  },
  {
    id: "qa4",
    question: "How does this differ from the approach shown in Module 1?",
    askedBy: "Alex Johnson",
    askedByInitials: "AJ",
    upvotes: 3,
    hasUpvoted: false,
    isAnswered: false,
  },
]

// ── Assignment types ──────────────────────────────────────────────────────────

export interface AttachmentFile {
  id: string
  name: string
  fileType: "image" | "pdf" | "text" | "other"
  size: string   // display string e.g. "2.4 MB"
}

export interface AssignmentTemplate {
  id: string
  title: string
  description: string
  dueDate?: string
  maxPoints?: number
  attachments?: AttachmentFile[]
}

export interface LiveAssignment extends AssignmentTemplate {
  status: "hidden" | "published"
  publishedAt?: Date
}

export const INITIAL_LIVE_ASSIGNMENTS: LiveAssignment[] = [
  {
    id: "asgn1",
    title: "System Design Case Study",
    description: "Design a horizontally scalable rate-limiter service. Include an architecture diagram, your choice of data store, and a draft API contract.",
    dueDate: "2026-06-25",
    maxPoints: 100,
    status: "hidden",
  },
  {
    id: "asgn2",
    title: "Reflection Write-up",
    description: "In 300–500 words, describe one architectural decision from today's session and explain the trade-offs you would consider.",
    dueDate: "2026-06-20",
    maxPoints: 50,
    status: "hidden",
  },
]

// ── Instructor-facing types ───────────────────────────────────────────────────

/** Pre-created in the training setup; used as a template in the live session */
export interface KnowledgeCheckTemplate {
  id: string
  type: "mcq" | "descriptive"
  question: string
  options: string[]       // 4 entries for MCQ, empty for descriptive
  correctIndex?: number   // MCQ only
}

export interface StudentKCResponse {
  studentId: string
  studentName: string
  studentInitials: string
  studentColor: string
  answer: string          // chosen option text (MCQ) or free text (descriptive)
  answerIndex?: number    // MCQ only
  isCorrect?: boolean     // MCQ only
  submittedAt: Date
}

export interface LiveKnowledgeCheck extends KnowledgeCheckTemplate {
  status: "draft" | "active" | "closed"
  launchedAt?: Date
  closedAt?: Date
  responses: StudentKCResponse[]
}

export interface AttendeeRecord {
  studentId: string
  studentName: string
  studentInitials: string
  studentColor: string
  isOnline: boolean
  joinedAt: string   // display string e.g. "2:03 PM"
  checksAnswered: number
  totalChecks: number
}

export interface InstructorQAItem {
  id: string
  question: string
  askedBy: string
  askedByInitials: string
  askedByColor: string
  upvotes: number
  isAnswered: boolean
  reply?: string
  askedAt: Date
}

// ── Instructor mock data ──────────────────────────────────────────────────────

export const MOCK_ATTENDEES: AttendeeRecord[] = MOCK_PARTICIPANTS
  .filter((p) => !p.isInstructor)
  .map((p, i) => ({
    studentId: p.id,
    studentName: p.isSelf ? "Alex Johnson" : p.name,
    studentInitials: p.initials,
    studentColor: p.color,
    isOnline: i < 11,
    joinedAt: `${1 + (i % 3)}:0${i % 9 === 0 ? "0" : i % 9} PM`,
    checksAnswered: 0,
    totalChecks: 0,
  }))

const DESCRIPTIVE_ANSWER_POOL: string[] = [
  "The main advantage is reduced memory overhead and better horizontal scalability.",
  "It allows decoupling the producer from the consumer, enabling async processing.",
  "I think it's mainly useful for high-throughput systems where latency matters most.",
  "It enables horizontal scaling without shared mutable state between instances.",
  "The trade-off is increased complexity in the data consistency and ordering layer.",
  "Primarily useful when you need to process events independently and idempotently.",
  "It separates concerns so each service can scale and deploy independently.",
]

export function buildMockKCResponse(
  check: LiveKnowledgeCheck,
  student: AttendeeRecord,
  index: number
): StudentKCResponse {
  if (check.type === "mcq" && check.options.length > 0) {
    // Weight toward correct answer (correct gets 3x weight vs 1x for wrong)
    const correctIdx = check.correctIndex ?? 0
    const totalWeight = check.options.length - 1 + 3
    let r = index % totalWeight
    let answerIndex = 0
    for (let i = 0; i < check.options.length; i++) {
      const weight = i === correctIdx ? 3 : 1
      r -= weight
      if (r < 0) { answerIndex = i; break }
    }
    return {
      studentId: student.studentId,
      studentName: student.studentName,
      studentInitials: student.studentInitials,
      studentColor: student.studentColor,
      answer: check.options[answerIndex],
      answerIndex,
      isCorrect: answerIndex === correctIdx,
      submittedAt: new Date(),
    }
  }
  return {
    studentId: student.studentId,
    studentName: student.studentName,
    studentInitials: student.studentInitials,
    studentColor: student.studentColor,
    answer: DESCRIPTIVE_ANSWER_POOL[index % DESCRIPTIVE_ANSWER_POOL.length],
    submittedAt: new Date(),
  }
}

export const INITIAL_INSTRUCTOR_QA: InstructorQAItem[] = [
  {
    id: "iqa1",
    question: "Can you explain the CAP theorem trade-off in more detail?",
    askedBy: "Jordan Lee", askedByInitials: "JL", askedByColor: "#3B82F6",
    upvotes: 7, isAnswered: false,
    askedAt: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: "iqa2",
    question: "How does this scale to multi-region deployments?",
    askedBy: "Sam Rivera", askedByInitials: "SR", askedByColor: "#8B5CF6",
    upvotes: 5, isAnswered: false,
    askedAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "iqa3",
    question: "Will there be a recording of this session?",
    askedBy: "Taylor Reid", askedByInitials: "TR", askedByColor: "#10B981",
    upvotes: 12, isAnswered: true,
    reply: "Yes! Recording will be posted within 24 hours.",
    askedAt: new Date(Date.now() - 12 * 60 * 1000),
  },
  {
    id: "iqa4",
    question: "Is this pattern compatible with event sourcing?",
    askedBy: "Avery Kim", askedByInitials: "AK", askedByColor: "#F59E0B",
    upvotes: 3, isAnswered: false,
    askedAt: new Date(Date.now() - 2 * 60 * 1000),
  },
]

export const INITIAL_LIVE_CHECKS: LiveKnowledgeCheck[] = [
  {
    id: "lkc1",
    type: "mcq",
    question: "Which consistency model does an eventually consistent system violate?",
    options: ["Eventual consistency", "Strong consistency", "Causal consistency", "Monotonic reads"],
    correctIndex: 1,
    status: "closed",
    launchedAt: new Date(Date.now() - 20 * 60 * 1000),
    closedAt: new Date(Date.now() - 15 * 60 * 1000),
    responses: MOCK_ATTENDEES.slice(0, 11).map((s, i) => ({
      studentId: s.studentId,
      studentName: s.studentName,
      studentInitials: s.studentInitials,
      studentColor: s.studentColor,
      answer: ["Strong consistency", "Strong consistency", "Causal consistency", "Strong consistency",
               "Strong consistency", "Monotonic reads", "Strong consistency", "Strong consistency",
               "Causal consistency", "Strong consistency", "Strong consistency"][i],
      answerIndex: [1, 1, 2, 1, 1, 3, 1, 1, 2, 1, 1][i],
      isCorrect: [true, true, false, true, true, false, true, true, false, true, true][i],
      submittedAt: new Date(Date.now() - (19 - i) * 60 * 1000),
    })),
  },
  {
    id: "lkc2",
    type: "descriptive",
    question: "In your own words, explain the main benefit of using message queues in a microservices architecture.",
    options: [],
    status: "draft",
    responses: [],
  },
]