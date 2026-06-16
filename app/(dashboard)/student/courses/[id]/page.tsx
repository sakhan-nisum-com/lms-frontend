"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import { COURSES, DISCUSSIONS, STUDENT_PROFILE } from "@/lib/data/courses"
import { useProgress } from "@/lib/hooks/useProgress"
import { usePurchases } from "@/lib/hooks/usePurchases"
import {
  Play, Clock, Star, Users, BookOpen, CheckCircle2, Lock,
  ChevronDown, ChevronRight, Award, MessageSquare, FileText,
  Video, HelpCircle, PenLine, Wifi, Download,
} from "lucide-react"

type Tab = "overview" | "curriculum" | "resources" | "discussions" | "reviews"

const levelColors: Record<string, string> = { Beginner: "#10B981", Intermediate: "#F59E0B", Advanced: "#EF4444" }

const lessonTypeIcon = (type: string) => {
  switch (type) {
    case "video": return <Video size={13} style={{ color: "#3B82F6" }} />
    case "quiz": return <HelpCircle size={13} style={{ color: "#8B5CF6" }} />
    case "reading": return <FileText size={13} style={{ color: "#10B981" }} />
    case "assignment": return <PenLine size={13} style={{ color: "#F59E0B" }} />
    case "live": return <Wifi size={13} style={{ color: "#EC4899" }} />
    default: return <Video size={13} style={{ color: "#3B82F6" }} />
  }
}

const reviews = [
  { name: "Taylor R.", rating: 5, date: "May 2025", comment: "Best Next.js course I've taken. Sarah's explanations of Server Components are crystal clear." },
  { name: "Morgan K.", rating: 5, date: "Apr 2025", comment: "Incredible depth. The system design sections especially. Worth every penny." },
  { name: "Jordan P.", rating: 4, date: "Mar 2025", comment: "Great content. A few lessons could be shorter but overall excellent." },
  { name: "Casey B.", rating: 5, date: "Mar 2025", comment: "Perfect for mid-level engineers looking to master production Next.js." },
]

