"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import { COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import type { CourseCategory } from "@/lib/data/courses"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { useAllProgress } from "@/lib/hooks/useProgress"
import { getCourseProgress } from "@/lib/courseProgress"
import {
  BookOpen, Play, CheckCircle2, Clock, Star, Filter,
  LayoutGrid, List, ChevronRight, AlertCircle, Lock,
} from "lucide-react"

type Tab = "all" | "in-progress" | "completed" | "not-started"

const categoryIcons: Record<CourseCategory, string> = {
  Engineering: "💻",
  "Data Science": "📊",
  Design: "🎨",
  Business: "📈",
  Security: "🔒",
  Compliance: "📋",
  Leadership: "🎯",
  Product: "📱",
}

function CourseStatusBadge({ progress, isMandatory }: { progress: number; isMandatory?: boolean }) {
  if (progress === 100)
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#10B98120", color: "var(--success)" }}>Completed</span>
  if (progress > 0)
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>In Progress</span>
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#33415520", color: "var(--text-secondary)" }}>Not Started</span>
}

const levelColors: Record<string, string> = {
  Beginner: "var(--success)",
  Intermediate: "var(--warning)",
  Advanced: "var(--danger)",
}

export default function MyCoursesPage() {
  const { isPurchased } = usePurchases()
  const allProgress = useAllProgress()
  const [tab, setTab] = useState<Tab>("all")
  const [category, setCategory] = useState<CourseCategory | "all">("all")
  const [view, setView] = useState<"grid" | "list">("grid")

  // Statically-seeded enrollments plus anything bought through checkout, with
  // `progress` overridden to reflect lessons actually marked complete in the
  // player (not just the frozen mock value) — this is what unlocks the
  // "Completed" status and certificate once every lesson is watched.
  const enrolled = COURSES
    .filter((c) => c.progress !== undefined || isPurchased(c.id))
    .map((c) => ({ ...c, progress: getCourseProgress(c, allProgress).progressPct }))

  // Only offer categories the learner actually has courses in.
  const categories = Array.from(new Set(enrolled.map((c) => c.category))) as CourseCategory[]

  const byCategory = category === "all" ? enrolled : enrolled.filter((c) => c.category === category)

  const filtered = byCategory.filter((c) => {
    if (tab === "all") return true
    if (tab === "in-progress") return c.progress! > 0 && c.progress! < 100
    if (tab === "completed") return c.progress === 100
    if (tab === "not-started") return c.progress === 0
    return true
  })

  const counts = {
    all: byCategory.length,
    "in-progress": byCategory.filter((c) => c.progress! > 0 && c.progress! < 100).length,
    completed: byCategory.filter((c) => c.progress === 100).length,
    "not-started": byCategory.filter((c) => c.progress === 0).length,
  }

  const p = STUDENT_PROFILE

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-6 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>My Courses</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {enrolled.length} enrolled · {counts.completed} completed · {counts["in-progress"]} in progress
            </p>
          </div>
          <Link
            href="/student/explore"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            <BookOpen size={15} /> Browse Catalog
          </Link>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Hours", value: "130h", sub: "across all courses" },
            { label: "Avg Grade", value: `${p.stats.avgScore}%`, sub: "across graded work" },
            { label: "Certificates", value: String(p.stats.certificates), sub: "earned so far" },
            { label: "Learning Streak", value: `${p.streak} days`, sub: "keep it up!" },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="rounded-xl p-4 shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            >
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <span className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
              <Filter size={13} /> Category
            </span>
            <button
              onClick={() => setCategory("all")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
              style={{
                backgroundColor: category === "all" ? "var(--accent)" : "var(--bg-surface)",
                color: category === "all" ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${category === "all" ? "var(--accent)" : "var(--border-default)"}`,
              }}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                style={{
                  backgroundColor: category === c ? "var(--accent)" : "var(--bg-surface)",
                  color: category === c ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${category === c ? "var(--accent)" : "var(--border-default)"}`,
                }}
              >
                <span>{categoryIcons[c]}</span> {c}
              </button>
            ))}
          </div>
        )}

        {/* Tabs + View toggle */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 rounded-xl p-1 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            {(["all", "in-progress", "completed", "not-started"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: tab === t ? "var(--accent)" : "transparent",
                  color: tab === t ? "#fff" : "var(--text-secondary)",
                }}
              >
                {t === "all" ? "All" : t === "in-progress" ? "In Progress" : t === "completed" ? "Completed" : "Not Started"}
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: tab === t ? "rgba(255,255,255,0.2)" : "#33415540",
                    color: tab === t ? "#fff" : "var(--text-tertiary)",
                  }}
                >
                  {counts[t]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("grid")}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: view === "grid" ? "#3B82F620" : "var(--bg-surface)", color: view === "grid" ? "#60A5FA" : "var(--text-tertiary)", border: "1px solid var(--border-default)" }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: view === "list" ? "#3B82F620" : "var(--bg-surface)", color: view === "list" ? "#60A5FA" : "var(--text-tertiary)", border: "1px solid var(--border-default)" }}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Course Grid */}
        {filtered.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}
          >
            <BookOpen size={36} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No courses in this category</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((course) => {
              const { totalLessons, completedLessons } = getCourseProgress(course, allProgress)
              const isDone = course.progress === 100
              const resumeHref = course.nextLessonId || course.sections[0]?.lessons[0]?.id
              return (
                <div
                  key={course.id}
                  className="rounded-2xl overflow-hidden flex flex-col transition-all duration-150 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                >
                  <CourseThumbnail course={course} heightClass="h-32" />

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start gap-2 mb-2 flex-wrap">
                      <CourseStatusBadge progress={course.progress!} isMandatory={course.isMandatory} />
                      {course.isMandatory && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EF444420", color: "var(--danger)" }}>Required</span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>{course.title}</h3>
                    <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>{course.instructor}</p>

                    <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {course.totalDuration}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: levelColors[course.level] }}
                      >
                        {course.level}
                      </span>
                      {course.grade !== undefined && (
                        <span className="flex items-center gap-1">
                          <Star size={11} style={{ color: "var(--warning)" }} /> {course.grade}%
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between mb-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        <span>{completedLessons}/{totalLessons > 0 ? totalLessons : "?"} lessons</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${course.progress}%`,
                            backgroundColor: isDone ? "var(--success)" : course.thumbnailColor,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/student/courses/${course.id}`}
                        className="flex-1 text-center py-2 rounded-lg text-xs font-semibold transition-colors"
                        style={{ backgroundColor: "var(--border-default)", color: "#CBD5E1" }}
                      >
                        View Details
                      </Link>
                      {!isDone && (
                        <Link
                          href={`/student/courses/${course.id}/learn/${resumeHref}`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                        >
                          <Play size={12} fill="#fff" /> Resume
                        </Link>
                      )}
                      {isDone && (
                        <Link
                          href={`/student/certificates?course=${course.id}`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: "#10B98120", color: "var(--success)" }}
                        >
                          <CheckCircle2 size={12} /> Certificate
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List view */
          <div className="space-y-3">
            {filtered.map((course) => {
              const isDone = course.progress === 100
              const resumeHref = course.nextLessonId || course.sections[0]?.lessons[0]?.id
              return (
                <div
                  key={course.id}
                  className="rounded-2xl p-4 flex items-center gap-4 transition-all duration-150 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3B82F640")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                >
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${course.thumbnailColor}15` }}
                  >
                    {course.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{course.title}</span>
                      <CourseStatusBadge progress={course.progress!} />
                      {course.isMandatory && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#EF444415", color: "var(--danger)" }}>Required</span>
                      )}
                    </div>
                    <p className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>
                      {course.instructor} · {course.level} · {course.totalDuration}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full max-w-48" style={{ backgroundColor: "var(--border-default)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${course.progress}%`, backgroundColor: isDone ? "var(--success)" : course.thumbnailColor }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{course.progress}%</span>
                      {course.grade !== undefined && (
                        <span className="text-xs flex items-center gap-0.5" style={{ color: "var(--warning)" }}>
                          <Star size={11} /> {course.grade}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/student/courses/${course.id}`}
                      className="p-2 rounded-lg text-xs font-semibold transition-colors"
                      style={{ color: "var(--text-secondary)", backgroundColor: "var(--border-default)" }}
                    >
                      Details
                    </Link>
                    {!isDone && (
                      <Link
                        href={`/student/courses/${course.id}/learn/${resumeHref}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                      >
                        <Play size={12} fill="#fff" /> Resume
                      </Link>
                    )}
                    {isDone && (
                      <Link
                        href={`/student/certificates?course=${course.id}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: "#10B98120", color: "var(--success)" }}
                      >
                        <CheckCircle2 size={12} /> Certificate
                      </Link>
                    )}
                    <Link
                      href={`/student/courses/${course.id}`}
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
