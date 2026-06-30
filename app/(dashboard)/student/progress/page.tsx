"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { COURSES, STUDENT_PROFILE, QUIZZES, ASSIGNMENTS } from "@/lib/data/courses"
import {
  TrendingUp, Clock, Trophy, BookOpen, Star, Flame,
  CheckCircle2, BarChart2, Target, Award,
} from "lucide-react"

const enrolled = COURSES.filter((c) => c.progress !== undefined)
const p = STUDENT_PROFILE

// Mock weekly data (last 8 weeks)
const weeklyData = [
  { week: "Apr 21", hours: 4.5, courses: 2 },
  { week: "Apr 28", hours: 6.0, courses: 3 },
  { week: "May 5", hours: 3.5, courses: 2 },
  { week: "May 12", hours: 8.0, courses: 4 },
  { week: "May 19", hours: 5.5, courses: 3 },
  { week: "May 26", hours: 7.0, courses: 3 },
  { week: "Jun 2", hours: 6.5, courses: 4 },
  { week: "Jun 9", hours: 10.5, courses: 5 },
]
const maxWeekHours = Math.max(...weeklyData.map((d) => d.hours))

// Skills data
const skills = [
  { name: "React / Next.js", level: 72, color: "#3B82F6" },
  { name: "TypeScript", level: 65, color: "#2563EB" },
  { name: "System Design", level: 28, color: "#8B5CF6" },
  { name: "Machine Learning", level: 5, color: "#10B981" },
  { name: "Cybersecurity", level: 95, color: "#EF4444" },
  { name: "Data Privacy / GDPR", level: 60, color: "#F59E0B" },
  { name: "DEI / Compliance", level: 100, color: "#8B5CF6" },
]

// Streak calendar (last 28 days, 0=no activity, 1=light, 2=medium, 3=heavy)
const streakData = [
  3, 2, 0, 1, 2, 3, 2,
  1, 0, 0, 2, 3, 2, 1,
  2, 3, 1, 0, 2, 3, 2,
  3, 2, 1, 3, 2, 0, 1,
]

const activityColor = (level: number) => {
  if (level === 0) return "var(--bg-surface-muted)"
  if (level === 1) return "#1D4ED840"
  if (level === 2) return "#3B82F680"
  return "var(--accent)"
}

// Achievements
const achievements = [
  { id: "1", label: "First Certificate", icon: "🏆", earned: true, date: "Mar 1, 2025" },
  { id: "2", label: "7-Day Streak", icon: "🔥", earned: true, date: "Jun 12, 2025" },
  { id: "3", label: "Quiz Ace (90%+)", icon: "⚡", earned: true, date: "Nov 10, 2024" },
  { id: "4", label: "10 Courses Enrolled", icon: "📚", earned: false, date: null },
  { id: "5", label: "30-Day Streak", icon: "🌟", earned: false, date: null },
  { id: "6", label: "Path Completion", icon: "🗺️", earned: false, date: null },
]

const categoryBreakdown = [
  { name: "Engineering", hours: 32, color: "#3B82F6" },
  { name: "Compliance", hours: 10, color: "#EF4444" },
  { name: "Security", hours: 6, color: "#F59E0B" },
]
const totalCatHours = categoryBreakdown.reduce((s, c) => s + c.hours, 0)

