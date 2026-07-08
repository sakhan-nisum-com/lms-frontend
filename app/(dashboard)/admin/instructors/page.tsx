"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { instructorsAdminApi, type InstructorSummary, type AdminUserStatus } from "@/lib/api/admin"
import { authStore } from "@/lib/auth-store"
import {
  Search, GraduationCap, BookOpen, Users, Loader2,
  ChevronLeft, ChevronRight, ChevronRight as ArrowRight,
  UserCheck, UserX, UserMinus,
} from "lucide-react"

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "Active",    color: "#34D399", bg: "#10B98118" },
  SUSPENDED: { label: "Suspended", color: "#F87171", bg: "#EF444418" },
  INACTIVE:  { label: "Inactive",  color: "var(--text-secondary)", bg: "#33415518" },
  PENDING:   { label: "Pending",   color: "#FCD34D", bg: "#F59E0B18" },
}

function Avatar({ name, size = 38 }: { name: string; size?: number }) {
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

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)
  const user = authStore.getUser()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await instructorsAdminApi.list({ q: search || undefined, page, size: 15 })
      setInstructors(res.data)
      setTotalPages(res.totalPages || 1)
      setTotalElements(res.totalElements)
    } catch { setInstructors([]) }
    finally { setLoading(false) }
  }, [search, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [search])

  function showToast(text: string, ok: boolean) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function updateStatus(id: string, status: AdminUserStatus) {
    setActionLoading(id + status)
    try {
      await instructorsAdminApi.updateStatus(id, status)
      setInstructors((prev) => prev.map((i) => i.id === id ? { ...i, status } : i))
      showToast(`Instructor marked as ${status.toLowerCase()}.`, true)
    } catch {
      showToast("Failed to update status.", false)
    } finally { setActionLoading(null) }
  }

  const totalCourses = instructors.reduce((s, i) => s + i.courseCount, 0)
  const totalStudents = instructors.reduce((s, i) => s + i.totalStudents, 0)
  const activeCount = instructors.filter((i) => i.status === "ACTIVE").length

  const stats = [
    { label: "Total Tutors",   value: totalElements, icon: GraduationCap, color: "#8B5CF6" },
    { label: "Active",         value: activeCount,   icon: UserCheck,     color: "#10B981" },
    { label: "Total Courses",  value: totalCourses,  icon: BookOpen,      color: "#3B82F6" },
    { label: "Total Students", value: totalStudents, icon: Users,         color: "#F59E0B" },
  ]

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{ backgroundColor: toast.ok ? "#10B98120" : "#EF444420", color: toast.ok ? "#10B981" : "#EF4444", border: `1px solid ${toast.ok ? "#10B98140" : "#EF444440"}` }}>
          {toast.text}
        </div>
      )}

      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Tutors</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage all instructors — view profiles, courses, students, and control access.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</p>
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : instructors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <GraduationCap size={36} className="mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No tutors found</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                    {["Tutor", "Bio", "Status", "Courses", "Students", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {instructors.map((inst, i) => {
                    const s = STATUS_STYLES[inst.status] ?? STATUS_STYLES.ACTIVE
                    return (
                      <tr key={inst.id}
                        style={{ borderBottom: i < instructors.length - 1 ? "1px solid var(--border-default)" : "none" }}
                        className="hover:bg-white/[0.02] transition-colors">

                        {/* Identity */}
                        <td className="px-4 py-3.5" style={{ minWidth: 200 }}>
                          <div className="flex items-center gap-3">
                            {inst.avatarUrl ? (
                              <img src={inst.avatarUrl} alt={inst.fullName}
                                className="rounded-full object-cover flex-shrink-0"
                                style={{ width: 38, height: 38 }} />
                            ) : (
                              <Avatar name={inst.fullName} />
                            )}
                            <div>
                              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{inst.fullName}</p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{inst.email}</p>
                              {inst.department && (
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{inst.department}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Bio */}
                        <td className="px-4 py-3.5" style={{ maxWidth: 240 }}>
                          {inst.bio ? (
                            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                              {inst.bio}
                            </p>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ color: s.color, backgroundColor: s.bg }}>
                            {s.label}
                          </span>
                        </td>

                        {/* Courses */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <BookOpen size={13} style={{ color: "#3B82F6" }} />
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{inst.courseCount}</span>
                          </div>
                        </td>

                        {/* Students */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Users size={13} style={{ color: "#10B981" }} />
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{inst.totalStudents}</span>
                          </div>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {new Date(inst.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {/* Activate */}
                            {inst.status !== "ACTIVE" && (
                              <button
                                onClick={() => updateStatus(inst.id, "ACTIVE")}
                                disabled={actionLoading === inst.id + "ACTIVE"}
                                title="Activate"
                                className="flex items-center justify-center w-7 h-7 rounded-lg disabled:opacity-50"
                                style={{ backgroundColor: "#10B98118", color: "#34D399" }}>
                                {actionLoading === inst.id + "ACTIVE"
                                  ? <Loader2 size={11} className="animate-spin" />
                                  : <UserCheck size={12} />}
                              </button>
                            )}
                            {/* Inactive */}
                            {inst.status !== "INACTIVE" && (
                              <button
                                onClick={() => updateStatus(inst.id, "INACTIVE")}
                                disabled={actionLoading === inst.id + "INACTIVE"}
                                title="Mark Inactive"
                                className="flex items-center justify-center w-7 h-7 rounded-lg disabled:opacity-50"
                                style={{ backgroundColor: "#64748B18", color: "var(--text-secondary)" }}>
                                {actionLoading === inst.id + "INACTIVE"
                                  ? <Loader2 size={11} className="animate-spin" />
                                  : <UserMinus size={12} />}
                              </button>
                            )}
                            {/* Suspend */}
                            {inst.status !== "SUSPENDED" && (
                              <button
                                onClick={() => updateStatus(inst.id, "SUSPENDED")}
                                disabled={actionLoading === inst.id + "SUSPENDED"}
                                title="Suspend"
                                className="flex items-center justify-center w-7 h-7 rounded-lg disabled:opacity-50"
                                style={{ backgroundColor: "#EF444418", color: "#F87171" }}>
                                {actionLoading === inst.id + "SUSPENDED"
                                  ? <Loader2 size={11} className="animate-spin" />
                                  : <UserX size={12} />}
                              </button>
                            )}
                            {/* View profile */}
                            <Link href={`/admin/instructors/${inst.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                              style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                              View <ArrowRight size={11} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--border-default)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{totalElements} tutors</p>
                  <div className="flex items-center gap-2">
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
