"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { STUDENT_PROFILE } from "@/lib/data/courses"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { useAllProgress } from "@/lib/hooks/useProgress"
import { useMyEnrollments } from "@/lib/hooks/useMyEnrollments"
import {
  BookOpen, Play, CheckCircle2, Clock, Star,
  LayoutGrid, List, ChevronRight, Loader2,
} from "lucide-react"

type Tab = "all" | "in-progress" | "completed" | "not-started"

function CourseStatusBadge({ progress }: { progress: number }) {
  if (progress === 100)
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#10B98120", color: "var(--success)" }}>Completed</span>
  if (progress > 0)
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>In Progress</span>
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#33415520", color: "var(--text-secondary)" }}>Not Started</span>
}

const levelColors: Record<string, string> = {
  Beginner: "var(--success)", BEGINNER: "var(--success)",
  Intermediate: "var(--warning)", INTERMEDIATE: "var(--warning)",
  Advanced: "var(--danger)", ADVANCED: "var(--danger)",
}

function levelLabel(level: string) {
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
}

export default function MyCoursesPage() {
  const { purchasedIds } = usePurchases()
  const allProgress = useAllProgress()
  const [tab, setTab] = useState<Tab>("all")
  const [view, setView] = useState<"grid" | "list">("grid")

  const { items, loading } = useMyEnrollments(Array.from(purchasedIds))

  const courses = items.map(({ course, enrollment }) => {
    const totalLessons = course.sections.reduce((n, s) => n + s.lessons.length, 0)
    const localIds = allProgress[course.id] ?? []
    const localPct = totalLessons > 0 ? Math.round((localIds.length / totalLessons) * 100) : 0
    const progress = enrollment.progressPct > 0 ? enrollment.progressPct : localPct
    return {
      id: course.id,
      title: course.title,
      thumbnail: "📚",
      thumbnailColor: "#3B82F6",
      thumbnailUrl: course.thumbnailUrl,
      level: course.level ?? "BEGINNER",
      totalDuration: course.totalDurationSeconds
        ? `${Math.round(course.totalDurationSeconds / 3600)}h` : "—",
      progress,
      completedLessons: localIds.length,
      totalLessons,
      certificateOffered: course.certificateOffered,
      resumeLessonId: enrollment.lastAccessedLessonId
        ?? course.sections[0]?.lessons[0]?.id ?? null,
    }
  })

  const filtered = courses.filter((c) => {
    if (tab === "in-progress") return c.progress > 0 && c.progress < 100
    if (tab === "completed") return c.progress === 100
    if (tab === "not-started") return c.progress === 0
    return true
  })

  const counts = {
    all: courses.length,
    "in-progress": courses.filter((c) => c.progress > 0 && c.progress < 100).length,
    completed: courses.filter((c) => c.progress === 100).length,
    "not-started": courses.filter((c) => c.progress === 0).length,
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
              {courses.length} enrolled · {counts.completed} completed · {counts["in-progress"]} in progress
            </p>
          </div>
          <Link href="/student/explore"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
            <BookOpen size={15} /> Browse Catalog
          </Link>
        </div>

        {/* Tabs + View toggle */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 rounded-xl p-1 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            {(["all", "in-progress", "completed", "not-started"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{ backgroundColor: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "#fff" : "var(--text-secondary)" }}>
                {t === "all" ? "All" : t === "in-progress" ? "In Progress" : t === "completed" ? "Completed" : "Not Started"}
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: tab === t ? "rgba(255,255,255,0.2)" : "#33415540", color: tab === t ? "#fff" : "var(--text-tertiary)" }}>
                  {counts[t]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: view === v ? "#3B82F620" : "var(--bg-surface)", color: view === v ? "#60A5FA" : "var(--text-tertiary)", border: "1px solid var(--border-default)" }}>
                {v === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center gap-2 py-10" style={{ color: "var(--text-muted)" }}>
            <Loader2 size={16} className="animate-spin" /> Loading your courses…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
            <BookOpen size={36} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>
              {courses.length === 0 ? "No courses yet" : "No courses match this filter"}
            </p>
            {courses.length === 0 && (
              <Link href="/student/explore" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                Browse the catalog →
              </Link>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((course) => {
              const isDone = course.progress === 100
              return (
                <div key={course.id} className="rounded-2xl overflow-hidden flex flex-col transition-all duration-150 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="relative overflow-hidden h-32 flex-shrink-0">
                    {course.thumbnailUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={course.thumbnailUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                      : null}
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${course.thumbnailColor}55 0%, #0F172A80 100%)` }} />
                    <div className="absolute bottom-2 right-2 flex items-center justify-center w-8 h-8 rounded-lg text-lg"
                      style={{ backgroundColor: "#0F172AE6", border: `1px solid ${course.thumbnailColor}60` }}>
                      {course.thumbnail}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-2"><CourseStatusBadge progress={course.progress} /></div>
                    <h3 className="text-sm font-bold mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>{course.title}</h3>
                    <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <span className="flex items-center gap-1"><Clock size={11} /> {course.totalDuration}</span>
                      <span className="font-semibold" style={{ color: levelColors[course.level] ?? "var(--text-secondary)" }}>{levelLabel(course.level)}</span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between mb-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        <span>{course.completedLessons}/{course.totalLessons || "?"} lessons</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${course.progress}%`, backgroundColor: isDone ? "var(--success)" : course.thumbnailColor }} />
                      </div>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <Link href={`/student/courses/${course.id}`}
                        className="flex-1 text-center py-2 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: "var(--border-default)", color: "#CBD5E1" }}>
                        View Details
                      </Link>
                      {!isDone && course.resumeLessonId && (
                        <Link href={`/student/courses/${course.id}/learn/${course.resumeLessonId}`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                          <Play size={12} fill="#fff" /> Resume
                        </Link>
                      )}
                      {isDone && (
                        <Link href={`/student/certificates?course=${course.id}`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: "#10B98120", color: "var(--success)" }}>
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
          <div className="space-y-3">
            {filtered.map((course) => {
              const isDone = course.progress === 100
              return (
                <div key={course.id}
                  className="rounded-2xl p-4 flex items-center gap-4 transition-all duration-150 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3B82F640")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${course.thumbnailColor}15` }}>
                    {course.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{course.title}</span>
                      <CourseStatusBadge progress={course.progress} />
                    </div>
                    <p className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>
                      {levelLabel(course.level)} · {course.totalDuration}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full max-w-48" style={{ backgroundColor: "var(--border-default)" }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${course.progress}%`, backgroundColor: isDone ? "var(--success)" : course.thumbnailColor }} />
                      </div>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{course.progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/student/courses/${course.id}`}
                      className="p-2 rounded-lg text-xs font-semibold"
                      style={{ color: "var(--text-secondary)", backgroundColor: "var(--border-default)" }}>
                      Details
                    </Link>
                    {!isDone && course.resumeLessonId && (
                      <Link href={`/student/courses/${course.id}/learn/${course.resumeLessonId}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                        <Play size={12} fill="#fff" /> Resume
                      </Link>
                    )}
                    {isDone && (
                      <Link href={`/student/certificates?course=${course.id}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: "#10B98120", color: "var(--success)" }}>
                        <CheckCircle2 size={12} /> Certificate
                      </Link>
                    )}
                    <Link href={`/student/courses/${course.id}`} style={{ color: "var(--text-tertiary)" }}>
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
