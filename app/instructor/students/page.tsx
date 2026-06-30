"use client"

import { useState } from "react"
import {
  Users,
  UserCheck,
  TrendingUp,
  Calendar,
  Search,
  ChevronDown,
  MoreHorizontal,
  Mail,
  BookOpen,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"

const STUDENTS = [
  {
    id: 1,
    name: "Sarah Mitchell",
    email: "sarah.m@example.com",
    courses: ["React & TypeScript Masterclass", "Advanced CSS & Animation"],
    progress: 87,
    lastActive: "2 hrs ago",
    joined: "Mar 12, 2025",
    status: "active",
    completions: 1,
  },
  {
    id: 2,
    name: "James Carter",
    email: "jcarter@example.com",
    courses: ["Node.js REST API Development"],
    progress: 42,
    lastActive: "1 day ago",
    joined: "Apr 3, 2025",
    status: "active",
    completions: 0,
  },
  {
    id: 3,
    name: "Priya Nair",
    email: "priya.nair@example.com",
    courses: ["React & TypeScript Masterclass", "GraphQL with Apollo", "Node.js REST API Development"],
    progress: 100,
    lastActive: "3 days ago",
    joined: "Jan 28, 2025",
    status: "completed",
    completions: 3,
  },
  {
    id: 4,
    name: "Marcus Lee",
    email: "m.lee@example.com",
    courses: ["Advanced CSS & Animation"],
    progress: 15,
    lastActive: "2 weeks ago",
    joined: "May 1, 2025",
    status: "inactive",
    completions: 0,
  },
  {
    id: 5,
    name: "Fatima Al-Hassan",
    email: "fatima.h@example.com",
    courses: ["React & TypeScript Masterclass"],
    progress: 63,
    lastActive: "5 hrs ago",
    joined: "Feb 17, 2025",
    status: "active",
    completions: 0,
  },
  {
    id: 6,
    name: "Oliver Bennett",
    email: "oliver.b@example.com",
    courses: ["GraphQL with Apollo", "Node.js REST API Development"],
    progress: 78,
    lastActive: "Yesterday",
    joined: "Mar 5, 2025",
    status: "active",
    completions: 1,
  },
  {
    id: 7,
    name: "Yuna Kim",
    email: "yuna.kim@example.com",
    courses: ["React & TypeScript Masterclass", "Node.js REST API Development"],
    progress: 100,
    lastActive: "4 days ago",
    joined: "Dec 10, 2024",
    status: "completed",
    completions: 2,
  },
  {
    id: 8,
    name: "Diego Ramirez",
    email: "d.ramirez@example.com",
    courses: ["Advanced CSS & Animation"],
    progress: 29,
    lastActive: "3 weeks ago",
    joined: "May 14, 2025",
    status: "inactive",
    completions: 0,
  },
]

const STATS = [
  { label: "Total Enrolled",    value: "3,842", icon: Users,     color: "var(--accent)", bg: "#3B82F615" },
  { label: "Active This Week",  value: "286",   icon: UserCheck, color: "var(--success)", bg: "#10B98115" },
  { label: "Avg. Completion",   value: "74%",   icon: TrendingUp,color: "#8B5CF6", bg: "#8B5CF615" },
  { label: "New This Month",    value: "142",   icon: Calendar,  color: "var(--warning)", bg: "#F59E0B15" },
]

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",    color: "var(--success)", bg: "#10B98118" },
  inactive:  { label: "Inactive",  color: "var(--text-tertiary)", bg: "#33415518" },
  completed: { label: "Completed", color: "var(--accent)", bg: "#3B82F618" },
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#F97316"]

export default function StudentsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<number[]>([])

  const filtered = STUDENTS.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.includes(s.id))
  function toggleAll() {
    setSelected(allSelected ? [] : filtered.map((s) => s.id))
  }
  function toggleOne(id: number) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  return (
    <InstructorPageShell
      title="Students"
      user={{ name: "Jane Smith", email: "jane@example.com" }}
    >
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-2xl p-4 shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{label}</p>
                <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ backgroundColor: bg }}>
                  <Icon size={15} style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 max-w-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="bg-transparent outline-none text-sm flex-1 placeholder-slate-600"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div className="flex items-center gap-2">
            {["all", "active", "inactive", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors"
                style={{
                  backgroundColor: statusFilter === s ? "var(--border-default)" : "var(--bg-surface)",
                  color: statusFilter === s ? "var(--text-primary)" : "var(--text-tertiary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {selected.length > 0 && (
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:opacity-80 ml-auto"
              style={{ backgroundColor: "#3B82F620", color: "#60A5FA", border: "1px solid #3B82F630" }}
            >
              <Mail size={13} />
              Message {selected.length} selected
            </button>
          )}
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          {/* Table header */}
          <div
            className="grid items-center px-5 py-3 text-xs font-semibold uppercase tracking-wide"
            style={{
              gridTemplateColumns: "32px 1fr 120px 160px 110px 90px 40px",
              borderBottom: "1px solid var(--border-default)",
              color: "var(--text-muted)",
            }}
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-3.5 h-3.5 accent-blue-500"
            />
            <span>Student</span>
            <span className="hidden sm:block">Status</span>
            <span className="hidden md:block">Courses</span>
            <span className="hidden md:block">Progress</span>
            <span className="hidden lg:block">Last Active</span>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {filtered.map((student, i) => {
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
              const isSelected = selected.includes(student.id)
              const statusStyle = STATUS_MAP[student.status]
              return (
                <div
                  key={student.id}
                  className="grid items-center px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                  style={{
                    gridTemplateColumns: "32px 1fr 120px 160px 110px 90px 40px",
                    backgroundColor: isSelected ? "#3B82F608" : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(student.id)}
                    className="w-3.5 h-3.5 accent-blue-500"
                  />

                  {/* Name + email */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials(student.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{student.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{student.email}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="hidden sm:block">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Courses */}
                  <div className="hidden md:block min-w-0">
                    <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                      {student.courses[0]}
                    </p>
                    {student.courses.length > 1 && (
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        +{student.courses.length - 1} more
                      </p>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${student.progress}%`,
                            backgroundColor: student.progress === 100 ? "var(--success)" : "var(--accent)",
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8 text-right" style={{ color: "var(--text-secondary)" }}>
                        {student.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Last active */}
                  <div className="hidden lg:block">
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{student.lastActive}</p>
                  </div>

                  {/* Actions */}
                  <button
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-5 py-3 text-xs"
            style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-muted)" }}
          >
            <span>Showing {filtered.length} of {STUDENTS.length} students</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: p === 1 ? "var(--accent)" : "transparent",
                    color: p === 1 ? "#fff" : "var(--text-tertiary)",
                  }}
                >
                  {p}
                </button>
              ))}
              <button className="w-7 h-7 rounded-lg text-xs font-medium transition-colors hover:bg-white/5 flex items-center justify-center" style={{ color: "var(--text-tertiary)" }}>
                <ChevronDown size={12} style={{ transform: "rotate(-90deg)" }} />
              </button>
            </div>
          </div>
        </div>

        {/* Course enrollment breakdown */}
        <div
          className="rounded-2xl p-5 shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Enrollment by Course</h3>
          <div className="space-y-3">
            {[
              { name: "React & TypeScript Masterclass", count: 1204, max: 1204, color: "#3B82F6" },
              { name: "Node.js REST API Development",   count: 876,  max: 1204, color: "#10B981" },
              { name: "Advanced CSS & Animation",       count: 543,  max: 1204, color: "#F59E0B" },
              { name: "GraphQL with Apollo",            count: 312,  max: 1204, color: "#EC4899" },
            ].map(({ name, count, max, color }) => (
              <div key={name} className="flex items-center gap-3">
                <p className="text-xs w-48 truncate flex-shrink-0" style={{ color: "var(--text-secondary)" }}>{name}</p>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(count / max) * 100}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-xs font-semibold w-12 text-right" style={{ color: "var(--text-primary)" }}>{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InstructorPageShell>
  )
}
