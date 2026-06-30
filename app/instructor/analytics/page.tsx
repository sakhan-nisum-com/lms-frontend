"use client"

import { useState } from "react"
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  BookOpen,
  ChevronDown,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"

const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "All time"]

const ENROLLMENT_DATA = [
  { day: "Mon", value: 28 },
  { day: "Tue", value: 45 },
  { day: "Wed", value: 39 },
  { day: "Thu", value: 62 },
  { day: "Fri", value: 55 },
  { day: "Sat", value: 33 },
  { day: "Sun", value: 41 },
]

const COMPLETION_DATA = [
  { day: "Mon", value: 12 },
  { day: "Tue", value: 18 },
  { day: "Wed", value: 22 },
  { day: "Thu", value: 15 },
  { day: "Fri", value: 30 },
  { day: "Sat", value: 10 },
  { day: "Sun", value: 19 },
]

const TOP_COURSES = [
  { name: "React & TypeScript Masterclass", students: 1204, completions: 892, revenue: "$3,612", rating: 4.9, trend: "+12%" },
  { name: "Node.js REST API Development",   students: 876,  completions: 541, revenue: "$2,628", rating: 4.7, trend: "+8%"  },
  { name: "Advanced CSS & Animation",       students: 543,  completions: 410, revenue: "$1,629", rating: 4.8, trend: "+5%"  },
  { name: "GraphQL with Apollo",            students: 312,  completions: 198, revenue: "$936",   rating: 4.6, trend: "+3%"  },
]

const maxEnrollment = Math.max(...ENROLLMENT_DATA.map((d) => d.value))
const maxCompletion = Math.max(...COMPLETION_DATA.map((d) => d.value))

function BarChart({
  data,
  maxVal,
  color,
}: {
  data: { day: string; value: number }[]
  maxVal: number
  color: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <div className="flex items-end gap-2 h-36 pt-2">
      {data.map((d, i) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 relative">
          {hovered === i && (
            <div
              className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs font-bold text-white whitespace-nowrap z-10"
              style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
            >
              {d.value}
            </div>
          )}
          <div
            className="w-full rounded-t-lg transition-all cursor-pointer"
            style={{
              height: `${(d.value / maxVal) * 100}%`,
              minHeight: 4,
              backgroundColor: hovered === i ? color : color + "80",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{d.day}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("Last 7 days")
  const [rangeOpen, setRangeOpen] = useState(false)

  return (
    <InstructorPageShell
      title="Analytics"
      user={{ name: "Jane Smith", email: "jane@example.com" }}
      action={
        <div className="relative">
          <button
            onClick={() => setRangeOpen(!rangeOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:border-slate-500"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            {range}
            <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} />
          </button>
          {rangeOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setRangeOpen(false)} />
              <div
                className="absolute right-0 top-11 z-20 w-40 rounded-xl overflow-hidden py-1"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
              >
                {RANGES.map((r) => (
                  <button
                    key={r}
                    className="w-full px-4 py-2 text-sm text-left transition-colors hover:bg-white/5"
                    style={{ color: r === range ? "var(--accent)" : "var(--text-secondary)" }}
                    onClick={() => { setRange(r); setRangeOpen(false) }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "New Enrollments", value: "284",  sub: "+18% vs prev period", icon: Users,     color: "#3B82F6", bg: "#3B82F615" },
            { label: "Completions",     value: "68",   sub: "+9% vs prev period",  icon: TrendingUp, color: "#10B981", bg: "#10B98115" },
            { label: "Revenue Earned",  value: "$1,840",sub: "+22% vs prev period",icon: DollarSign, color: "#F59E0B", bg: "#F59E0B15" },
            { label: "Avg. Watch Time", value: "4.3h", sub: "Per enrolled student", icon: Clock,     color: "#8B5CF6", bg: "#8B5CF615" },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
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
              <p className="text-xs mt-1" style={{ color: "var(--success)" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Enrollments chart */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Enrollments</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>New students per day</p>
              </div>
              <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>284</span>
            </div>
            <BarChart data={ENROLLMENT_DATA} maxVal={maxEnrollment} color="#3B82F6" />
          </div>

          {/* Completions chart */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Completions</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Courses finished per day</p>
              </div>
              <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>126</span>
            </div>
            <BarChart data={COMPLETION_DATA} maxVal={maxCompletion} color="#10B981" />
          </div>
        </div>

        {/* Top courses table */}
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-default)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Course Performance</h3>
          </div>
          <div
            className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wide"
            style={{
              gridTemplateColumns: "1fr 80px 90px 90px 70px 70px",
              borderBottom: "1px solid var(--border-default)",
              color: "var(--text-muted)",
            }}
          >
            <span>Course</span>
            <span className="text-right">Students</span>
            <span className="hidden sm:block text-right">Completed</span>
            <span className="hidden md:block text-right">Revenue</span>
            <span className="hidden sm:block text-right">Rating</span>
            <span className="text-right">Growth</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {TOP_COURSES.map((course) => (
              <div
                key={course.name}
                className="grid items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                style={{ gridTemplateColumns: "1fr 80px 90px 90px 70px 70px" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0" style={{ backgroundColor: "#3B82F620" }}>
                    <BookOpen size={13} style={{ color: "var(--accent)" }} />
                  </div>
                  <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{course.name}</p>
                </div>
                <p className="text-sm text-right" style={{ color: "var(--text-primary)" }}>{course.students.toLocaleString()}</p>
                <p className="hidden sm:block text-sm text-right" style={{ color: "var(--text-secondary)" }}>{course.completions.toLocaleString()}</p>
                <p className="hidden md:block text-sm font-semibold text-right" style={{ color: "var(--text-primary)" }}>{course.revenue}</p>
                <div className="hidden sm:flex items-center justify-end gap-1 text-sm" style={{ color: "var(--warning)" }}>
                  <Star size={12} fill="var(--warning)" />
                  {course.rating}
                </div>
                <p className="text-sm font-semibold text-right" style={{ color: "var(--success)" }}>{course.trend}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Completion Rate",     value: 74, color: "var(--accent)", desc: "% of enrolled students who finished" },
            { label: "Student Retention",   value: 68, color: "var(--success)", desc: "% who returned after first lesson"   },
            { label: "Quiz Pass Rate",       value: 88, color: "#8B5CF6", desc: "% passing quizzes on first attempt" },
          ].map(({ label, value, color, desc }) => (
            <div
              key={label}
              className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: "var(--border-default)" }}>
                <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </InstructorPageShell>
  )
}
