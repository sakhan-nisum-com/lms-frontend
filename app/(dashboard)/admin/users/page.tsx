"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { usePlatformUsers } from "@/lib/hooks/usePlatformUsers"
import type { PlatformRole, PlatformUserStatus } from "@/lib/data/platformUsers"
import {
  Search, Plus, Users, UserCheck, UserX, UserMinus, Clock, Trash2, Pencil,
} from "lucide-react"

const statusColors: Record<PlatformUserStatus, React.CSSProperties> = {
  active: { backgroundColor: "#10B98120", color: "#34D399" },
  inactive: { backgroundColor: "#64748B20", color: "#94A3B8" },
  suspended: { backgroundColor: "#EF444420", color: "#F87171" },
  pending: { backgroundColor: "#F59E0B20", color: "#FCD34D" },
}

const roleColors: Record<PlatformRole, React.CSSProperties> = {
  student: { backgroundColor: "#3B82F620", color: "#60A5FA" },
  tutor: { backgroundColor: "#8B5CF620", color: "#A78BFA" },
  admin: { backgroundColor: "#F59E0B20", color: "#FCD34D" },
}

export default function AdminUsersPage() {
  const { users, addUser, setStatus, setRole, removeUser } = usePlatformUsers()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | PlatformRole>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | PlatformUserStatus>("all")
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setNewUserRole] = useState<PlatformRole>("student")
  const [department, setDepartment] = useState("")
  const [location, setLocation] = useState("")

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false
      if (statusFilter !== "all" && u.status !== statusFilter) return false
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [users, roleFilter, statusFilter, search])

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "#3B82F6" },
    { label: "Active", value: users.filter((u) => u.status === "active").length, icon: UserCheck, color: "#10B981" },
    { label: "Pending", value: users.filter((u) => u.status === "pending").length, icon: Clock, color: "#F59E0B" },
    { label: "Inactive", value: users.filter((u) => u.status === "inactive").length, icon: UserMinus, color: "#64748B" },
    { label: "Suspended", value: users.filter((u) => u.status === "suspended").length, icon: UserX, color: "#EF4444" },
  ]

  const resetForm = () => {
    setName("")
    setEmail("")
    setNewUserRole("student")
    setDepartment("")
    setLocation("")
  }

  const handleCreate = () => {
    if (!name.trim() || !email.trim()) return
    addUser({ name: name.trim(), email: email.trim(), role, department: department.trim() || "Unassigned", location: location.trim() || "Remote" })
    resetForm()
    setShowForm(false)
  }

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              Manage students, tutors, and admins across the platform.
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Plus size={16} /> {showForm ? "Cancel" : "Add User"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ backgroundColor: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jamie Wong"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jamie.wong@company.com"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Role</label>
                <select
                  value={role}
                  onChange={(e) => setNewUserRole(e.target.value as PlatformRole)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Department</label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Engineering"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { resetForm(); setShowForm(false) }}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#334155", color: "#94A3B8" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || !email.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ backgroundColor: "#3B82F6", color: "#fff" }}
              >
                Add User
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | PlatformRole)}
            className="px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
          >
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="tutor">Tutors</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | PlatformUserStatus)}
            className="px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["User", "Role", "Department", "Status", "Last Active", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  className="transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #334155" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#3B82F6" }}>
                        {u.avatar}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/users/${u.id}`} className="font-medium text-white truncate hover:underline block">
                          {u.name}
                        </Link>
                        <p className="text-xs truncate" style={{ color: "#64748B" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => setRole(u.id, e.target.value as PlatformRole)}
                      className="px-2 py-1 rounded-full text-xs font-semibold capitalize outline-none border-none"
                      style={roleColors[u.role]}
                    >
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-4" style={{ color: "#94A3B8" }}>{u.department}</td>
                  <td className="px-5 py-4">
                    <select
                      value={u.status}
                      onChange={(e) => setStatus(u.id, e.target.value as PlatformUserStatus)}
                      className="px-2 py-1 rounded-full text-xs font-semibold capitalize outline-none border-none"
                      style={statusColors[u.status]}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-5 py-4" style={{ color: "#94A3B8" }}>{u.lastActive}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/users/${u.id}`}
                        title="Edit"
                        className="flex items-center justify-center w-7 h-7 rounded-lg"
                        style={{ backgroundColor: "#33415560", color: "#94A3B8" }}
                      >
                        <Pencil size={13} />
                      </Link>
                      <button
                        onClick={() => removeUser(u.id)}
                        title="Remove"
                        className="flex items-center justify-center w-7 h-7 rounded-lg"
                        style={{ backgroundColor: "#EF444420", color: "#F87171" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: "#475569" }}>
                    No users match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
