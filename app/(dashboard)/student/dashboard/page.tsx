"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { COURSES, ASSIGNMENTS, SCHEDULE_EVENTS, STUDENT_PROFILE } from "@/lib/data/courses"
import {
  BookOpen, Clock, Trophy, TrendingUp, Play, ChevronRight,
  Flame, Star, AlertCircle, Zap, CheckCircle2, ArrowRight,
  Target, Calendar, BarChart2,
} from "lucide-react"

const enrolled = COURSES.filter((c) => c.progress !== undefined)
const inProgress = enrolled.filter((c) => c.progress! > 0 && c.progress! < 100)
const completed = enrolled.filter((c) => c.progress === 100)
const upcoming = SCHEDULE_EVENTS.filter((e) => e.status === "today" || e.status === "upcoming").slice(0, 4)
const pendingAssignments = ASSIGNMENTS.filter((a) => a.status === "pending").slice(0, 3)

const p = STUDENT_PROFILE

// Weekly activity (Mon–Sun, hours studied)
const weekActivity = [
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 2.0 },
  { day: "Wed", hours: 0.5 },
  { day: "Thu", hours: 3.0 },
  { day: "Fri", hours: 2.5 },
  { day: "Sat", hours: 1.0 },
  { day: "Sun", hours: 0 },
]
const maxHours = Math.max(...weekActivity.map((d) => d.hours))

const quickStats = [
  { label: "Enrolled", value: String(p.stats.enrolled), icon: BookOpen, color: "#3B82F6", sub: "courses" },
  { label: "Hours Learned", value: String(p.totalHours), icon: Clock, color: "#10B981", sub: "this month" },
  { label: "Certificates", value: String(p.stats.certificates), icon: Trophy, color: "#F59E0B", sub: "earned" },
  { label: "Streak", value: `${p.streak}d`, icon: Flame, color: "#EF4444", sub: "keep going!" },
]

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  )
}

