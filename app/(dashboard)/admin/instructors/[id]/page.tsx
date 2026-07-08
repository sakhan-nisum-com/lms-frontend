"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { instructorsAdminApi, type InstructorSummary, type InstructorCourse, type EnrolledStudent, type AdminUserStatus } from "@/lib/api/admin"
import { authStore } from "@/lib/auth-store"
import {
  ArrowLeft, BookOpen, Users, Star, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, Clock, GraduationCap, BarChart3,
  UserCheck, UserX, UserMinus, MapPin, Phone, Mail,
} from "lucide-react"

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED:      { label: "Published",  color: "#34D399", bg: "#10B98118" },
  DRAFT:          { label: "Draft",      color: "var(--text-secondary)", bg: "#64748B18" },
  PENDING_REVIEW: { label: "In Review",  color: "#FCD34D", bg: "#F59E0B18" },
  ARCHIVED:       { label: "Archived",   color: "var(--text-muted)", bg: "#33415518" },
  REJECTED:       { label: "Rejected",   color: "#F87171", bg: "#EF444418" },
}

const USER_STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "Active",    color: "#34D399", bg: "#10B98118" },
  SUSPENDED: { label: "Suspended", color: "#F87171", bg: "#EF444418" },
  INACTIVE:  { label: "Inactive",  color: "var(--text-secondary)", bg: "#33415518" },
  PENDING:   { label: "Pending",   color: "#FCD34D", bg: "#F59E0B18" },
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "#10B981", INTERMEDIATE: "#F59E0B", ADVANCED: "#EF4444", ALL_LEVELS: "#8B5CF6",
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
  const colors = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"]
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className="flex items-center justify-center rounded-full flex-shrink-0 font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.35 }}>
      {initials}
    </div>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#3B82F6"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: "var(--border-default)" }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{pct}%</span>
    </div>
  )
}

