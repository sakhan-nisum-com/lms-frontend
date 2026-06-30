"use client"

import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { COURSES, ASSIGNMENTS, SCHEDULE_EVENTS, STUDENT_PROFILE } from "@/lib/data/courses"
import {
  BookOpen, Clock, Trophy, TrendingUp, Play, ChevronRight,
  Flame, Star, AlertCircle, Zap, CheckCircle2, ArrowRight,
  Target, Calendar, BarChart2, Video, ExternalLink,
} from "lucide-react"
import { isZoomLink } from "@/lib/data/live-session"

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

const eventTypeColors: Record<string, string> = {
  "live-session": "#3B82F6",
  "assignment-due": "#F59E0B",
  "quiz": "#8B5CF6",
  "exam": "#EF4444",
  "workshop": "#10B981",
  "office-hours": "#14B8A6",
}

export default function StudentDashboardPage() {
  const locale = useLocale()
  const isRtl = locale === "ar"
  const t = useTranslations("studentDashboard")
  const tCommon = useTranslations("common")
  const ForwardChevron = ChevronRight
  const ForwardArrow = ArrowRight

  const localized = (en: string, ar?: string) => (isRtl && ar ? ar : en)

  const getHour = (time: string) => {
    const h = parseInt(time.split(":")[0])
    const period = h >= 12 ? tCommon("pm") : tCommon("am")
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${display}:${time.split(":")[1]} ${period}`
  }

  const name = localized(p.name, p.nameAr)

  const quickStats = [
    { label: t("stats.enrolled"), value: String(p.stats.enrolled), icon: BookOpen, color: "#3B82F6", sub: t("stats.enrolledSub") },
    { label: t("stats.hoursLearned"), value: String(p.totalHours), icon: Clock, color: "#10B981", sub: t("stats.hoursLearnedSub") },
    { label: t("stats.certificates"), value: String(p.stats.certificates), icon: Trophy, color: "#F59E0B", sub: t("stats.certificatesSub") },
    { label: t("stats.streak"), value: t("stats.streakValue", { days: p.streak }), icon: Flame, color: "#EF4444", sub: t("stats.streakSub") },
  ]

  const xpPercent = Math.round((p.xp / (p.xp + p.xpToNextLevel)) * 100)
  const weeklyPercent = Math.min(100, Math.round((10.5 / p.weeklyGoal) * 100))

  return (
    <DashboardLayout role="student" userName={name}>
      <div className="space-y-6 max-w-7xl">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {t("greeting", { name: name.split(" ")[0] })}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              <Flame size={13} className="inline me-1 mb-0.5" style={{ color: "var(--danger)" }} />
              {t("streakSummary", { streak: p.streak, inProgress: p.stats.inProgress, level: p.level })}
            </p>
          </div>
          <Link
            href="/student/explore"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            <Zap size={15} /> {t("exploreCourses")}
          </Link>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map(({ label, value, icon: Icon, color, sub }) => (
            <div
              key={label}
              className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
              <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── XP / Level + Weekly Goal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* XP Progress */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                  <Star size={14} style={{ color: "var(--warning)" }} fill="var(--warning)" /> {t("levelTitle", { level: p.level })}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {t("xpToNext", { xp: p.xp, xpToNextLevel: p.xpToNextLevel, nextLevel: p.level + 1 })}
                </p>
              </div>
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: "var(--accent)", fontSize: 15 }}
              >
                {p.level}
              </div>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${xpPercent}%`,
                  background: "linear-gradient(90deg, var(--accent), #8B5CF6)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>0</span>
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{xpPercent}%</span>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{p.xp + p.xpToNextLevel} XP</span>
            </div>
          </div>

          {/* Weekly Goal */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                  <Target size={14} style={{ color: "var(--success)" }} /> {t("weeklyGoal")}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {t("weeklyGoalSummary", { done: 10.5, goal: p.weeklyGoal })}
                </p>
              </div>
              <Badge label={weeklyPercent >= 100 ? t("achieved") : `${weeklyPercent}%`} color={weeklyPercent >= 100 ? "#10B981" : "#3B82F6"} />
            </div>
            <div className="flex items-end gap-1 h-10">
              {weekActivity.map(({ day, hours }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: hours > 0 ? `${Math.max(4, Math.round((hours / maxHours) * 32))}px` : "4px",
                      backgroundColor: day === "Sun" ? "var(--border-default)" : hours > 0 ? "var(--accent)" : "var(--border-default)",
                      opacity: hours > 0 ? 1 : 0.4,
                    }}
                  />
                  <span className="text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>{day[0]}</span>
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
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{t("continueLearning")}</h2>
              <Link href="/student/courses" className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--accent)" }}>
                {t("viewAll")} <ForwardChevron size={14} className="rtl:-scale-x-100" />
              </Link>
            </div>

            {inProgress.map((course) => {
              const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0)
              const completedLessons = course.sections.reduce(
                (s, sec) => s + sec.lessons.filter((l) => l.completed).length,
                0
              )
              const nextLessonTitle = course.sections.find((s) => s.lessons.find((l) => l.id === course.nextLessonId))?.lessons.find((l) => l.id === course.nextLessonId)?.title
              return (
                <div
                  key={course.id}
                  className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-150 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3B82F640")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                >
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${course.thumbnailColor}18` }}
                  >
                    {course.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{localized(course.title, course.titleAr)}</p>
                      {course.isMandatory && <Badge label={t("mandatory")} color="#EF4444" />}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {t("lessonsOf", { completed: completedLessons, total: totalLessons })} ·{" "}
                      {nextLessonTitle ?? t("nextLesson")}
                    </p>
                    <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${course.progress}%`, backgroundColor: course.thumbnailColor }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{t("percentComplete", { percent: course.progress ?? 0 })}</p>
                  </div>
                  <Link
                    href={`/student/courses/${course.id}/learn/${course.nextLessonId}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors"
                    style={{ backgroundColor: "var(--accent)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
                  >
                    <Play size={16} fill="#fff" color="#fff" />
                  </Link>
                </div>
              )
            })}

            {/* Completed courses */}
            {completed.length > 0 && (
              <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-tertiary)" }}>{t("completed")}</p>
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
                        <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{localized(course.title, course.titleAr)}</p>
                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{t("gradeAndCert", { grade: course.grade ?? 0 })}</p>
                      </div>
                      <CheckCircle2 size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
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
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{t("upcoming")}</h2>
                <Link href="/student/schedule" className="flex items-center gap-1 text-xs" style={{ color: "var(--accent)" }}>
                  {t("calendar")} <ForwardChevron size={14} className="rtl:-scale-x-100" />
                </Link>
              </div>
              <div className="space-y-2">
                {upcoming.map((event) => {
                  const color = eventTypeColors[event.type] ?? "#3B82F6"
                  const typeLabel = t(`eventTypes.${event.type}`)
                  const isToday = event.status === "today"
                  return (
                    <div
                      key={event.id}
                      className="rounded-xl p-3 flex gap-3 shadow-sm"
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        border: `1px solid ${isToday ? color + "40" : "var(--border-default)"}`,
                      }}
                    >
                      <div
                        className="w-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color, minHeight: "100%" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{localized(event.title, event.titleAr)}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                          {isToday ? t("today") : event.date.slice(5).replace("-", "/")} · {getHour(event.startTime)}
                        </p>
                        {event.meetLink && (
                          isZoomLink(event.meetLink) ? (
                            <Link
                              href={`/student/live-session/${event.id}`}
                              className="flex items-center gap-1 text-xs mt-1 font-medium"
                              style={{ color: "var(--success)" }}
                            >
                              <Video size={10} /> {t("joinInLms")}
                            </Link>
                          ) : (
                            <a
                              href={event.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs mt-1"
                              style={{ color: "var(--accent)" }}
                            >
                              <ExternalLink size={10} /> {t("joinMeeting")}
                            </a>
                          )
                        )}
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
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{t("dueSoon")}</h2>
                <Link href="/student/courses" className="flex items-center gap-1 text-xs" style={{ color: "var(--accent)" }}>
                  {t("all")} <ForwardChevron size={14} className="rtl:-scale-x-100" />
                </Link>
              </div>
              <div className="space-y-2">
                {pendingAssignments.map((a) => {
                  const due = new Date(a.dueDate)
                  const today = new Date("2025-06-12")
                  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const urgency = diff <= 3 ? "var(--danger)" : diff <= 7 ? "var(--warning)" : "var(--text-secondary)"
                  return (
                    <Link
                      key={a.id}
                      href={`/student/courses/${a.courseId}?tab=assignments`}
                      className="block rounded-xl p-3 shadow-sm"
                      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                    >
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{localized(a.title, a.titleAr)}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>{localized(a.courseName, a.courseNameAr)}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle size={11} style={{ color: urgency }} />
                        <span className="text-xs font-medium" style={{ color: urgency }}>
                          {diff === 0 ? t("dueToday") : diff < 0 ? t("overdue") : t("dueInDays", { days: diff })}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Compliance Track (Enterprise) ── */}
        <div
          className="rounded-2xl p-5 shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}
                >
                  {t("complianceTrackRequired")}
                </span>
                {t("complianceTrackTitle")}
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                {t("complianceTrackDesc", { company: "TechCorp Inc.", date: localized("June 30, 2025", "30 يونيو 2025") })}
              </p>
            </div>
            <Link
              href="/student/learning-paths"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "var(--accent)" }}
            >
              {t("viewPath")} <ForwardArrow size={14} className="rtl:-scale-x-100" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COURSES.filter((c) => c.isMandatory).map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  backgroundColor: "var(--bg-surface-muted)",
                  border: `1px solid ${course.progress === 100 ? "#10B98130" : "var(--border-default)"}`,
                }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-lg flex-shrink-0"
                  style={{ backgroundColor: `${course.thumbnailColor}15` }}
                >
                  {course.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{localized(course.title, course.titleAr)}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {course.progress === 100 ? (
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--success)" }}>
                        <CheckCircle2 size={11} /> {t("complete")}
                      </span>
                    ) : (
                      <>
                        <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${course.progress ?? 0}%`, backgroundColor: course.thumbnailColor }}
                          />
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>{course.progress ?? 0}%</span>
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
            { label: t("secondaryStats.avgQuizScore"), value: `${p.stats.avgScore}%`, icon: BarChart2, color: "#8B5CF6" },
            { label: t("secondaryStats.assignmentsDone"), value: `${p.stats.assignmentsSubmitted}/8`, icon: CheckCircle2, color: "#10B981" },
            { label: t("secondaryStats.quizzesPassed"), value: `${p.stats.quizzesPassed}/6`, icon: Trophy, color: "#F59E0B" },
            { label: t("secondaryStats.coursesCompleted"), value: `${p.stats.completed}/${p.stats.enrolled}`, icon: TrendingUp, color: "#3B82F6" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl p-4 flex items-center gap-3 shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
                <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  )
}
