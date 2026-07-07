"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { coursesApi, type ApiCourse } from "@/lib/api/courses"
import { authStore } from "@/lib/auth-store"
import {
  Search, BookOpen, CheckCircle2, XCircle, Eye, Loader2,
  ChevronLeft, ChevronRight, Star, Users, Play,
} from "lucide-react"

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED:      { label: "Published",  color: "#34D399", bg: "#10B98120" },
  DRAFT:          { label: "Draft",      color: "var(--text-secondary)", bg: "#64748B20" },
  PENDING_REVIEW: { label: "In Review",  color: "#FCD34D", bg: "#F59E0B20" },
  ARCHIVED:       { label: "Archived",   color: "var(--text-muted)", bg: "#33415520" },
  REJECTED:       { label: "Rejected",   color: "#F87171", bg: "#EF444420" },
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "#10B981", INTERMEDIATE: "#F59E0B", ADVANCED: "#EF4444",
}

const TABS = ["ALL", "PENDING_REVIEW", "PUBLISHED", "DRAFT", "REJECTED"]

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: s.color, backgroundColor: s.bg }}>
      {s.label}
    </span>
  )
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("ALL")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const user = authStore.getUser()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await coursesApi.list(page, 12, search || undefined, tab !== "ALL" ? tab : undefined)
      setCourses(res.data)
      setTotalPages(res.totalPages || 1)
    } catch { setCourses([]) }
    finally { setLoading(false) }
  }, [page, search, tab])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [search, tab])

  async function approve(id: string) {
    setActionLoading(id)
    try {
      await coursesApi.approve(id)
      setCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: "PUBLISHED" } : c))
    } finally { setActionLoading(null) }
  }

  async function reject(id: string) {
    if (!rejectReason.trim()) return
    setActionLoading(id)
    try {
      await coursesApi.reject(id, rejectReason)
      setCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: "REJECTED" } : c))
      setRejectId(null)
      setRejectReason("")
    } finally { setActionLoading(null) }
  }

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Course Management</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Review, approve, and manage all platform courses.
            </p>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ backgroundColor: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "#fff" : "var(--text-secondary)" }}>
                {STATUS_STYLES[t]?.label ?? "All"}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses…"
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
          </div>
        </div>

        {/* Reject modal */}
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "#00000080" }}>
            <div className="rounded-2xl p-6 w-full max-w-md" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h3 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Reject Course</h3>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
                placeholder="Reason for rejection (required)…"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
              <div className="flex gap-2 mt-4 justify-end">
                <button onClick={() => { setRejectId(null); setRejectReason("") }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                  Cancel
                </button>
                <button onClick={() => reject(rejectId)} disabled={!rejectReason.trim() || actionLoading === rejectId}
                  className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: "#EF4444", color: "#fff" }}>
                  {actionLoading === rejectId ? "Rejecting…" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course table */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <BookOpen size={36} className="mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No courses found</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                    {["Course", "Instructor", "Category / Level", "Students", "Rating", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, i) => {
                    const color = LEVEL_COLORS[course.level] ?? "#3B82F6"
                    const lessonCount = course.sections.reduce((a, s) => a + s.lessons.length, 0)
                    return (
                      <tr key={course.id} style={{ borderBottom: i < courses.length - 1 ? "1px solid var(--border-default)" : "none" }}
                        className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                              style={{ backgroundColor: color + "20" }}>
                              <Play size={13} style={{ color }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>{course.title}</p>
                              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{lessonCount} lessons</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {course.instructorId.slice(0, 8)}…
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{course.category ?? "—"}</div>
                          <div className="text-xs font-medium mt-0.5" style={{ color }}>{course.level}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <Users size={11} className="inline mr-1" />{course.studentsCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: "var(--warning)" }}>
                          {course.rating > 0 ? <><Star size={11} className="inline mr-1" />{course.rating.toFixed(1)}</> : "—"}
                        </td>
                        <td className="px-4 py-3.5"><StatusBadge status={course.status} /></td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/admin/courses/${course.id}`}
                              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                              style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }} title="View">
                              <Eye size={12} />
                            </Link>
                            {course.status === "PENDING_REVIEW" && (
                              <>
                                <button onClick={() => approve(course.id)}
                                  disabled={actionLoading === course.id}
                                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors disabled:opacity-50"
                                  style={{ backgroundColor: "#10B98120", color: "#34D399" }} title="Approve">
                                  {actionLoading === course.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                </button>
                                <button onClick={() => setRejectId(course.id)}
                                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                                  style={{ backgroundColor: "#EF444420", color: "#F87171" }} title="Reject">
                                  <XCircle size={12} />
                                </button>
                              </>
                            )}
                            {course.status === "PUBLISHED" && (
                              <button onClick={() => { setRejectId(course.id) }}
                                className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                                style={{ backgroundColor: "#EF444420", color: "#F87171" }} title="Unpublish">
                                <XCircle size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 px-4 py-3" style={{ borderTop: "1px solid var(--border-default)" }}>
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                    className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Page {page + 1} of {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
