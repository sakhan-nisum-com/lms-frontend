"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { usePlatformUsers } from "@/lib/hooks/usePlatformUsers"
import type { PlatformRole, PlatformUserStatus } from "@/lib/data/platformUsers"
import {
  ChevronLeft, Pencil, Trash2, Mail, Building2, MapPin, Calendar,
  Clock, BookOpen, GraduationCap, CheckCircle2,
} from "lucide-react"

const statusOptions: { value: PlatformUserStatus; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "#10B981" },
  { value: "inactive", label: "Inactive", color: "#64748B" },
  { value: "pending", label: "Pending", color: "#F59E0B" },
  { value: "suspended", label: "Suspended", color: "#EF4444" },
]

const roleColors: Record<PlatformRole, React.CSSProperties> = {
  student: { backgroundColor: "#3B82F620", color: "#60A5FA" },
  tutor: { backgroundColor: "#8B5CF620", color: "#A78BFA" },
  admin: { backgroundColor: "#F59E0B20", color: "#FCD34D" },
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { users, setStatus, setRole, updateUser, removeUser } = usePlatformUsers()
  const user = users.find((u) => u.id === id)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [department, setDepartment] = useState("")
  const [location, setLocation] = useState("")

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setDepartment(user.department)
      setLocation(user.location)
    }
  }, [user])

  if (!user) {
    return (
      <DashboardLayout role="admin" userName="Morgan Patel">
        <div className="max-w-3xl">
          <Link href="/admin/users" className="flex items-center gap-1.5 text-sm w-fit mb-6" style={{ color: "#64748B" }}>
            <ChevronLeft size={15} /> Back to Users
          </Link>
          <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
            <p className="text-sm" style={{ color: "#475569" }}>User not found. It may have been removed.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleSave = () => {
    if (!name.trim() || !email.trim()) return
    updateUser(user.id, { name: name.trim(), email: email.trim(), department: department.trim(), location: location.trim() })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setName(user.name)
    setEmail(user.email)
    setDepartment(user.department)
    setLocation(user.location)
    setIsEditing(false)
  }

  const handleRemove = () => {
    removeUser(user.id)
    router.push("/admin/users")
  }

  const currentStatus = statusOptions.find((s) => s.value === user.status) ?? statusOptions[0]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="max-w-3xl space-y-6">
        <Link href="/admin/users" className="flex items-center gap-1.5 text-sm w-fit" style={{ color: "#64748B" }}>
          <ChevronLeft size={15} /> Back to Users
        </Link>

        {/* Profile header */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold text-white flex-shrink-0"
                style={{ backgroundColor: "#3B82F6" }}
              >
                {user.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-white">{user.name}</h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={roleColors[user.role]}>
                    {user.role}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${currentStatus.color}20`, color: currentStatus.color }}>
                    {currentStatus.label}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>{user.email}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: "#334155", color: "#CBD5E1" }}
              >
                <Pencil size={14} /> Edit Profile
              </button>
            )}
          </div>

          {/* Meta row */}
          {!isEditing && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6" style={{ borderTop: "1px solid #334155" }}>
              <div>
                <p className="text-xs flex items-center gap-1.5" style={{ color: "#64748B" }}><Building2 size={12} /> Department</p>
                <p className="text-sm font-medium text-white mt-1">{user.department}</p>
              </div>
              <div>
                <p className="text-xs flex items-center gap-1.5" style={{ color: "#64748B" }}><MapPin size={12} /> Location</p>
                <p className="text-sm font-medium text-white mt-1">{user.location}</p>
              </div>
              <div>
                <p className="text-xs flex items-center gap-1.5" style={{ color: "#64748B" }}><Calendar size={12} /> Joined</p>
                <p className="text-sm font-medium text-white mt-1">{user.joinedDate}</p>
              </div>
              <div>
                <p className="text-xs flex items-center gap-1.5" style={{ color: "#64748B" }}><Clock size={12} /> Last Active</p>
                <p className="text-sm font-medium text-white mt-1">{user.lastActive}</p>
              </div>
              {user.role === "student" && user.coursesEnrolled !== undefined && (
                <div>
                  <p className="text-xs flex items-center gap-1.5" style={{ color: "#64748B" }}><BookOpen size={12} /> Courses Enrolled</p>
                  <p className="text-sm font-medium text-white mt-1">{user.coursesEnrolled}</p>
                </div>
              )}
              {user.role === "tutor" && user.coursesTaught !== undefined && (
                <div>
                  <p className="text-xs flex items-center gap-1.5" style={{ color: "#64748B" }}><GraduationCap size={12} /> Courses Taught</p>
                  <p className="text-sm font-medium text-white mt-1">{user.coursesTaught}</p>
                </div>
              )}
            </div>
          )}

          {/* Edit form */}
          {isEditing && (
            <div className="space-y-4 mt-6 pt-6" style={{ borderTop: "1px solid #334155" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Department</label>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || !email.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                  style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <h2 className="text-sm font-bold text-white mb-1">Role</h2>
          <p className="text-xs mb-3" style={{ color: "#64748B" }}>Controls which dashboard and permissions this person gets.</p>
          <div className="flex gap-2 flex-wrap">
            {(["student", "tutor", "admin"] as PlatformRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(user.id, r)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold capitalize"
                style={{
                  backgroundColor: user.role === r ? roleColors[r].backgroundColor : "#334155",
                  color: user.role === r ? roleColors[r].color : "#94A3B8",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <h2 className="text-sm font-bold text-white mb-1">Account Status</h2>
          <p className="text-xs mb-3" style={{ color: "#64748B" }}>
            Suspended and inactive accounts lose dashboard access until reactivated.
          </p>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((s) => {
              const active = user.status === s.value
              return (
                <button
                  key={s.value}
                  onClick={() => setStatus(user.id, s.value)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: active ? `${s.color}20` : "#334155", color: active ? s.color : "#94A3B8" }}
                >
                  {active && <CheckCircle2 size={12} />} {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <h2 className="text-sm font-bold text-white mb-3">Contact</h2>
          <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-sm" style={{ color: "#3B82F6" }}>
            <Mail size={14} /> {user.email}
          </a>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #EF444430" }}>
          <h2 className="text-sm font-bold text-white mb-1">Danger Zone</h2>
          <p className="text-xs mb-3" style={{ color: "#64748B" }}>
            Permanently remove this user from the platform. This cannot be undone.
          </p>
          <button
            onClick={handleRemove}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg"
            style={{ backgroundColor: "#EF444420", color: "#F87171" }}
          >
            <Trash2 size={13} /> Remove User
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
