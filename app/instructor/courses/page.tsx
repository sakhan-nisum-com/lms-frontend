"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Plus,
  Play,
  Users,
  Star,
  Clock,
  MoreHorizontal,
  Edit2,
  Eye,
  Trash2,
  BookOpen,
  Search,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"

const COURSES = [
  {
    id: 1,
    title: "React & TypeScript Masterclass",
    description: "Build production-grade React apps with TypeScript, hooks, and modern patterns.",
    category: "Software Engineering",
    students: 1204,
    rating: 4.9,
    reviews: 342,
    revenue: "$3,612",
    status: "published",
    lessons: 48,
    duration: "18h 30m",
    updated: "2 days ago",
    color: "#3B82F6",
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
    status: "published",
    lessons: 35,
    duration: "12h 15m",
    updated: "1 week ago",
    color: "#10B981",
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
    status: "published",
    lessons: 27,
    duration: "9h 45m",
    updated: "3 days ago",
    color: "#F59E0B",
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
    status: "draft",
    lessons: 12,
    duration: "6h 00m",
    updated: "Today",
    color: "#8B5CF6",
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
    status: "review",
    lessons: 31,
    duration: "14h 20m",
    updated: "Yesterday",
    color: "#EF4444",
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
    status: "published",
    lessons: 22,
    duration: "8h 10m",
    updated: "5 days ago",
    color: "#EC4899",
  },
]

const TABS = [
  { key: "all",       label: "All",       count: COURSES.length },
  { key: "published", label: "Published", count: COURSES.filter((c) => c.status === "published").length },
  { key: "draft",     label: "Draft",     count: COURSES.filter((c) => c.status === "draft").length },
  { key: "review",    label: "In Review", count: COURSES.filter((c) => c.status === "review").length },
]

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: "Published", color: "#10B981", bg: "#10B98118" },
  draft:     { label: "Draft",     color: "#64748B", bg: "#33415518" },
  review:    { label: "In Review", color: "#F59E0B", bg: "#F59E0B18" },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.draft
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  )
}

function CourseCard({ course }: { course: (typeof COURSES)[0] }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-colors"
      style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
    >
      {/* Thumbnail */}
      <div
        className="flex items-center justify-center h-32 relative"
        style={{ backgroundColor: course.color + "18" }}
      >
        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl"
          style={{ backgroundColor: course.color + "30" }}
        >
          <Play size={22} style={{ color: course.color }} />
        </div>
        <div className="absolute top-3 left-3">
          <StatusBadge status={course.status} />
        </div>
        <div className="absolute top-3 right-3 relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "#94A3B8" }}
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-8 z-20 w-36 rounded-xl overflow-hidden py-1"
                style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
              >
                {[
                  { icon: Edit2,  label: "Edit course",  color: "#94A3B8" },
                  { icon: Eye,    label: "Preview",       color: "#94A3B8" },
                  { icon: Trash2, label: "Delete",        color: "#EF4444" },
                ].map(({ icon: Icon, label, color }) => (
                  <button
                    key={label}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5"
                    style={{ color }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <span
          className="text-xs font-medium mb-1.5"
          style={{ color: course.color }}
        >
          {course.category}
        </span>
        <h3 className="text-sm font-semibold text-white leading-snug mb-1.5 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-xs leading-relaxed mb-4 flex-1 line-clamp-2" style={{ color: "#64748B" }}>
          {course.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "#64748B" }}>
          <span className="flex items-center gap-1">
            <Users size={11} /> {course.students.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={11} /> {course.lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {course.duration}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #334155" }}>
          <span className="text-sm font-bold text-white">{course.revenue}</span>
          {course.rating > 0 ? (
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#F59E0B" }}>
              <Star size={12} fill="#F59E0B" />
              {course.rating}
              <span style={{ color: "#475569" }}>({course.reviews})</span>
            </span>
          ) : (
            <span className="text-xs" style={{ color: "#475569" }}>No reviews yet</span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Link
            href={`/instructor/courses/${course.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors hover:opacity-90"
            style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}
          >
            <Edit2 size={12} /> Edit
          </Link>
          <Link
            href={`/instructor/courses/${course.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-white/5"
            style={{ backgroundColor: "#334155", color: "#CBD5E1" }}
          >
            <Eye size={12} /> Preview
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = COURSES.filter((c) => {
    const matchTab = activeTab === "all" || c.status === activeTab
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <InstructorPageShell
      title="My Courses"
      user={{ name: "Jane Smith", email: "jane@example.com" }}
      action={
        <Link
          href="/instructor/courses/new"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
          style={{ backgroundColor: "#3B82F6" }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New Course</span>
        </Link>
      }
    >
      <div className="space-y-5">
        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "#1E293B" }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === tab.key ? "#334155" : "transparent",
                  color: activeTab === tab.key ? "#F8FAFC" : "#64748B",
                }}
              >
                {tab.label}
                <span
                  className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: activeTab === tab.key ? "#3B82F6" : "#33415580",
                    color: activeTab === tab.key ? "#fff" : "#64748B",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl sm:ml-auto"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <Search size={13} style={{ color: "#475569" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="bg-transparent outline-none text-sm w-40 placeholder-slate-600"
              style={{ color: "#F8FAFC" }}
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <BookOpen size={36} style={{ color: "#334155" }} />
            <p className="mt-3 text-sm font-medium" style={{ color: "#64748B" }}>
              No courses found
            </p>
            <Link
              href="/instructor/courses/new"
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: "#3B82F6" }}
            >
              <Plus size={14} /> Create your first course
            </Link>
          </div>
        )}
      </div>
    </InstructorPageShell>
  )
}
