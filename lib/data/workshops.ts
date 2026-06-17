export type WorkshopKind = "live" | "lab" | "in-person" | "panel" | "hackathon"

export interface Exercise {
  id: string
  title: string
}

export interface Speaker {
  name: string
  avatar: string
  title: string
  topic: string
}

export interface Venue {
  name: string
  address: string
  city: string
  room?: string
}

export interface Prize {
  place: string
  reward: string
}

export interface Milestone {
  time: string
  title: string
}

export interface Workshop {
  id: string
  kind: WorkshopKind
  title: string
  subtitle: string
  description: string
  thumbnail: string
  instructor: string
  instructorAvatar: string
  instructorTitle: string
  date: string
  time: string
  endTime: string
  duration: string
  attendees: number
  maxAttendees: number
  price: number
  level: "Beginner" | "Intermediate" | "Advanced"
  format: string
  tags: string[]
  rating: number
  reviewCount: number
  agenda: string[]

  // kind: "lab"
  repoUrl?: string
  environment?: string
  exercises?: Exercise[]

  // kind: "in-person"
  venue?: Venue
  whatToBring?: string[]

  // kind: "panel"
  speakers?: Speaker[]
  sampleQuestions?: string[]

  // kind: "hackathon"
  durationDays?: number
  teamSize?: string
  prizes?: Prize[]
  milestones?: Milestone[]
  judgingCriteria?: string[]
}

