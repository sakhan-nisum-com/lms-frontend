"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Plus, Play, Users, Star, BookOpen,
  Edit2, Eye, Trash2, Search, Loader2,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"
import { coursesApi, type ApiCourse } from "@/lib/api/courses"
import { authStore } from "@/lib/auth-store"
import { ApiError } from "@/lib/api/client"

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED:      { label: "Published",  color: "var(--success)",      bg: "#10B98118" },
  DRAFT:          { label: "Draft",      color: "var(--text-tertiary)", bg: "#33415518" },
  PENDING_REVIEW: { label: "In Review",  color: "var(--warning)",       bg: "#F59E0B18" },
  ARCHIVED:       { label: "Archived",   color: "var(--text-muted)",    bg: "#33415510" },
  REJECTED:       { label: "Rejected",   color: "var(--danger)",        bg: "#EF444418" },
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER:     "#10B981",
  INTERMEDIATE: "#F59E0B",
  ADVANCED:     "#EF4444",
}

const TAB_KEYS = ["ALL", "PUBLISHED", "DRAFT", "PENDING_REVIEW"]

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.DRAFT
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: s.color, backgroundColor: s.bg }}>
      {s.label}
    </span>
  )
}

function CourseCard({ course, onDelete }: { course: ApiCourse; onDelete: (id: string) => void }) {
  const color = LEVEL_COLORS[course.level] ?? "#3B82F6"
  const lessonCount = course.sections.reduce((acc, s) => acc + s.lessons.length, 0)

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col transition-colors shadow-sm"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
      <div className="flex items-center justify-center h-32 relative" style={{ backgroundColor: color + "18" }}>
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl" style={{ backgroundColor: color + "30" }}>
          <Play size={22} style={{ color }} />
        </div>
        <div className="absolute top-3 left-3">
          <StatusBadge status={course.status} />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-medium mb-1.5" style={{ color }}>
          {course.category ?? course.level}
        </span>
        <h3 className="text-sm font-semibold leading-snug mb-1.5 line-clamp-2" style={{ color: "var(--text-primary)" }}>
          {course.title}
        </h3>
        <p className="text-xs leading-relaxed mb-4 flex-1 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>
          {course.description ?? "No description yet."}
        </p>

        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
          <span className="flex items-center gap-1"><Users size={11} /> {course.studentsCount.toLocaleString()}</span>
          <span className="flex items-center gap-1"><BookOpen size={11} /> {lessonCount} lessons</span>
          <span className="flex items-center gap-1" style={{ color }}>
            {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-default)" }}>
          <div>
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
          </div>
          {course.rating > 0 ? (
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--warning)" }}>
              <Star size={12} fill="#F59E0B" />{course.rating.toFixed(1)}
              <span style={{ color: "var(--text-muted)" }}>({course.reviewCount})</span>
            </span>
          ) : (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>No reviews yet</span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Link href={`/instructor/courses/${course.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
            <Edit2 size={12} /> Edit
          </Link>
          <Link href={`/instructor/courses/${course.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
            <Eye size={12} /> Preview
          </Link>
          <button
            onClick={() => onDelete(course.id)}
            className="p-2 rounded-xl transition-colors"
            style={{ backgroundColor: "#EF444418", color: "#EF4444" }}
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("ALL")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const user = authStore.getUser()
    if (!user) return
    coursesApi.getByInstructor(user.id)
      .then((res) => setCourses(res.data))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter((c) => {
    const matchTab = activeTab === "ALL" || c.status === activeTab
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const countFor = (tab: string) => tab === "ALL" ? courses.length : courses.filter((c) => c.status === tab).length

  return (
    <InstructorPageShell
      title="My Courses"
      user={{ name: authStore.getUser()?.fullName ?? "Instructor", email: authStore.getUser()?.email ?? "" }}
      action={
        <Link href="/instructor/courses/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--accent)" }}>
          <Plus size={15} /> New Course
        </Link>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {TAB_KEYS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                backgroundColor: activeTab === tab ? "var(--accent)" : "transparent",
                color: activeTab === tab ? "#fff" : "var(--text-secondary)",
              }}
            >
              {STATUS_MAP[tab]?.label ?? "All"} ({countFor(tab)})
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "#EF444418", color: "#EF4444" }}>
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen size={40} className="mb-4" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No courses yet</p>
          <p className="text-xs mt-1 mb-4" style={{ color: "var(--text-muted)" }}>Create your first course to get started</p>
          <Link href="/instructor/courses/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}>
            <Plus size={14} /> Create Course
          </Link>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onDelete={(id) => setCourses((prev) => prev.filter((c) => c.id !== id))}
            />
          ))}
        </div>
      )}
    </InstructorPageShell>
  )
}