const resources = [
  { name: "Course Slides (All Modules)", size: "12.4 MB", type: "PDF" },
  { name: "Starter Code Repository", size: "—", type: "GitHub" },
  { name: "Next.js Cheatsheet", size: "2.1 MB", type: "PDF" },
  { name: "Architecture Diagrams", size: "5.8 MB", type: "ZIP" },
  { name: "Deployment Checklist", size: "0.8 MB", type: "PDF" },
]

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const course = COURSES.find((c) => c.id === id) ?? COURSES[0]
  const p = STUDENT_PROFILE
  const router = useRouter()
  const { isComplete } = useProgress(id)
  const { isPurchased, purchase } = usePurchases()
  const [tab, setTab] = useState<Tab>("overview")
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["s1", "s2"]))

  const toggleSection = (sId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      next.has(sId) ? next.delete(sId) : next.add(sId)
      return next
    })
  }

  const isDone = (lId: string, staticDone: boolean) => staticDone || isComplete(lId)

  const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0)
  const completedLessons = course.sections.reduce(
    (s, sec) => s + sec.lessons.filter((l) => isDone(l.id, l.completed)).length,
    0
  )
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : (course.progress ?? 0)
  const totalDuration = course.totalDuration
  const courseDiscussions = DISCUSSIONS.filter((d) => d.courseId === course.id)

  const isEnrolled = course.progress !== undefined || isPurchased(course.id)
  const isCourseComplete = progressPct === 100
  const firstLessonId = course.sections[0]?.lessons[0]?.id
  const continueHref = `/student/courses/${course.id}/learn/${course.nextLessonId || firstLessonId}`

  const handleEnroll = () => {
    if (course.price === "Free") {
      purchase(course.id)
      router.push(continueHref)
    } else {
      router.push(`/student/courses/${course.id}/checkout`)
    }
  }

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="max-w-6xl space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
          <Link href="/student/courses" style={{ color: "#3B82F6" }}>My Courses</Link>
          <ChevronRight size={12} />
          <span className="text-white">{course.title}</span>
        </div>

        {/* Hero */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${course.thumbnailColor}18 0%, transparent 70%)`,
              transform: "translate(30%, -30%)",
            }}
          />
          <div className="flex flex-col lg:flex-row gap-6 relative">
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${course.thumbnailColor}20`, color: course.thumbnailColor }}
                >
                  {course.category}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${levelColors[course.level]}20`, color: levelColors[course.level] }}
                >
                  {course.level}
                </span>
                {course.isMandatory && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EF444420", color: "#EF4444" }}>
                    Mandatory
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "#94A3B8" }}>{course.shortDesc}</p>

              <div className="flex items-center gap-5 flex-wrap text-sm" style={{ color: "#64748B" }}>
                <span className="flex items-center gap-1.5">
                  <Star size={14} style={{ color: "#F59E0B" }} fill="#F59E0B" />
                  <strong className="text-white">{course.rating}</strong>
                  <span>({course.reviewCount.toLocaleString()} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {course.studentsCount.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {totalDuration}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={14} />
                  {totalLessons} lessons
                </span>
              </div>

              <p className="text-sm mt-4" style={{ color: "#94A3B8" }}>
                Instructor: <strong className="text-white">{course.instructor}</strong>
                <span className="ml-2" style={{ color: "#64748B" }}>{course.instructorTitle}</span>
              </p>
            </div>

            {/* Right panel */}
            <div
              className="lg:w-72 rounded-xl p-5 flex-shrink-0"
              style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
            >
              <CourseThumbnail course={course} heightClass="h-28 mb-4" roundedClass="rounded-lg" locked={course.price !== "Free" && !isEnrolled} />

              {isEnrolled ? (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: "#64748B" }}>
                      <span>{completedLessons}/{totalLessons} lessons</span>
                      <span style={{ color: progressPct === 100 ? "#10B981" : "#94A3B8" }}>{progressPct}% complete</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: "#334155" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? "#10B981" : course.thumbnailColor }}
                      />
                    </div>
                  </div>
                  {isCourseComplete ? (
                    <Link
                      href="/student/certificates"
                      className="block w-full text-center py-3 rounded-xl text-sm font-bold"
                      style={{ backgroundColor: "#10B981", color: "#fff" }}
                    >
                      <CheckCircle2 size={16} className="inline mr-2" /> View Certificate
                    </Link>
                  ) : (
                    <Link
                      href={continueHref}
                      className="block w-full text-center py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                    >
                      <Play size={16} fill="#fff" /> {completedLessons === 0 ? "Start Learning" : "Continue Learning"}
                    </Link>
                  )}
                  {course.grade !== undefined && (
                    <p className="text-xs text-center mt-2" style={{ color: "#64748B" }}>
                      Current grade: <strong className="text-white">{course.grade}%</strong>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-white mb-1">
                    {course.price === "Free" ? "Free" : `$${course.price}`}
                  </div>
                  <button
                    onClick={handleEnroll}
                    className="block w-full text-center py-3 rounded-xl text-sm font-bold mb-2"
                    style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                  >
                    {course.price === "Free" ? "Enroll for Free" : "Enroll Now"}
                  </button>
                  <p className="text-xs text-center" style={{ color: "#64748B" }}>30-day money-back guarantee</p>
                </>
              )}

              {course.certificateOffered && (
                <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "#64748B" }}>
                  <Award size={13} style={{ color: "#F59E0B" }} />
                  Certificate of completion included
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b" style={{ borderColor: "#334155" }}>
          {(["overview", "curriculum", "resources", "discussions", "reviews"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium capitalize transition-colors relative"
              style={{ color: tab === t ? "#60A5FA" : "#64748B" }}
            >
              {t}
              {t === "discussions" && courseDiscussions.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                  {courseDiscussions.length}
                </span>
              )}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ backgroundColor: "#3B82F6" }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>

          {/* Overview */}
          {tab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                >
                  <h3 className="text-sm font-bold text-white mb-3">About This Course</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{course.description}</p>
                </div>

                <div
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                >
                  <h3 className="text-sm font-bold text-white mb-3">What You&apos;ll Learn</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "Build production-ready applications",
                      "Master Server Components & streaming",
                      "Implement robust data fetching patterns",
                      "Optimize performance (Core Web Vitals)",
                      "Deploy to Vercel and AWS",
                      "Write type-safe code with TypeScript",
                      "Design scalable component architecture",
                      "Handle authentication & authorization",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm" style={{ color: "#94A3B8" }}>
                        <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#10B981" }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                >
                  <h3 className="text-sm font-bold text-white mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {[
                      "Basic JavaScript knowledge (ES6+)",
                      "Familiarity with HTML & CSS",
                      "Node.js installed (v18+)",
                    ].map((req) => (
                      <li key={req} className="flex items-start gap-2 text-sm" style={{ color: "#94A3B8" }}>
                        <span style={{ color: "#475569" }}>•</span> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                >
                  <h3 className="text-sm font-bold text-white mb-3">Course Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ backgroundColor: "#334155", color: "#CBD5E1" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                >
                  <h3 className="text-sm font-bold text-white mb-3">Course Includes</h3>
                  <div className="space-y-2 text-sm" style={{ color: "#94A3B8" }}>
                    {[
                      [`${totalLessons} lessons`, <BookOpen key="b" size={14} />],
                      [totalDuration + " of content", <Clock key="c" size={14} />],
                      ["Downloadable resources", <Download key="d" size={14} />],
                      ["Certificate of completion", <Award key="a" size={14} />],
                      ["Community access", <MessageSquare key="m" size={14} />],
                    ].map(([label, icon]) => (
                      <div key={String(label)} className="flex items-center gap-2">
                        <span style={{ color: "#475569" }}>{icon}</span> {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Curriculum */}
          {tab === "curriculum" && (
            <div className="space-y-3">
              {course.sections.length === 0 ? (
                <div
                  className="rounded-2xl p-10 text-center"
                  style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}
                >
                  <p className="text-sm" style={{ color: "#475569" }}>Curriculum details coming soon.</p>
                </div>
              ) : course.sections.map((section) => {
                const open = openSections.has(section.id)
                const secCompleted = section.lessons.filter((l) => isDone(l.id, l.completed)).length
                const secTotal = section.lessons.length
                const secAllDone = secCompleted === secTotal
                const secPct = Math.round((secCompleted / secTotal) * 100)
                return (
                  <div
                    key={section.id}
                    className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "#1E293B", border: `1px solid ${secAllDone ? "#10B98130" : "#334155"}` }}
                  >
                    <button
                      className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
                      onClick={() => toggleSection(section.id)}
                      style={{ backgroundColor: open ? "#0F172A" : "#1E293B" }}
                    >
                      <ChevronDown
                        size={16}
                        style={{ color: "#64748B", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}
                      />
                      <span className="text-sm font-semibold text-white flex-1">{section.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Mini section progress bar */}
                        <div className="w-20 h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${secPct}%`, backgroundColor: secAllDone ? "#10B981" : "#3B82F6" }}
                          />
                        </div>
                        <span className="text-xs" style={{ color: secAllDone ? "#10B981" : "#64748B" }}>
                          {secCompleted}/{secTotal}
                        </span>
                      </div>
                    </button>

                    {open && (
                      <div className="divide-y" style={{ borderColor: "#1E293B" }}>
                        {section.lessons.map((lesson) => {
                          const lessonDone = isDone(lesson.id, lesson.completed)
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 px-5 py-3"
                              style={{ backgroundColor: "#172033" }}
                            >
                              <div className="flex-shrink-0 w-5 flex items-center justify-center">
                                {lessonDone ? (
                                  <CheckCircle2 size={14} style={{ color: "#10B981" }} />
                                ) : lesson.locked || !isEnrolled ? (
                                  <Lock size={13} style={{ color: "#475569" }} />
                                ) : (
                                  lessonTypeIcon(lesson.type)
                                )}
                              </div>
                              <span
                                className="flex-1 text-sm"
                                style={{
                                  color: lesson.locked || !isEnrolled ? "#475569" : lessonDone ? "#64748B" : "#CBD5E1",
                                  textDecoration: lessonDone ? "line-through" : "none",
                                }}
                              >
                                {lesson.title}
                              </span>
                              <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>
                                {lesson.duration}
                              </span>
                              {!lesson.locked && isEnrolled && (
                                <Link
                                  href={`/student/courses/${course.id}/learn/${lesson.id}`}
                                  className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0"
                                  style={{
                                    backgroundColor: lessonDone ? "#10B98115" : "#3B82F620",
                                    color: lessonDone ? "#10B981" : "#60A5FA",
                                  }}
                                >
                                  {lessonDone ? "Redo" : "Start"}
                                </Link>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Resources */}
          {tab === "resources" && (
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #334155" }}>
                <h3 className="text-sm font-semibold text-white">Course Resources</h3>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Download anytime, even after completion.</p>
              </div>
              {resources.map((r, i) => (
                <div
                  key={r.name}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: i < resources.length - 1 ? "1px solid #1E293B40" : "none", backgroundColor: i % 2 === 0 ? "#1A2535" : "#1E293B" }}
                >
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                  >
                    {r.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.name}</p>
                    {r.size !== "—" && <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{r.size}</p>}
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                  >
                    <Download size={13} />
                    {r.type === "GitHub" ? "Open" : "Download"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Discussions */}
          {tab === "discussions" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: "#64748B" }}>{courseDiscussions.length} threads</p>
                <Link
                  href="/student/discussions"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                  style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                >
                  <MessageSquare size={13} /> New Thread
                </Link>
              </div>
              {courseDiscussions.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: "#1E293B", border: `1px solid ${d.isPinned ? "#3B82F640" : "#334155"}` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                    >
                      {d.authorAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{d.title}</span>
                        {d.isPinned && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>Pinned</span>}
                        {d.isSolved && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>Solved</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                        {d.author} · {d.createdAt} · {d.replies} replies · {d.views} views
                      </p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {d.tags.map((tag) => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#334155", color: "#94A3B8" }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          {tab === "reviews" && (
            <div className="space-y-4">
              {/* Rating summary */}
              <div
                className="rounded-2xl p-5 flex items-center gap-8"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
              >
                <div className="text-center">
                  <div className="text-5xl font-black text-white">{course.rating}</div>
                  <div className="flex items-center gap-0.5 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={s <= Math.round(course.rating) ? "#F59E0B" : "none"} style={{ color: "#F59E0B" }} />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#64748B" }}>Course rating</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = stars === 5 ? 78 : stars === 4 ? 15 : stars === 3 ? 5 : stars === 2 ? 1 : 1
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs" style={{ color: "#64748B" }}>
                        <span className="w-3 text-right">{stars}</span>
                        <Star size={11} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#F59E0B" }} />
                        </div>
                        <span className="w-8 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {reviews.map((r) => (
                <div
                  key={r.name}
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                    >
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.name}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={11} fill={s <= r.rating ? "#F59E0B" : "none"} style={{ color: "#F59E0B" }} />
                        ))}
                        <span className="text-xs ml-1" style={{ color: "#64748B" }}>{r.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: "#94A3B8" }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  )
}
