"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Users, UserCheck, TrendingUp, Calendar,
  Search, ChevronLeft, ChevronRight, BookOpen, Loader2,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"
import {
  instructorStudentsApi,
  type InstructorStudent,
  type InstructorStudentStats,
} from "@/lib/api/enrollments"
import { authStore } from "@/lib/auth-store"

const AVATAR_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#F97316"]

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function statusOf(s: InstructorStudent): "completed" | "active" | "inactive" {
  if (s.completedAt || s.progressPct === 100) return "completed"
  if (s.lastAccessedAt) {
    const daysSince = (Date.now() - new Date(s.lastAccessedAt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince <= 14) return "active"
  }
  return "inactive"
}

const STATUS_MAP = {
  active:    { label: "Active",    color: "var(--success)",       bg: "#10B98118" },
  inactive:  { label: "Inactive",  color: "var(--text-tertiary)", bg: "#33415518" },
  completed: { label: "Completed", color: "#60A5FA",              bg: "#3B82F618" },
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "var(--success)" : "var(--accent)"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium w-8 text-right" style={{ color: "var(--text-secondary)" }}>{pct}%</span>
    </div>
  )
}

function formatLastActive(ts: string | null): string {
  if (!ts) return "Never"
  const diff = Date.now() - new Date(ts).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 7)   return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

export default function StudentsPage() {
  const user = authStore.getUser()
  const [students, setStudents]       = useState<InstructorStudent[]>([])
  const [stats, setStats]             = useState<InstructorStudentStats | null>(null)
  const [loading, setLoading]         = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [search, setSearch]           = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "completed">("all")
  const [page, setPage]               = useState(0)
  const [totalPages, setTotalPages]   = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Stats load once
  useEffect(() => {
    instructorStudentsApi.stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await instructorStudentsApi.list({ q: search || undefined, page, size: 20 })
      setStudents(res.data)
      setTotalPages(res.totalPages || 1)
      setTotalElements(res.totalElements)
    } catch { setStudents([]) }
    finally { setLoading(false) }
  }, [search, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [search, statusFilter])

  const filtered = statusFilter === "all"
    ? students
    : students.filter((s) => statusOf(s) === statusFilter)

  const statCards = [
    { label: "Total Enrolled",   value: stats?.totalEnrolled  ?? "—", icon: Users,      color: "var(--accent)",   bg: "#3B82F615" },
    { label: "Active This Week", value: stats?.activeThisWeek ?? "—", icon: UserCheck,  color: "var(--success)",  bg: "#10B98115" },
    { label: "Avg. Progress",    value: stats ? `${stats.avgCompletion}%` : "—", icon: TrendingUp, color: "#8B5CF6", bg: "#8B5CF615" },
    { label: "New This Month",   value: stats?.newThisMonth   ?? "—", icon: Calendar,   color: "var(--warning)",  bg: "#F59E0B15" },
  ]

  return (
    <InstructorPageShell title="Students" user={{ name: user?.fullName ?? "Instructor", email: user?.email ?? "" }}>
      <div className="space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl p-4 shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{label}</p>
                <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ backgroundColor: bg }}>
                  <Icon size={15} style={{ color }} />
                </div>
              </div>
              {statsLoading
                ? <div className="h-7 w-16 rounded-lg animate-pulse" style={{ backgroundColor: "var(--border-default)" }} />
                : <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 max-w-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <div className="flex items-center gap-2">
            {(["all", "active", "inactive", "completed"] as const).map((s) => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors"
                style={{
                  backgroundColor: statusFilter === s ? "var(--border-default)" : "var(--bg-surface)",
                  color: statusFilter === s ? "var(--text-primary)" : "var(--text-tertiary)",
                  border: "1px solid var(--border-default)",
                }}>
                {s === "all" ? "All" : STATUS_MAP[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>

          {/* Header */}
          <div className="grid items-center px-5 py-3 text-xs font-semibold uppercase tracking-wide"
            style={{
              gridTemplateColumns: "1fr 110px 160px 130px 90px",
              borderBottom: "1px solid var(--border-default)",
              color: "var(--text-muted)",
            }}>
            <span>Student</span>
            <span className="hidden sm:block">Status</span>
            <span className="hidden md:block">Course</span>
            <span className="hidden md:block">Progress</span>
            <span className="hidden lg:block">Last Active</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={26} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users size={32} className="mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {students.length === 0 ? "No students enrolled yet." : "No students match this filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
              {filtered.map((s, i) => {
                const status = statusOf(s)
                const st = STATUS_MAP[status]
                const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
                return (
                  <div key={s.enrollmentId}
                    className="grid items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                    style={{ gridTemplateColumns: "1fr 110px 160px 130px 90px" }}>

                    {/* Identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      {s.avatarUrl ? (
                        <img src={s.avatarUrl} alt={s.fullName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: avatarColor }}>
                          {initials(s.fullName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{s.fullName}</p>
                        <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{s.email}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="hidden sm:block">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ color: st.color, backgroundColor: st.bg }}>
                        {st.label}
                      </span>
                    </div>

                    {/* Course */}
                    <div className="hidden md:block min-w-0">
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{s.courseTitle}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Enrolled {new Date(s.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="hidden md:block">
                      <ProgressBar pct={s.progressPct} />
                    </div>

                    {/* Last active */}
                    <div className="hidden lg:block">
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        {formatLastActive(s.lastAccessedAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination footer */}
          {!loading && totalElements > 0 && (
            <div className="flex items-center justify-between px-5 py-3 text-xs"
              style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-muted)" }}>
              <span>Showing {filtered.length} of {totalElements} enrollments</span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                    className="p-1 rounded-lg disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ color: "var(--text-tertiary)" }}>Page {page + 1} of {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="p-1 rounded-lg disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enrollment by course breakdown */}
        {!statsLoading && stats && stats.courseBreakdown.length > 0 && (
          <div className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <BookOpen size={15} style={{ color: "var(--accent)" }} /> Enrollment by Course
            </h3>
            <div className="space-y-3">
              {(() => {
                const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4"]
                const max = Math.max(...stats.courseBreakdown.map((c) => c.count), 1)
                return stats.courseBreakdown.map((c, i) => (
                  <div key={c.courseId} className="flex items-center gap-3">
                    <p className="text-xs w-52 truncate flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                      {c.courseTitle}
                    </p>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(c.count / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right" style={{ color: "var(--text-primary)" }}>
                      {c.count.toLocaleString()}
                    </span>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}
      </div>
    </InstructorPageShell>
  )
}
