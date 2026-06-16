export interface Workshop {
  id: string
  title: string
  subtitle: string
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
}

export const WORKSHOPS: Workshop[] = [
  {
    id: "ws1",
    title: "Build a Production-Ready Next.js App",
    subtitle: "Full-stack workshop with real deployment",
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
  },
  {
    id: "ws2",
    title: "System Design Intensive",
    subtitle: "Design 3 real systems from scratch with live review",
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
    title: "Figma to Code: UI Engineering",
    subtitle: "Bridge the gap between design and implementation",
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
  },
  {
    id: "ws4",
    title: "DevOps Bootcamp: CI/CD Pipelines",
    subtitle: "Configure GitHub Actions, Docker, and K8s from zero",
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
  },
  {
    id: "ws5",
    title: "Ethical Hacking & Penetration Testing",
    subtitle: "Hands-on lab with CTF-style challenges",
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
  },
]
