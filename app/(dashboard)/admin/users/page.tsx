"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { usersApi, type AdminUser, type AdminUserRole, type AdminUserStatus } from "@/lib/api/admin"
import { authStore } from "@/lib/auth-store"
import {
  Search, Users, UserCheck, UserX, Loader2,
  ChevronLeft, ChevronRight, Trash2, Shield, GraduationCap, BookOpen,
} from "lucide-react"

const STATUS_STYLES: Record<AdminUserStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "Active",    color: "var(--success)", bg: "#10B98118" },
  INACTIVE:  { label: "Inactive",  color: "var(--text-secondary)", bg: "#33415518" },
  SUSPENDED: { label: "Suspended", color: "var(--danger)", bg: "#EF444418" },
  PENDING:   { label: "Pending",   color: "var(--warning)", bg: "#F59E0B18" },
}

const ROLE_STYLES: Record<AdminUserRole, { label: string; color: string; bg: string; Icon: typeof Users }> = {
  STUDENT:    { label: "Student",    color: "#60A5FA", bg: "#3B82F618", Icon: GraduationCap },
  INSTRUCTOR: { label: "Instructor", color: "#A78BFA", bg: "#8B5CF618", Icon: BookOpen },
  ADMIN:      { label: "Admin",      color: "#FCD34D", bg: "#F59E0B18", Icon: Shield },
}

const ROLES: (AdminUserRole | "ALL")[] = ["ALL", "STUDENT", "INSTRUCTOR", "ADMIN"]
const STATUSES: (AdminUserStatus | "ALL")[] = ["ALL", "ACTIVE", "SUSPENDED", "PENDING"]

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
  const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#14B8A6"]
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className="flex items-center justify-center rounded-full flex-shrink-0 font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.33 }}>
      {initials}
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<AdminUserStatus | "ALL">("ALL")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)
  const currentUser = authStore.getUser()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await usersApi.list({
        q: search || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page,
        size: 15,
      })
      setUsers(res.data)
      setTotalPages(res.totalPages || 1)
      setTotalElements(res.totalElements)
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [search, roleFilter, statusFilter])

  async function updateStatus(id: string, status: AdminUserStatus) {
    setActionLoading(id + status)
    try {
      await usersApi.updateStatus(id, status)
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u))
    } finally { setActionLoading(null) }
  }

  async function deleteUser(user: AdminUser) {
    setActionLoading("delete-" + user.id)
    try {
      await usersApi.delete(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setConfirmDelete(null)
    } finally { setActionLoading(null) }
  }

  const stats = [
    { label: "Total Users", value: totalElements, icon: Users, color: "#3B82F6" },
    { label: "Students", value: users.filter((u) => u.role === "STUDENT").length, icon: GraduationCap, color: "#10B981" },
    { label: "Instructors", value: users.filter((u) => u.role === "INSTRUCTOR").length, icon: BookOpen, color: "#8B5CF6" },
    { label: "Admins", value: users.filter((u) => u.role === "ADMIN").length, icon: Shield, color: "#F59E0B" },
  ]

  return (
    <DashboardLayout role="admin" userName={currentUser?.fullName ?? "Admin"}>
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>User Management</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage all users, statuses, and roles across the platform.
          </p>
        </div>

        {/* Stats row */}
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
          </div>
          <div className="flex gap-2">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as AdminUserRole | "ALL")}
              className="px-3 py-2 rounded-xl text-xs outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
              {ROLES.map((r) => <option key={r} value={r}>{r === "ALL" ? "All Roles" : ROLE_STYLES[r as AdminUserRole].label}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AdminUserStatus | "ALL")}
              className="px-3 py-2 rounded-xl text-xs outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
              {STATUSES.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : STATUS_STYLES[s as AdminUserStatus].label}</option>)}
            </select>
          </div>
        </div>

        {/* Delete confirm modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "#00000080" }}>
            <div className="rounded-2xl p-6 w-full max-w-md" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Delete User?</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                This will permanently delete <strong>{confirmDelete.fullName}</strong> ({confirmDelete.email}). This cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                  Cancel
                </button>
                <button onClick={() => deleteUser(confirmDelete)}
                  disabled={!!actionLoading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: "#EF4444", color: "#fff" }}>
                  {actionLoading?.startsWith("delete-") ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Users size={36} className="mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No users found</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                    {["User", "Role", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    const role = ROLE_STYLES[user.role]
                    const status = STATUS_STYLES[user.status]
                    const isSelf = user.id === currentUser?.id
                    return (
                      <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? "1px solid var(--border-default)" : "none" }}
                        className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.fullName} />
                            <div>
                              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{user.fullName} {isSelf && <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>(you)</span>}</p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ color: role.color, backgroundColor: role.bg }}>
                            <role.Icon size={11} /> {role.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ color: status.color, backgroundColor: status.bg }}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {!isSelf && user.status !== "SUSPENDED" && (
                              <button onClick={() => updateStatus(user.id, "SUSPENDED")}
                                disabled={actionLoading === user.id + "SUSPENDED"}
                                title="Suspend" className="flex items-center justify-center w-7 h-7 rounded-lg disabled:opacity-50"
                                style={{ backgroundColor: "#EF444418", color: "#F87171" }}>
                                {actionLoading === user.id + "SUSPENDED" ? <Loader2 size={11} className="animate-spin" /> : <UserX size={12} />}
                              </button>
                            )}
                            {!isSelf && user.status === "SUSPENDED" && (
                              <button onClick={() => updateStatus(user.id, "ACTIVE")}
                                disabled={actionLoading === user.id + "ACTIVE"}
                                title="Activate" className="flex items-center justify-center w-7 h-7 rounded-lg disabled:opacity-50"
                                style={{ backgroundColor: "#10B98118", color: "#34D399" }}>
                                {actionLoading === user.id + "ACTIVE" ? <Loader2 size={11} className="animate-spin" /> : <UserCheck size={12} />}
                              </button>
                            )}
                            {!isSelf && (
                              <button onClick={() => setConfirmDelete(user)}
                                title="Delete" className="flex items-center justify-center w-7 h-7 rounded-lg"
                                style={{ backgroundColor: "#EF444418", color: "#F87171" }}>
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--border-default)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{totalElements} total users</p>
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