function CourseStudentsPanel({ courseId }: { courseId: string }) {
  const [students, setStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    instructorsAdminApi.getCourseStudents(courseId, page, 10)
      .then((res) => {
        setStudents(res.data)
        setTotalPages(res.totalPages || 1)
        setTotal(res.totalElements)
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [courseId, page])

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <GraduationCap size={28} className="mb-2" style={{ color: "var(--text-muted)" }} />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No students enrolled yet</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold mb-3 px-1" style={{ color: "var(--text-tertiary)" }}>
        {total} enrolled student{total !== 1 ? "s" : ""}
      </p>
      <div className="space-y-2">
        {students.map((s) => (
          <div key={s.enrollmentId} className="flex items-center gap-3 p-2.5 rounded-xl"
            style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
            {s.avatarUrl ? (
              <img src={s.avatarUrl} alt={s.fullName} className="rounded-full object-cover flex-shrink-0" style={{ width: 30, height: 30 }} />
            ) : (
              <Avatar name={s.fullName} size={30} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{s.fullName}</p>
                {s.completedAt && (
                  <CheckCircle2 size={12} style={{ color: "#10B981" }} className="flex-shrink-0" />
                )}
              </div>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{s.email}</p>
            </div>
            <div className="w-28 flex-shrink-0">
              <ProgressBar pct={s.progressPct} />
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {new Date(s.enrolledAt).toLocaleDateString()}
              </p>
              {s.totalTimeSpentSeconds > 0 && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {Math.round(s.totalTimeSpentSeconds / 60)}m spent
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3 pt-3"
          style={{ borderTop: "1px solid var(--border-default)" }}>
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="text-xs px-2 py-1 rounded-lg disabled:opacity-30"
            style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
            Prev
          </button>
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="text-xs px-2 py-1 rounded-lg disabled:opacity-30"
            style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function CourseCard({ course }: { course: InstructorCourse }) {
  const [expanded, setExpanded] = useState(false)
  const s = STATUS_STYLES[course.status] ?? STATUS_STYLES.DRAFT
  const levelColor = LEVEL_COLORS[course.level] ?? "#8B5CF6"

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
      {/* Course header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#3B82F618" }}>
            <BookOpen size={16} style={{ color: "#3B82F6" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{course.title}</p>
                {course.titleAr && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-arabic)", direction: "rtl" }}>
                    {course.titleAr}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                style={{ color: s.color, backgroundColor: s.bg }}>
                {s.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {course.category && (
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{course.category}</span>
              )}
              <span className="text-xs font-semibold" style={{ color: levelColor }}>{course.level.replace("_", " ")}</span>
              <div className="flex items-center gap-1">
                <Star size={11} style={{ color: "#FCD34D" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{course.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {course.isFree ? "Free" : `$${course.price}`}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-default)" }}>
          <div className="flex items-center gap-1.5">
            <Users size={13} style={{ color: "#10B981" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{course.enrolledCount}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>enrolled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 size={13} style={{ color: "#8B5CF6" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{course.studentsCount}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>total students</span>
          </div>
          <div className="ml-auto">
            {course.enrolledCount > 0 && (
              <button onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                <Users size={11} />
                Students
                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Students panel */}
      {expanded && (
        <div className="px-4 pb-4 pt-2" style={{ borderTop: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface-muted)" }}>
          <CourseStudentsPanel courseId={course.id} />
        </div>
      )}
    </div>
  )
}

export default function InstructorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [instructor, setInstructor] = useState<InstructorSummary | null>(null)
  const [courses, setCourses] = useState<InstructorCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<AdminUserStatus | null>(null)
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)
  const user = authStore.getUser()

  useEffect(() => {
    Promise.all([
      instructorsAdminApi.getById(id),
      instructorsAdminApi.getCourses(id),
    ])
      .then(([inst, crs]) => {
        setInstructor(inst)
        setCourses(crs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  function showToast(text: string, ok: boolean) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function updateStatus(status: AdminUserStatus) {
    setActionLoading(status)
    try {
      await instructorsAdminApi.updateStatus(id, status)
      setInstructor((prev) => prev ? { ...prev, status } : prev)
      showToast(`Tutor marked as ${status.toLowerCase()}.`, true)
    } catch {
      showToast("Failed to update status.", false)
    } finally { setActionLoading(null) }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      </DashboardLayout>
    )
  }

  if (!instructor) {
    return (
      <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Instructor not found.</p>
        </div>
      </DashboardLayout>
    )
  }

  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length

  const statusStyle = USER_STATUS_STYLES[instructor.status] ?? USER_STATUS_STYLES.ACTIVE

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{ backgroundColor: toast.ok ? "#10B98120" : "#EF444420", color: toast.ok ? "#10B981" : "#EF4444", border: `1px solid ${toast.ok ? "#10B98140" : "#EF444440"}` }}>
          {toast.text}
        </div>
      )}

      <div className="space-y-6 max-w-5xl">
        {/* Back */}
        <Link href="/admin/instructors"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft size={14} /> Back to Tutors
        </Link>

        {/* Instructor profile card */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="flex items-start gap-4">
            {instructor.avatarUrl ? (
              <img src={instructor.avatarUrl} alt={instructor.fullName}
                className="rounded-2xl object-cover flex-shrink-0" style={{ width: 72, height: 72 }} />
            ) : (
              <Avatar name={instructor.fullName} size={72} />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{instructor.fullName}</h1>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
                      {statusStyle.label}
                    </span>
                  </div>
                  {instructor.fullNameAr && (
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-arabic)", direction: "rtl" }}>
                      {instructor.fullNameAr}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <Mail size={11} /> {instructor.email}
                    </div>
                    {instructor.department && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        <GraduationCap size={11} /> {instructor.department}
                      </div>
                    )}
                    {instructor.lastLoginAt && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        <Clock size={11} /> Last active {new Date(instructor.lastLoginAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {instructor.status !== "ACTIVE" && (
                    <button
                      onClick={() => updateStatus("ACTIVE")}
                      disabled={actionLoading === "ACTIVE"}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#10B98118", color: "#34D399", border: "1px solid #10B98130" }}>
                      {actionLoading === "ACTIVE" ? <Loader2 size={11} className="animate-spin" /> : <UserCheck size={12} />}
                      Activate
                    </button>
                  )}
                  {instructor.status !== "INACTIVE" && (
                    <button
                      onClick={() => updateStatus("INACTIVE")}
                      disabled={actionLoading === "INACTIVE"}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#64748B18", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                      {actionLoading === "INACTIVE" ? <Loader2 size={11} className="animate-spin" /> : <UserMinus size={12} />}
                      Deactivate
                    </button>
                  )}
                  {instructor.status !== "SUSPENDED" && (
                    <button
                      onClick={() => updateStatus("SUSPENDED")}
                      disabled={actionLoading === "SUSPENDED"}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#EF444418", color: "#F87171", border: "1px solid #EF444430" }}>
                      {actionLoading === "SUSPENDED" ? <Loader2 size={11} className="animate-spin" /> : <UserX size={12} />}
                      Suspend
                    </button>
                  )}
                </div>
              </div>
              {instructor.bio && (
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{instructor.bio}</p>
              )}
            </div>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5" style={{ borderTop: "1px solid var(--border-default)" }}>
            {[
              { label: "Total Courses", value: instructor.courseCount, icon: BookOpen, color: "#3B82F6" },
              { label: "Published", value: publishedCourses, icon: CheckCircle2, color: "#10B981" },
              { label: "Total Students", value: instructor.totalStudents, icon: Users, color: "#8B5CF6" },
              { label: "Joined", value: new Date(instructor.createdAt).toLocaleDateString(), icon: GraduationCap, color: "#F59E0B" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ backgroundColor: color + "20" }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Courses */}
        <div>
          <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Courses ({courses.length})
          </h2>
          {courses.length === 0 ? (
            <div className="rounded-2xl flex flex-col items-center justify-center py-16"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <BookOpen size={32} className="mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No courses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