export const WORKSHOPS: Workshop[] = [
  {
    id: "ws1",
    kind: "lab",
    title: "Build a Production-Ready Next.js App",
    subtitle: "Full-stack hands-on lab with real deployment",
    description: "Go from a blank repository to a fully deployed, production-grade Next.js application in one session. You'll work in your own sandbox alongside the instructor, completing real exercises as you go — Server Components, database integration, auth, and a live deployment to Vercel by the end.",
    thumbnail: "⚛️",
    instructor: "Sarah Chen",
    instructorAvatar: "SC",
    instructorTitle: "Senior Engineer @ Vercel",
    date: "2026-06-20",
    time: "10:00 AM",
    endTime: "4:00 PM",
    duration: "6 hours",
    attendees: 38,
    maxAttendees: 50,
    price: 49,
    level: "Intermediate",
    format: "Virtual",
    tags: ["Next.js", "React", "TypeScript", "Deployment"],
    rating: 4.9,
    reviewCount: 214,
    agenda: ["Setup & project scaffold", "Server Components deep dive", "Database integration with Prisma", "Auth with NextAuth.js", "Deployment to Vercel"],
    repoUrl: "github.com/learnflow/nextjs-workshop-starter",
    environment: "Browser-based sandbox (StackBlitz) — no local setup required",
    exercises: [
      { id: "ex1", title: "Clone the starter repo and run the dev server" },
      { id: "ex2", title: "Convert the dashboard page to a Server Component" },
      { id: "ex3", title: "Add a Prisma model and wire up a query" },
      { id: "ex4", title: "Protect the /admin route with NextAuth.js" },
      { id: "ex5", title: "Deploy your app to Vercel and share the URL" },
    ],
  },
  {
    id: "ws2",
    kind: "live",
    title: "System Design Intensive",
    subtitle: "Design 3 real systems from scratch with live review",
    description: "A full day of whiteboard-style system design, live with the instructor and a small cohort. You'll design three real systems from scratch, present your approach, and get direct feedback — the same format used in senior engineering interviews at top tech companies.",
    thumbnail: "🏗️",
    instructor: "Lisa Wang",
    instructorAvatar: "LW",
    instructorTitle: "Staff Engineer @ Stripe",
    date: "2026-06-22",
    time: "9:00 AM",
    endTime: "5:00 PM",
    duration: "8 hours",
    attendees: 24,
    maxAttendees: 30,
    price: 79,
    level: "Advanced",
    format: "Virtual",
    tags: ["System Design", "Architecture", "Interview"],
    rating: 4.8,
    reviewCount: 156,
    agenda: ["URL Shortener design", "Chat application at scale", "Ride-sharing backend", "Whiteboard review sessions"],
  },
  {
    id: "ws3",
    kind: "lab",
    title: "Figma to Code: UI Engineering",
    subtitle: "Bridge the gap between design and implementation",
    description: "A hands-on lab for engineers who want to ship pixel-accurate UI without back-and-forth with design. Work directly from a real Figma file in your own sandbox, extracting tokens, building responsive layouts, and running an accessibility audit on what you build.",
    thumbnail: "🎨",
    instructor: "Alex Torres",
    instructorAvatar: "AT",
    instructorTitle: "Design Engineer @ Airbnb",
    date: "2026-06-25",
    time: "1:00 PM",
    endTime: "5:00 PM",
    duration: "4 hours",
    attendees: 61,
    maxAttendees: 100,
    price: 29,
    level: "Beginner",
    format: "Virtual",
    tags: ["Figma", "CSS", "UI", "Design Systems"],
    rating: 4.7,
    reviewCount: 89,
    agenda: ["Reading Figma specs", "CSS custom properties & tokens", "Responsive layout strategies", "Accessibility audit walkthrough"],
    repoUrl: "github.com/learnflow/figma-to-code-starter",
    environment: "Browser-based sandbox (CodeSandbox) — Figma file link provided on join",
    exercises: [
      { id: "ex1", title: "Inspect the Figma file and extract design tokens" },
      { id: "ex2", title: "Build the responsive card grid from spec" },
      { id: "ex3", title: "Wire up CSS custom properties for theming" },
      { id: "ex4", title: "Run an accessibility audit and fix 3 issues" },
    ],
  },
  {
    id: "ws4",
    kind: "lab",
    title: "DevOps Bootcamp: CI/CD Pipelines",
    subtitle: "Configure GitHub Actions, Docker, and K8s from zero",
    description: "A hands-on lab in a provided cloud VM — no local setup headaches. You'll write a real CI pipeline, containerize an application, deploy it to Kubernetes, and configure blue/green deployments and basic monitoring, one exercise at a time.",
    thumbnail: "🐳",
    instructor: "James Park",
    instructorAvatar: "JP",
    instructorTitle: "Platform Engineer @ Cloudflare",
    date: "2026-07-03",
    time: "10:00 AM",
    endTime: "4:00 PM",
    duration: "6 hours",
    attendees: 19,
    maxAttendees: 40,
    price: 59,
    level: "Intermediate",
    format: "Virtual",
    tags: ["Docker", "Kubernetes", "GitHub Actions", "DevOps"],
    rating: 4.8,
    reviewCount: 103,
    agenda: ["GitHub Actions workflows", "Dockerizing applications", "Kubernetes basics", "Blue/green deployments", "Monitoring & alerting"],
    repoUrl: "github.com/learnflow/devops-bootcamp-starter",
    environment: "Cloud lab VM provided — link sent 24h before the session",
    exercises: [
      { id: "ex1", title: "Write a GitHub Actions workflow that runs tests on push" },
      { id: "ex2", title: "Dockerize the sample API and run it locally" },
      { id: "ex3", title: "Deploy the container to a local Kubernetes cluster" },
      { id: "ex4", title: "Configure a blue/green deployment strategy" },
      { id: "ex5", title: "Hook up basic Prometheus monitoring" },
    ],
  },
  {
    id: "ws5",
    kind: "lab",
    title: "Ethical Hacking & Penetration Testing",
    subtitle: "Hands-on lab with CTF-style challenges",
    description: "An isolated CTF lab environment where you'll practice real offensive security techniques against intentionally vulnerable targets — SQL injection, XSS, and request tampering with Burp Suite — capturing flags as you go.",
    thumbnail: "🔐",
    instructor: "Marcus Reed",
    instructorAvatar: "MR",
    instructorTitle: "Security Researcher",
    date: "2026-07-10",
    time: "2:00 PM",
    endTime: "6:00 PM",
    duration: "4 hours",
    attendees: 33,
    maxAttendees: 50,
    price: 39,
    level: "Advanced",
    format: "Virtual",
    tags: ["Security", "CTF", "Pentesting", "OWASP"],
    rating: 4.9,
    reviewCount: 178,
    agenda: ["OWASP Top 10 overview", "SQLi & XSS exploitation", "Burp Suite walkthrough", "CTF challenge lab"],
    repoUrl: "github.com/learnflow/pentest-ctf-lab",
    environment: "Isolated CTF VM — credentials emailed at session start",
    exercises: [
      { id: "ex1", title: "Exploit a SQL injection vulnerability in the sample app" },
      { id: "ex2", title: "Find and exploit a reflected XSS" },
      { id: "ex3", title: "Intercept and modify a request with Burp Suite" },
      { id: "ex4", title: "Capture all 5 CTF flags" },
    ],
  },
  {
    id: "ws6",
    kind: "panel",
    title: "AI Product Leaders Panel: Building in the Age of LLMs",
    subtitle: "A fireside chat with people shipping AI products at scale",
    description: "No slides, no agenda to follow along with — just an open conversation with three people who ship AI products for a living, moderated live with audience questions taken throughout. Submit your question ahead of time or raise it live.",
    thumbnail: "🎙️",
    instructor: "Dana Whitfield",
    instructorAvatar: "DW",
    instructorTitle: "Moderator · Editor @ The Product Stack",
    date: "2026-06-28",
    time: "11:00 AM",
    endTime: "12:30 PM",
    duration: "1.5 hours",
    attendees: 412,
    maxAttendees: 1000,
    price: 0,
    level: "Beginner",
    format: "Virtual",
    tags: ["AI", "Product", "LLMs", "Career"],
    rating: 4.8,
    reviewCount: 96,
    agenda: ["Opening introductions", "How each panelist's team ships AI features", "Audience Q&A", "Closing thoughts"],
    speakers: [
      { name: "Priya Nair", avatar: "PN", title: "Principal Engineer @ Google", topic: "Scaling LLM infrastructure" },
      { name: "Marcus Webb", avatar: "MW", title: "Staff Engineer @ Stripe", topic: "Type-safe AI tool calling" },
      { name: "Aisha Patel", avatar: "AP", title: "AI Research Lead @ DeepMind", topic: "Evaluating model quality in production" },
    ],
    sampleQuestions: [
      "How do you decide when a feature needs an LLM vs. a simpler heuristic?",
      "What does your eval pipeline look like before shipping a prompt change?",
      "How do you handle cost vs. quality tradeoffs at scale?",
    ],
  },
  {
    id: "ws7",
    kind: "in-person",
    title: "Robotics & Hardware Hacking Day",
    subtitle: "Build and program a robot from scratch — hardware provided",
    description: "A full day on-site at the LearnFlow Innovation Lab. Hardware kits are provided — you'll wire up sensors and motors, program an Arduino controller, and run your robot through an obstacle course by the end of the day. No prior hardware experience needed.",
    thumbnail: "🤖",
    instructor: "Tom Reyes",
    instructorAvatar: "TR",
    instructorTitle: "Robotics Engineer @ Boston Dynamics",
    date: "2026-07-18",
    time: "9:00 AM",
    endTime: "5:00 PM",
    duration: "8 hours",
    attendees: 22,
    maxAttendees: 24,
    price: 89,
    level: "Beginner",
    format: "In-Person",
    tags: ["Robotics", "Hardware", "Arduino", "IoT"],
    rating: 4.9,
    reviewCount: 41,
    agenda: ["Hardware kit unboxing & safety briefing", "Wiring sensors & motors", "Programming the Arduino controller", "Obstacle-course demo & teardown"],
    venue: {
      name: "LearnFlow Innovation Lab",
      address: "455 Market St, 4th Floor",
      city: "San Francisco, CA",
      room: "Maker Space B",
    },
    whatToBring: ["Laptop with Arduino IDE installed", "Closed-toe shoes (workshop floor policy)", "Notebook for wiring diagrams"],
  },
  {
    id: "ws8",
    kind: "hackathon",
    title: "LearnFlow Global Hackathon: Build with AI",
    subtitle: "48 hours to design, build, and ship an AI-powered product",
    description: "Our biggest event of the year. Form a team (or fly solo), build an AI-powered product over one intense weekend, and demo it live to a panel of judges from across the industry. Mentors are on call throughout, and there's real prize money on the table.",
    thumbnail: "🏆",
    instructor: "LearnFlow Events Team",
    instructorAvatar: "LF",
    instructorTitle: "Hosted by LearnFlow",
    date: "2026-08-14",
    time: "6:00 PM",
    endTime: "6:00 PM",
    duration: "48 hours",
    attendees: 860,
    maxAttendees: 1500,
    price: 0,
    level: "Intermediate",
    format: "Hybrid (Virtual + 6 host cities)",
    tags: ["Hackathon", "AI", "Team Project", "Prizes"],
    rating: 4.9,
    reviewCount: 312,
    agenda: ["Kickoff & team formation", "Build sprint", "Mentor office hours", "Submissions close", "Live demos & judging", "Awards ceremony"],
    durationDays: 2,
    teamSize: "1–5 people",
    prizes: [
      { place: "1st Place", reward: "$10,000 + LearnFlow Pro for life" },
      { place: "2nd Place", reward: "$5,000 + 1-year LearnFlow Pro" },
      { place: "3rd Place", reward: "$2,500 + 1-year LearnFlow Pro" },
      { place: "Best Beginner Team", reward: "$1,000" },
    ],
    milestones: [
      { time: "Fri 6:00 PM", title: "Opening ceremony & team formation" },
      { time: "Fri 8:00 PM", title: "Build sprint begins" },
      { time: "Sat 12:00 PM", title: "Mentor office hours" },
      { time: "Sun 4:00 PM", title: "Submissions close" },
      { time: "Sun 5:00 PM", title: "Live demos & judging" },
      { time: "Sun 6:00 PM", title: "Awards ceremony" },
    ],
    judgingCriteria: ["Technical execution", "Originality & creativity", "Real-world impact", "Quality of demo"],
  },
]
