"use client"

import { useState, use, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import { RecommendedSection } from "@/components/RecommendedSection"
import type { RecommendedItem } from "@/components/RecommendedSection"
import { CourseAssignments } from "@/components/course/CourseAssignments"
import { CourseQuizzes } from "@/components/course/CourseQuizzes"
import { COURSES, ASSIGNMENTS, QUIZZES, STUDENT_PROFILE } from "@/lib/data/courses"
import { useDiscussions } from "@/lib/hooks/useDiscussions"
import type { Course } from "@/lib/data/courses"
import { getInstructorByName } from "@/lib/data/instructors"
import { useProgress } from "@/lib/hooks/useProgress"
import { usePurchases } from "@/lib/hooks/usePurchases"
import {
  Play, Clock, Star, Users, BookOpen, CheckCircle2, Lock,
  ChevronDown, ChevronRight, Award, MessageSquare, FileText,
  Video, HelpCircle, PenLine, Wifi, Download,
} from "lucide-react"

type Tab = "overview" | "curriculum" | "assignments" | "quizzes" | "resources" | "discussions" | "reviews"

const levelColors: Record<string, string> = { Beginner: "#10B981", Intermediate: "#F59E0B", Advanced: "#EF4444" }

const lessonTypeIcon = (type: string) => {
  switch (type) {
    case "video": return <Video size={13} style={{ color: "var(--accent)" }} />
    case "quiz": return <HelpCircle size={13} style={{ color: "#8B5CF6" }} />
    case "reading": return <FileText size={13} style={{ color: "var(--success)" }} />
    case "assignment": return <PenLine size={13} style={{ color: "var(--warning)" }} />
    case "live": return <Wifi size={13} style={{ color: "#EC4899" }} />
    default: return <Video size={13} style={{ color: "var(--accent)" }} />
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
  return (
    <Suspense fallback={null}>
      <CourseDetailContent id={id} />
    </Suspense>
  )
}

function CourseDetailContent({ id }: { id: string }) {
  const course = COURSES.find((c) => c.id === id) ?? COURSES[0]
  const instructorProfile = getInstructorByName(course.instructor)
  const p = STUDENT_PROFILE
  const router = useRouter()
  const { isComplete } = useProgress(id)
  const { isPurchased, purchase } = usePurchases()
  const { threads } = useDiscussions()
  const requestedTab = useSearchParams().get("tab") as Tab | null
  const [tab, setTab] = useState<Tab>(requestedTab ?? "overview")
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["s1", "s2"]))
  const courseAssignments = ASSIGNMENTS.filter((a) => a.courseId === course.id)
  const courseQuizzes = QUIZZES.filter((q) => q.courseId === course.id)

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
  const courseDiscussions = threads.filter((d) => d.courseId === course.id)

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

  const toRecommendedItem = (c: Course): RecommendedItem => ({
    id: c.id,
    href: `/student/courses/${c.id}`,
    thumbnail: c.thumbnail,
    thumbnailColor: c.thumbnailColor,
    title: c.title,
    meta: c.instructor,
    rating: c.rating,
    reviewCount: c.reviewCount,
    priceLabel: c.price === "Free" ? "Free" : `$${c.price}`,
  })

  const alsoBought = [...COURSES]
    .filter((c) => c.id !== course.id)
    .sort((a, b) => b.studentsCount - a.studentsCount)
    .slice(0, 4)
    .map(toRecommendedItem)

  const alsoBoughtIds = new Set(alsoBought.map((c) => c.id))
  const recommended = [...COURSES]
    .filter((c) => c.id !== course.id && !alsoBoughtIds.has(c.id))
    .sort((a, b) => {
      const aSame = a.category === course.category ? 1 : 0
      const bSame = b.category === course.category ? 1 : 0
      if (aSame !== bSame) return bSame - aSame
      return b.rating - a.rating
    })
    .slice(0, 4)
    .map(toRecommendedItem)

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="max-w-6xl space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <Link href="/student/courses" style={{ color: "var(--accent)" }}>My Courses</Link>
          <ChevronRight size={12} />
          <span style={{ color: "var(--text-primary)" }}>{course.title}</span>
        </div>

        {/* Hero */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
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
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EF444420", color: "var(--danger)" }}>
                    Mandatory
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{course.title}</h1>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{course.shortDesc}</p>

              <div className="flex items-center gap-5 flex-wrap text-sm" style={{ color: "var(--text-tertiary)" }}>
                <span className="flex items-center gap-1.5">
                  <Star size={14} style={{ color: "var(--warning)" }} fill="var(--warning)" />
                  <strong style={{ color: "var(--text-primary)" }}>{course.rating}</strong>
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

              <p className="text-sm mt-4" style={{ color: "var(--text-secondary)" }}>
                Instructor:{" "}
                {instructorProfile ? (
                  <Link href={`/instructors/${instructorProfile.id}`} className="font-bold hover:underline" style={{ color: "var(--text-primary)" }}>
                    {course.instructor}
                  </Link>
                ) : (
                  <strong style={{ color: "var(--text-primary)" }}>{course.instructor}</strong>
                )}
                <span className="ml-2" style={{ color: "var(--text-tertiary)" }}>{course.instructorTitle}</span>
              </p>
            </div>

            {/* Right panel */}
            <div
              className="lg:w-72 rounded-xl p-5 flex-shrink-0"
              style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
            >
              <CourseThumbnail course={course} heightClass="h-28 mb-4" roundedClass="rounded-lg" locked={course.price !== "Free" && !isEnrolled} />

              {isEnrolled ? (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>
                      <span>{completedLessons}/{totalLessons} lessons</span>
                      <span style={{ color: progressPct === 100 ? "var(--success)" : "var(--text-secondary)" }}>{progressPct}% complete</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? "var(--success)" : course.thumbnailColor }}
                      />
                    </div>
                  </div>
                  {isCourseComplete ? (
                    <Link
                      href="/student/certificates"
                      className="block w-full text-center py-3 rounded-xl text-sm font-bold"
                      style={{ backgroundColor: "var(--success)", color: "#fff" }}
                    >
                      <CheckCircle2 size={16} className="inline mr-2" /> View Certificate
                    </Link>
                  ) : (
                    <Link
                      href={continueHref}
                      className="block w-full text-center py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                    >
                      <Play size={16} fill="#fff" /> {completedLessons === 0 ? "Start Learning" : "Continue Learning"}
                    </Link>
                  )}
                  {course.grade !== undefined && (
                    <p className="text-xs text-center mt-2" style={{ color: "var(--text-tertiary)" }}>
                      Current grade: <strong style={{ color: "var(--text-primary)" }}>{course.grade}%</strong>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                    {course.price === "Free" ? "Free" : `$${course.price}`}
                  </div>
                  <button
                    onClick={handleEnroll}
                    className="block w-full text-center py-3 rounded-xl text-sm font-bold mb-2"
                    style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                  >
                    {course.price === "Free" ? "Enroll for Free" : "Enroll Now"}
                  </button>
                  <p className="text-xs text-center" style={{ color: "var(--text-tertiary)" }}>30-day money-back guarantee</p>
                </>
              )}

              {course.certificateOffered && (
                <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  <Award size={13} style={{ color: "var(--warning)" }} />
                  Certificate of completion included
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b" style={{ borderColor: "var(--border-default)" }}>
          {(["overview", "curriculum", "assignments", "quizzes", "resources", "discussions", "reviews"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium capitalize transition-colors relative"
              style={{ color: tab === t ? "#60A5FA" : "var(--text-tertiary)" }}
            >
              {t === "quizzes" ? "Quizzes & Exams" : t}
              {t === "assignments" && courseAssignments.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                  {courseAssignments.length}
                </span>
              )}
              {t === "quizzes" && courseQuizzes.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                  {courseQuizzes.length}
                </span>
              )}
              {t === "discussions" && courseDiscussions.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                  {courseDiscussions.length}
                </span>
              )}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ backgroundColor: "var(--accent)" }} />
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
                  className="rounded-2xl p-5 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                >
                  <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>About This Course</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{course.description}</p>
                </div>

                <div
                  className="rounded-2xl p-5 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                >
                  <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>What You&apos;ll Learn</h3>
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
                      <div key={item} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-5 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                >
                  <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Requirements</h3>
                  <ul className="space-y-2">
                    {[
                      "Basic JavaScript knowledge (ES6+)",
                      "Familiarity with HTML & CSS",
                      "Node.js installed (v18+)",
                    ].map((req) => (
                      <li key={req} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <span style={{ color: "var(--text-muted)" }}>•</span> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className="rounded-2xl p-5 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                >
                  <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Course Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ backgroundColor: "var(--border-default)", color: "#CBD5E1" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-5 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                >
                  <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Course Includes</h3>
                  <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {[
                      [`${totalLessons} lessons`, <BookOpen key="b" size={14} />],
                      [totalDuration + " of content", <Clock key="c" size={14} />],
                      ["Downloadable resources", <Download key="d" size={14} />],
                      ["Certificate of completion", <Award key="a" size={14} />],
                      ["Community access", <MessageSquare key="m" size={14} />],
                    ].map(([label, icon]) => (
                      <div key={String(label)} className="flex items-center gap-2">
                        <span style={{ color: "var(--text-muted)" }}>{icon}</span> {label}
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
                  className="rounded-2xl p-10 text-center shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}
                >
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Curriculum details coming soon.</p>
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
                    className="rounded-2xl overflow-hidden shadow-sm"
                    style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${secAllDone ? "#10B98130" : "var(--border-default)"}` }}
                  >
                    <button
                      className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
                      onClick={() => toggleSection(section.id)}
                      style={{ backgroundColor: open ? "var(--bg-surface-muted)" : "var(--bg-surface)" }}
                    >
                      <ChevronDown
                        size={16}
                        style={{ color: "var(--text-tertiary)", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}
                      />
                      <span className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>{section.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Mini section progress bar */}
                        <div className="w-20 h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${secPct}%`, backgroundColor: secAllDone ? "var(--success)" : "var(--accent)" }}
                          />
                        </div>
                        <span className="text-xs" style={{ color: secAllDone ? "var(--success)" : "var(--text-tertiary)" }}>
                          {secCompleted}/{secTotal}
                        </span>
                      </div>
                    </button>

                    {open && (
                      <div className="divide-y" style={{ borderColor: "var(--bg-surface)" }}>
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
                                  <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                                ) : lesson.locked || !isEnrolled ? (
                                  <Lock size={13} style={{ color: "var(--text-muted)" }} />
                                ) : (
                                  lessonTypeIcon(lesson.type)
                                )}
                              </div>
                              <span
                                className="flex-1 text-sm"
                                style={{
                                  color: lesson.locked || !isEnrolled ? "var(--text-muted)" : lessonDone ? "var(--text-tertiary)" : "#CBD5E1",
                                  textDecoration: lessonDone ? "line-through" : "none",
                                }}
                              >
                                {lesson.title}
                              </span>
                              <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                                {lesson.duration}
                              </span>
                              {!lesson.locked && isEnrolled && (
                                <Link
                                  href={`/student/courses/${course.id}/learn/${lesson.id}`}
                                  className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0"
                                  style={{
                                    backgroundColor: lessonDone ? "#10B98115" : "#3B82F620",
                                    color: lessonDone ? "var(--success)" : "#60A5FA",
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

          {/* Assignments */}
          {tab === "assignments" && <CourseAssignments assignments={courseAssignments} />}

          {/* Quizzes & Exams */}
          {tab === "quizzes" && <CourseQuizzes quizzes={courseQuizzes} />}

          {/* Resources */}
          {tab === "resources" && (
            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-default)" }}>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Course Resources</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Download anytime, even after completion.</p>
              </div>
              {resources.map((r, i) => (
                <div
                  key={r.name}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: i < resources.length - 1 ? "1px solid #1E293B40" : "none", backgroundColor: i % 2 === 0 ? "var(--bg-surface-muted)" : "var(--bg-surface)" }}
                >
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                  >
                    {r.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                    {r.size !== "—" && <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{r.size}</p>}
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
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
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>{courseDiscussions.length} threads</p>
                <Link
                  href={`/student/discussions?scope=course:${course.id}&new=1`}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  <MessageSquare size={13} /> New Thread
                </Link>
              </div>
              {courseDiscussions.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl p-4 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${d.isPinned ? "#3B82F640" : "var(--border-default)"}` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                    >
                      {d.authorAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.title}</span>
                        {d.isPinned && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>Pinned</span>}
                        {d.isSolved && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#10B98120", color: "var(--success)" }}>Solved</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {d.author} · {d.createdAt} · {d.replies} replies · {d.views} views
                      </p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {d.tags.map((tag) => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
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
                className="rounded-2xl p-5 flex items-center gap-8 shadow-sm"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
              >
                <div className="text-center">
                  <div className="text-5xl font-black" style={{ color: "var(--text-primary)" }}>{course.rating}</div>
                  <div className="flex items-center gap-0.5 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={s <= Math.round(course.rating) ? "var(--warning)" : "none"} style={{ color: "var(--warning)" }} />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Course rating</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = stars === 5 ? 78 : stars === 4 ? 15 : stars === 3 ? 5 : stars === 2 ? 1 : 1
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        <span className="w-3 text-right">{stars}</span>
                        <Star size={11} fill="var(--warning)" style={{ color: "var(--warning)" }} />
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--warning)" }} />
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
                  className="rounded-2xl p-4 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                    >
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={11} fill={s <= r.rating ? "var(--warning)" : "none"} style={{ color: "var(--warning)" }} />
                        ))}
                        <span className="text-xs ml-1" style={{ color: "var(--text-tertiary)" }}>{r.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Students also bought + Recommended */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecommendedSection title="Students Also Bought" items={alsoBought} />
          <RecommendedSection title="Recommended For You" items={recommended} />
        </div>
      </div>
    </DashboardLayout>
  )
}