const getHour = (time: string) => {
  const h = parseInt(time.split(":")[0])
  const period = h >= 12 ? "PM" : "AM"
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${display}:${time.split(":")[1]} ${period}`
}

const eventTypeColors: Record<string, string> = {
  "live-session": "#3B82F6",
  "assignment-due": "#F59E0B",
  "quiz": "#8B5CF6",
  "exam": "#EF4444",
  "workshop": "#10B981",
  "office-hours": "#14B8A6",
}

const eventTypeLabels: Record<string, string> = {
  "live-session": "Live",
  "assignment-due": "Due",
  "quiz": "Quiz",
  "exam": "Exam",
  "workshop": "Workshop",
  "office-hours": "Office Hours",
}

export default function StudentDashboardPage() {
  const xpPercent = Math.round((p.xp / (p.xp + p.xpToNextLevel)) * 100)
  const weeklyPercent = Math.min(100, Math.round((10.5 / p.weeklyGoal) * 100))

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-6 max-w-7xl">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good morning, {p.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              <Flame size={13} className="inline mr-1 mb-0.5" style={{ color: "#EF4444" }} />
              {p.streak}-day streak · {p.stats.inProgress} courses in progress · Level {p.level}
            </p>
          </div>
          <Link
            href="/student/explore"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: "#3B82F6", color: "#fff" }}
          >
            <Zap size={15} /> Explore Courses
          </Link>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map(({ label, value, icon: Icon, color, sub }) => (
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
              <div className="text-xs font-medium" style={{ color: "#94A3B8" }}>{label}</div>
              <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── XP / Level + Weekly Goal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* XP Progress */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Star size={14} style={{ color: "#F59E0B" }} fill="#F59E0B" /> Level {p.level} — Rising Engineer
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                  {p.xp} XP · {p.xpToNextLevel} XP to Level {p.level + 1}
                </p>
              </div>
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: "#3B82F6", fontSize: 15 }}
              >
                {p.level}
              </div>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: "#334155" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${xpPercent}%`,
                  background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs" style={{ color: "#64748B" }}>0</span>
              <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>{xpPercent}%</span>
              <span className="text-xs" style={{ color: "#64748B" }}>{p.xp + p.xpToNextLevel} XP</span>
            </div>
          </div>

          {/* Weekly Goal */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Target size={14} style={{ color: "#10B981" }} /> Weekly Goal
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                  10.5h of {p.weeklyGoal}h · Week of June 9–15
                </p>
              </div>
              <Badge label={weeklyPercent >= 100 ? "Achieved!" : `${weeklyPercent}%`} color={weeklyPercent >= 100 ? "#10B981" : "#3B82F6"} />
            </div>
            <div className="flex items-end gap-1 h-10">
              {weekActivity.map(({ day, hours }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: hours > 0 ? `${Math.max(4, Math.round((hours / maxHours) * 32))}px` : "4px",
                      backgroundColor: day === "Sun" ? "#334155" : hours > 0 ? "#3B82F6" : "#334155",
                      opacity: hours > 0 ? 1 : 0.4,
                    }}
                  />
                  <span className="text-xs" style={{ color: "#475569", fontSize: 10 }}>{day[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Continue Learning */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Continue Learning</h2>
              <Link href="/student/courses" className="flex items-center gap-1 text-xs font-medium" style={{ color: "#3B82F6" }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>

            {inProgress.map((course) => {
              const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0)
              const completedLessons = course.sections.reduce(
                (s, sec) => s + sec.lessons.filter((l) => l.completed).length,
                0
              )
              return (
                <div
                  key={course.id}
                  className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-150"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3B82F640")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#334155")}
                >
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${course.thumbnailColor}20` }}
                  >
                    {course.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{course.title}</p>
                      {course.isMandatory && <Badge label="Mandatory" color="#EF4444" />}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                      {completedLessons}/{totalLessons} lessons ·{" "}
                      {course.sections.find((s) => s.lessons.find((l) => l.id === course.nextLessonId))?.lessons.find((l) => l.id === course.nextLessonId)?.title ?? "Next lesson"}
                    </p>
                    <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${course.progress}%`, backgroundColor: course.thumbnailColor }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#64748B" }}>{course.progress}% complete</p>
                  </div>
                  <Link
                    href={`/student/courses/${course.id}/learn/${course.nextLessonId}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors"
                    style={{ backgroundColor: "#3B82F6" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3B82F6")}
                  >
                    <Play size={16} fill="#fff" color="#fff" />
                  </Link>
                </div>
              )
            })}

            {/* Completed courses */}
            {completed.length > 0 && (
              <div className="rounded-2xl p-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                <p className="text-xs font-semibold mb-3" style={{ color: "#64748B" }}>COMPLETED</p>
                <div className="space-y-2">
                  {completed.map((course) => (
                    <div key={course.id} className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-base flex-shrink-0"
                        style={{ backgroundColor: `${course.thumbnailColor}15` }}
                      >
                        {course.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{course.title}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>Grade: {course.grade}% · Certificate earned</p>
                      </div>
                      <CheckCircle2 size={16} style={{ color: "#10B981", flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Today / Upcoming */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">Upcoming</h2>
                <Link href="/student/schedule" className="flex items-center gap-1 text-xs" style={{ color: "#3B82F6" }}>
                  Calendar <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-2">
                {upcoming.map((event) => {
                  const color = eventTypeColors[event.type] ?? "#3B82F6"
                  const typeLabel = eventTypeLabels[event.type] ?? event.type
                  const isToday = event.status === "today"
                  return (
                    <div
                      key={event.id}
                      className="rounded-xl p-3 flex gap-3"
                      style={{
                        backgroundColor: "#1E293B",
                        border: `1px solid ${isToday ? color + "40" : "#334155"}`,
                      }}
                    >
                      <div
                        className="w-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color, minHeight: "100%" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{event.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                          {isToday ? "Today" : event.date.slice(5).replace("-", "/")} · {getHour(event.startTime)}
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded self-start flex-shrink-0"
                        style={{ backgroundColor: `${color}20`, color, fontSize: 10 }}
                      >
                        {typeLabel}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pending Assignments */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">Due Soon</h2>
                <Link href="/student/assignments" className="flex items-center gap-1 text-xs" style={{ color: "#3B82F6" }}>
                  All <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-2">
                {pendingAssignments.map((a) => {
                  const due = new Date(a.dueDate)
                  const today = new Date("2025-06-12")
                  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const urgency = diff <= 3 ? "#EF4444" : diff <= 7 ? "#F59E0B" : "#94A3B8"
                  return (
                    <div
                      key={a.id}
                      className="rounded-xl p-3"
                      style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                    >
                      <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#64748B" }}>{a.courseName}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle size={11} style={{ color: urgency }} />
                        <span className="text-xs font-medium" style={{ color: urgency }}>
                          {diff === 0 ? "Due today" : diff < 0 ? "Overdue" : `Due in ${diff}d`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Compliance Track (Enterprise) ── */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#EF444420", color: "#EF4444" }}
                >
                  REQUIRED
                </span>
                Compliance Learning Track
              </h2>
              <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                Mandatory courses required by TechCorp Inc. by June 30, 2025
              </p>
            </div>
            <Link
              href="/student/learning-paths"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "#3B82F6" }}
            >
              View Path <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COURSES.filter((c) => c.isMandatory).map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  backgroundColor: "#0F172A",
                  border: `1px solid ${course.progress === 100 ? "#10B98130" : "#334155"}`,
                }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-lg flex-shrink-0"
                  style={{ backgroundColor: `${course.thumbnailColor}15` }}
                >
                  {course.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{course.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {course.progress === 100 ? (
                      <span className="text-xs flex items-center gap-1" style={{ color: "#10B981" }}>
                        <CheckCircle2 size={11} /> Complete
                      </span>
                    ) : (
                      <>
                        <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: "#334155" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${course.progress ?? 0}%`, backgroundColor: course.thumbnailColor }}
                          />
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: "#64748B" }}>{course.progress ?? 0}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Avg. Quiz Score", value: `${p.stats.avgScore}%`, icon: BarChart2, color: "#8B5CF6" },
            { label: "Assignments Done", value: `${p.stats.assignmentsSubmitted}/8`, icon: CheckCircle2, color: "#10B981" },
            { label: "Quizzes Passed", value: `${p.stats.quizzesPassed}/6`, icon: Trophy, color: "#F59E0B" },
            { label: "Courses Completed", value: `${p.stats.completed}/${p.stats.enrolled}`, icon: TrendingUp, color: "#3B82F6" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-xs" style={{ color: "#64748B" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  )
}
