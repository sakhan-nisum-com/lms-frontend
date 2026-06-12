import { DashboardLayout } from "@/components/layout/DashboardLayout"
import React from "react"
import { BookOpen, Users, Star, TrendingUp, Plus, ChevronRight, BarChart2 } from "lucide-react"

const stats = [
  { label: "Active Courses", value: "5", icon: BookOpen, color: "#3B82F6" },
  { label: "Total Students", value: "284", icon: Users, color: "#10B981" },
  { label: "Avg. Rating", value: "4.8", icon: Star, color: "#F59E0B" },
  { label: "Monthly Revenue", value: "$1,240", icon: TrendingUp, color: "#8B5CF6" },
]

const courses = [
  {
    title: "React & Next.js Masterclass",
    students: 124,
    rating: 4.9,
    status: "Published",
    emoji: "⚛️",
  },
  {
    title: "TypeScript Fundamentals",
    students: 89,
    rating: 4.7,
    status: "Published",
    emoji: "🔷",
  },
  {
    title: "Node.js API Design",
    students: 71,
    rating: 4.8,
    status: "Published",
    emoji: "🟢",
  },
  {
    title: "Docker & Kubernetes 101",
    students: 0,
    rating: 0,
    status: "Draft",
    emoji: "🐳",
  },
]

const statusColors: Record<string, React.CSSProperties> = {
  Published: { backgroundColor: "#10B98120", color: "#34D399" },
  Draft: { backgroundColor: "#F59E0B20", color: "#FCD34D" },
}

export default function TutorDashboardPage() {
  return (
    <DashboardLayout role="tutor" userName="Sarah Chen">
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Instructor Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              Here&apos;s how your courses are performing this month.
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Plus size={16} />
            New Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Courses table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">My Courses</h2>
            <button
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "#3B82F6" }}
            >
              Manage all <ChevronRight size={14} />
            </button>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  {["Course", "Students", "Rating", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#64748B" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((course, i) => (
                  <tr
                    key={course.title}
                    className="transition-colors"
                    style={{ borderBottom: i < courses.length - 1 ? "1px solid #334155" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{course.emoji}</span>
                        <span className="font-medium text-white">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4" style={{ color: "#94A3B8" }}>
                      {course.students.toLocaleString()}
                    </td>
                    <td className="px-5 py-4" style={{ color: "#94A3B8" }}>
                      {course.rating > 0 ? (
                        <span className="flex items-center gap-1">
                          <Star size={13} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                          {course.rating}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={statusColors[course.status]}
                      >
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics placeholder */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}
        >
          <BarChart2 size={32} className="mx-auto mb-3" style={{ color: "#334155" }} />
          <p className="text-sm font-medium" style={{ color: "#475569" }}>
            Detailed analytics, revenue charts, and student engagement coming soon
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