export default function ProgressPage() {
  const gradedAssignments = ASSIGNMENTS.filter((a) => a.grade !== undefined)
  const avgGrade = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((s, a) => s + (a.grade! / a.maxGrade) * 100, 0) / gradedAssignments.length)
    : 0

  const quizzesPassed = QUIZZES.filter((q) => q.bestScore !== undefined && q.bestScore >= q.passingScore).length
  const avgQuizScore = QUIZZES.filter((q) => q.bestScore !== undefined).length > 0
    ? Math.round(QUIZZES.filter((q) => q.bestScore !== undefined).reduce((s, q, _, arr) => s + q.bestScore! / arr.length, 0))
    : 0

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-6 max-w-7xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Progress & Analytics</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Your learning journey at a glance — last updated June 12, 2025
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Hours Learned", value: `${p.totalHours}h`, sub: "total lifetime", icon: Clock, color: "#3B82F6" },
            { label: "Avg. Grade", value: `${avgGrade}%`, sub: "across assignments", icon: Star, color: "#F59E0B" },
            { label: "Quizzes Passed", value: `${quizzesPassed}/${QUIZZES.length}`, sub: `avg ${avgQuizScore}%`, icon: CheckCircle2, color: "#10B981" },
            { label: "Current Streak", value: `${p.streak} days`, sub: "keep it going!", icon: Flame, color: "#EF4444" },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ backgroundColor: `${color}20` }}>
                  <Icon size={17} style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Weekly activity chart */}
          <div className="lg:col-span-2 space-y-6">

            {/* Activity chart */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Weekly Learning Activity</h2>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Last 8 weeks</span>
              </div>
              <div className="flex items-end gap-2 h-32">
                {weeklyData.map(({ week, hours }) => {
                  const barH = Math.max(4, Math.round((hours / maxWeekHours) * 112))
                  const isLast = week === "Jun 9"
                  return (
                    <div key={week} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${barH}px`,
                          backgroundColor: isLast ? "var(--accent)" : "#3B82F640",
                        }}
                      />
                      <span className="text-xs" style={{ color: "var(--text-muted)", fontSize: 9 }}>
                        {week.slice(4)}
                      </span>
                      <div
                        className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 pointer-events-none"
                        style={{ backgroundColor: "var(--border-default)", color: "var(--text-primary)", whiteSpace: "nowrap" }}
                      >
                        {hours}h
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 text-xs" style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
                <span>Total this month: <strong style={{ color: "var(--text-primary)" }}>22h</strong></span>
                <span>vs last month: <strong style={{ color: "var(--success)" }}>+18%</strong></span>
                <span>Weekly goal: <strong style={{ color: "var(--text-primary)" }}>{p.weeklyGoal}h</strong></span>
              </div>
            </div>

            {/* Course progress breakdown */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Course Progress Breakdown</h2>
              <div className="space-y-4">
                {enrolled.map((course) => {
                  const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0)
                  const completedLessons = course.sections.reduce(
                    (s, sec) => s + sec.lessons.filter((l) => l.completed).length,
                    0
                  )
                  return (
                    <div key={course.id}>
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-lg flex-shrink-0"
                          style={{ backgroundColor: `${course.thumbnailColor}15` }}
                        >
                          {course.thumbnail}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{course.title}</span>
                            <span className="text-xs font-bold flex-shrink-0" style={{ color: course.progress === 100 ? "var(--success)" : "var(--text-secondary)" }}>
                              {course.progress}%
                            </span>
                          </div>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {completedLessons}/{totalLessons > 0 ? totalLessons : "?"} lessons
                            {course.grade !== undefined && ` · Grade: ${course.grade}%`}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${course.progress}%`,
                            backgroundColor: course.progress === 100 ? "var(--success)" : course.thumbnailColor,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Activity heatmap */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Activity Heatmap</h2>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Last 28 days</span>
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
                {streakData.map((level, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded"
                    style={{ backgroundColor: activityColor(level) }}
                    title={`Day ${i + 1}: ${level === 0 ? "No activity" : level === 1 ? "< 1h" : level === 2 ? "1–2h" : "2h+"}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                <span>Less</span>
                {[0, 1, 2, 3].map((l) => (
                  <div key={l} className="w-3 h-3 rounded" style={{ backgroundColor: activityColor(l) }} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Skills */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Skills Progress</h2>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1 text-xs">
                      <span style={{ color: "var(--text-secondary)" }}>{skill.name}</span>
                      <span className="font-semibold" style={{ color: skill.color }}>{skill.level}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${skill.level}%`, backgroundColor: skill.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time by category */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Time by Category</h2>
              <div className="space-y-3">
                {categoryBreakdown.map((cat) => {
                  const pct = Math.round((cat.hours / totalCatHours) * 100)
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between mb-1 text-xs">
                        <span style={{ color: "var(--text-secondary)" }}>{cat.name}</span>
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{cat.hours}h <span style={{ color: "var(--text-muted)" }}>({pct}%)</span></span>
                      </div>
                      <div className="h-2 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Achievements</h2>
              <div className="grid grid-cols-3 gap-2">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl"
                    style={{
                      backgroundColor: ach.earned ? "var(--border-default)" : "#1A2535",
                      opacity: ach.earned ? 1 : 0.4,
                    }}
                    title={ach.earned ? `Earned: ${ach.date}` : "Not yet earned"}
                  >
                    <span style={{ fontSize: 22 }}>{ach.icon}</span>
                    <span className="text-xs text-center leading-tight" style={{ color: ach.earned ? "#CBD5E1" : "var(--text-muted)", fontSize: 10 }}>
                      {ach.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick goals */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Target size={14} style={{ color: "var(--accent)" }} />
                <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Learning Goal</h2>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>{p.learningGoal}</p>
              <div className="space-y-2">
                {[
                  { label: "Complete React course", done: false },
                  { label: "Pass TypeScript Module 2", done: false },
                  { label: "GDPR Compliance cert", done: false },
                  { label: "Cybersecurity cert ✓", done: true },
                  { label: "DEI cert ✓", done: true },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2 text-xs" style={{ color: done ? "var(--text-tertiary)" : "var(--text-secondary)" }}>
                    <CheckCircle2 size={12} style={{ color: done ? "var(--success)" : "var(--border-default)" }} />
                    <span style={{ textDecoration: done ? "line-through" : "none" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
