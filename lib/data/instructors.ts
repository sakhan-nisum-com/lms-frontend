import { COURSES } from "./courses"
import type { Course } from "./courses"

export interface Instructor {
  id: string
  name: string
  avatar: string
  title: string
  bio: string
  color: string
  expertise: string[]
  courseIds: string[]
}

export const INSTRUCTORS: Instructor[] = [
  {
    id: "i1",
    name: "Sarah Chen",
    avatar: "SC",
    title: "Senior Engineer @ Meta",
    bio: "Sarah has spent the last decade building large-scale React applications and now focuses on teaching modern frontend architecture to engineering teams.",
    color: "#3B82F6",
    expertise: ["React", "Next.js", "TypeScript"],
    courseIds: ["c1"],
  },
  {
    id: "i2",
    name: "Marcus Webb",
    avatar: "MW",
    title: "Staff Engineer @ Stripe",
    bio: "Marcus leads payments infrastructure at Stripe and is passionate about type-safe systems, mentoring engineers on writing maintainable, scalable code.",
    color: "#2563EB",
    expertise: ["TypeScript", "Node.js", "Design Patterns"],
    courseIds: ["c2"],
  },
  {
    id: "i3",
    name: "Priya Nair",
    avatar: "PN",
    title: "Principal Engineer @ Google",
    bio: "Priya designs distributed systems that serve billions of requests a day and loves breaking down complex architecture decisions into practical lessons.",
    color: "#8B5CF6",
    expertise: ["System Design", "Distributed Systems", "Databases"],
    courseIds: ["c3"],
  },
  {
    id: "i4",
    name: "Dr. Aisha Patel",
    avatar: "AP",
    title: "AI Research Lead @ DeepMind",
    bio: "Aisha holds a PhD in machine learning and has published widely on neural networks. She makes advanced ML concepts approachable for engineers of all levels.",
    color: "#10B981",
    expertise: ["Machine Learning", "Python", "Neural Networks"],
    courseIds: ["c4"],
  },
  {
    id: "i5",
    name: "James Okafor",
    avatar: "JO",
    title: "CISO @ Fortune 500",
    bio: "James has led security teams protecting Fortune 500 infrastructure for over 15 years and teaches practical, real-world cybersecurity fundamentals.",
    color: "#EF4444",
    expertise: ["Cybersecurity", "Network Security", "Compliance"],
    courseIds: ["c5"],
  },
  {
    id: "i6",
    name: "Dr. Elena Vasquez",
    avatar: "EV",
    title: "DPO Specialist",
    bio: "Elena has served as Data Protection Officer for multinational companies and helps organizations translate GDPR requirements into clear, actionable policy.",
    color: "#F59E0B",
    expertise: ["GDPR", "Data Privacy", "Compliance"],
    courseIds: ["c6"],
  },
  {
    id: "i7",
    name: "Ryan Park",
    avatar: "RP",
    title: "VP Product @ Shopify",
    bio: "Ryan has shipped products used by millions of merchants and teaches the fundamentals of product strategy, discovery, and roadmapping.",
    color: "#EC4899",
    expertise: ["Product Management", "Roadmapping", "User Research"],
    courseIds: ["c7"],
  },
  {
    id: "i8",
    name: "Dr. Monica Shah",
    avatar: "MS",
    title: "Executive Coach & Author",
    bio: "Monica coaches senior leaders across Fortune 100 companies and distills decades of leadership research into practical, people-first management skills.",
    color: "#F97316",
    expertise: ["Leadership", "Management", "Communication"],
    courseIds: ["c8"],
  },
  {
    id: "i9",
    name: "Chloe Martin",
    avatar: "CM",
    title: "Lead Designer @ Airbnb",
    bio: "Chloe leads design systems work at Airbnb and is passionate about teaching research-driven UX practices that hold up at scale.",
    color: "#14B8A6",
    expertise: ["UX Design", "Figma", "Design Systems"],
    courseIds: ["c9"],
  },
  {
    id: "i10",
    name: "David Liu",
    avatar: "DL",
    title: "AWS Solutions Architect",
    bio: "David has architected cloud infrastructure for startups and enterprises alike, and specializes in teaching cost-effective, resilient AWS architecture.",
    color: "#F59E0B",
    expertise: ["AWS", "Cloud Architecture", "Serverless"],
    courseIds: ["c10"],
  },
  {
    id: "i11",
    name: "Nina Torres",
    avatar: "NT",
    title: "Senior Data Analyst @ Airbnb",
    bio: "Nina turns messy data into clear business decisions every day at Airbnb, and teaches practical, hands-on data analysis with Python and SQL.",
    color: "#3B82F6",
    expertise: ["Python", "SQL", "Data Analysis"],
    courseIds: ["c11"],
  },
  {
    id: "i12",
    name: "Keisha Thompson",
    avatar: "KT",
    title: "Chief People Officer",
    bio: "Keisha has built inclusive culture programs at multiple high-growth companies and is dedicated to making DEI training genuinely useful, not just compliant.",
    color: "#8B5CF6",
    expertise: ["DEI", "Inclusion", "Workplace Culture"],
    courseIds: ["c12"],
  },
]

export function getInstructorById(id: string): Instructor | undefined {
  return INSTRUCTORS.find((i) => i.id === id)
}

export function getInstructorByName(name: string): Instructor | undefined {
  return INSTRUCTORS.find((i) => i.name === name)
}

export function getInstructorCourses(instructor: Instructor): Course[] {
  return COURSES.filter((c) => instructor.courseIds.includes(c.id))
}

export function getInstructorStats(instructor: Instructor) {
  const courses = getInstructorCourses(instructor)
  const studentsCount = courses.reduce((sum, c) => sum + c.studentsCount, 0)
  const reviewCount = courses.reduce((sum, c) => sum + c.reviewCount, 0)
  const avgRating = courses.length > 0
    ? courses.reduce((sum, c) => sum + c.rating, 0) / courses.length
    : 0
  return {
    studentsCount,
    reviewCount,
    coursesCount: courses.length,
    rating: Math.round(avgRating * 10) / 10,
  }
}
