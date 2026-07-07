"use client"

import { useState, use, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { coursesApi, type ApiCourse, type ApiReview, type ApiSection } from "@/lib/api/courses"
import { enrollmentsApi } from "@/lib/api/enrollments"
import { quizzesApi, type ApiQuiz } from "@/lib/api/quizzes"
import { assignmentsApi, type ApiAssignment } from "@/lib/api/assignments"
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

const MOCK_REVIEWS = [
  { id: "mr1", name: "Taylor R.", rating: 5, date: "May 2025", comment: "Best Next.js course I've taken. Sarah's explanations of Server Components are crystal clear." },
  { id: "mr2", name: "Morgan K.", rating: 5, date: "Apr 2025", comment: "Incredible depth. The system design sections especially. Worth every penny." },
  { id: "mr3", name: "Jordan P.", rating: 4, date: "Mar 2025", comment: "Great content. A few lessons could be shorter but overall excellent." },
  { id: "mr4", name: "Casey B.", rating: 5, date: "Mar 2025", comment: "Perfect for mid-level engineers looking to master production Next.js." },
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

function ApiQuizzesPanel({
  quizzes, courseId, sections, isEnrolled,
}: {
  quizzes: ApiQuiz[]
  courseId: string
  sections: ApiSection[]
  isEnrolled: boolean
}) {
  const allLessons = sections.flatMap((s) => s.lessons)

  return (
    <div className="space-y-3">
      {quizzes.map((quiz, idx) => {
        const lesson = quiz.lessonId ? allLessons.find((l) => l.id === quiz.lessonId) : null
        const title = lesson?.title ?? `Quiz ${idx + 1}`
        const learnHref = quiz.lessonId ? `/student/courses/${courseId}/learn/${quiz.lessonId}` : null
        const qCount = quiz.questions.length

        return (
          <div
            key={quiz.id}
            className="rounded-2xl p-5 shadow-sm flex items-center gap-4 flex-wrap"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
              style={{ backgroundColor: "#8B5CF620" }}
            >
              <HelpCircle size={18} style={{ color: "#8B5CF6" }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>
                {quiz.isMandatory && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#EF444420", color: "var(--danger)" }}>
                    Mandatory
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "var(--text-tertiary)" }}>
                {qCount > 0 && <span>{qCount} question{qCount !== 1 ? "s" : ""}</span>}
                {quiz.timeLimitMinutes && <span><Clock size={11} className="inline mr-0.5" />{quiz.timeLimitMinutes} min</span>}
                <span>Pass: {quiz.passingScore}%</span>
                {quiz.maxAttempts && <span>Max {quiz.maxAttempts} attempt{quiz.maxAttempts !== 1 ? "s" : ""}</span>}
              </div>
            </div>

            {isEnrolled && learnHref ? (
              <Link
                href={learnHref}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl flex-shrink-0"
                style={{ backgroundColor: "#8B5CF6", color: "#fff" }}
              >
                <Play size={13} fill="#fff" /> Take Quiz
              </Link>
            ) : !isEnrolled ? (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Lock size={12} /> Enroll to access
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function ApiAssignmentsPanel({ assignments, isEnrolled }: { assignments: ApiAssignment[]; isEnrolled: boolean }) {
  return (
    <div className="space-y-3">
      {assignments.map((a, idx) => {
        const dueDateStr = a.dueDate ? a.dueDate.slice(0, 10) : null
        return (
          <div
            key={a.id}
            className="rounded-2xl p-5 shadow-sm flex items-start gap-4 flex-wrap"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: "#F59E0B20" }}>
              <PenLine size={18} style={{ color: "var(--warning)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                {a.title || `Assignment ${idx + 1}`}
              </p>
              {a.description && (
                <p className="text-xs mb-2 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{a.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "var(--text-tertiary)" }}>
                <span>Max score: {a.maxScore}</span>
                {dueDateStr && <span>Due: {dueDateStr}</span>}
                {a.allowLateSubmission && <span style={{ color: "var(--success)" }}>Late submissions allowed</span>}
              </div>
            </div>
            {!isEnrolled && (
              <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                <Lock size={12} /> Enroll to submit
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function normLevel(level: string): "Beginner" | "Intermediate" | "Advanced" {
  if (level === "INTERMEDIATE") return "Intermediate"
  if (level === "ADVANCED") return "Advanced"
  return "Beginner"
}

function computeDuration(sections: ApiSection[]): string {
  const secs = sections.reduce(
    (sum, s) => sum + s.lessons.reduce((ls, l) => ls + (l.durationSeconds ?? 0), 0),
    0,
  )
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function CourseDetailContent({ id }: { id: string }) {
  const fallbackCourse = COURSES.find((c) => c.id === id) ?? COURSES[0]
  const [loading, setLoading] = useState(true)
  const [apiCourse, setApiCourse] = useState<ApiCourse | null>(null)
  const [enrollment, setEnrollment] = useState<{ id: string; progressPct: number; lastAccessedLessonId?: string | null } | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [apiQuizzes, setApiQuizzes] = useState<ApiQuiz[]>([])
  const [apiAssignments, setApiAssignments] = useState<ApiAssignment[]>([])

  // Reviews state
  const [apiReviews, setApiReviews] = useState<ApiReview[]>([])
  const [myReview, setMyReview] = useState<ApiReview | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      coursesApi.getById(id).then(setApiCourse).catch(() => {}),
      enrollmentsApi.getForCourse(id).then(setEnrollment).catch(() => {}),
      coursesApi.getReviews(id).then(setApiReviews).catch(() => {}),
      coursesApi.getMyReview(id).then(setMyReview).catch(() => {}),
      quizzesApi.getByCourse(id).then(setApiQuizzes).catch(() => {}),
      assignmentsApi.getByCourse(id).then(setApiAssignments).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [id])

  async function handleSubmitReview() {
    if (!reviewComment.trim()) return
    setReviewSubmitting(true)
    setReviewError(null)
    try {
      const review = await coursesApi.submitReview(id, reviewRating, reviewComment.trim())
      setMyReview(review)
      setApiReviews((prev) => [review, ...prev.filter((r) => r.studentId !== review.studentId)])
      setReviewComment("")
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit review")
    } finally {
      setReviewSubmitting(false)
    }
  }

  // Prefer API data for every field that the API actually returns
  const course = apiCourse
    ? {
        ...fallbackCourse,
        id,          // always use the real URL param, not fallbackCourse.id which may be COURSES[0]
        title: apiCourse.title,
        shortDesc: apiCourse.shortDesc ?? fallbackCourse.shortDesc,
        description: apiCourse.description ?? fallbackCourse.description,
        level: normLevel(apiCourse.level),
        category: apiCourse.category ?? fallbackCourse.category,
        tags: apiCourse.tags.length > 0 ? apiCourse.tags : fallbackCourse.tags,
        price: apiCourse.price === 0 ? "Free" as const : apiCourse.price,
        rating: apiCourse.rating || fallbackCourse.rating,
        reviewCount: apiCourse.reviewCount,
        studentsCount: apiCourse.studentsCount,
        certificateOffered: apiCourse.certificateOffered,
        isMandatory: apiCourse.isMandatory,
        totalDuration: computeDuration(apiCourse.sections) || fallbackCourse.totalDuration,
        progress: enrollment ? enrollment.progressPct : fallbackCourse.progress,
        sections: apiCourse.sections.map((s) => ({
          id: s.id,
          title: s.title,
          lessons: s.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            type: l.type.toLowerCase() as "video" | "quiz" | "reading" | "assignment" | "live",
            duration: l.durationSeconds ? `${Math.ceil(l.durationSeconds / 60)} min` : "",
            completed: false,
            locked: l.locked,
            isPreview: l.freePreview,
          })),
        })),
        // Keep instructor name/title from mock until instructor-details API is available
        instructor: fallbackCourse.instructor,
        instructorTitle: fallbackCourse.instructorTitle,
      } as typeof fallbackCourse
    : fallbackCourse

  const instructorProfile = getInstructorByName(fallbackCourse.instructor)
  const p = STUDENT_PROFILE
  const router = useRouter()
  const { isComplete } = useProgress(id)
  const { isPurchased, purchase } = usePurchases()
  const { threads } = useDiscussions()
  const requestedTab = useSearchParams().get("tab") as Tab | null
  const [tab, setTab] = useState<Tab>(requestedTab ?? "overview")
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["s1", "s2"]))
  const courseAssignments = ASSIGNMENTS.filter((a) => a.courseId === id)
  const courseQuizzes = QUIZZES.filter((q) => q.courseId === id)

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
  const courseDiscussions = threads.filter((d) => d.courseId === id)

  // Only count mock-course progress for THIS specific course, not COURSES[0] fallback
  const thisMockCourse = COURSES.find((c) => c.id === id)
  const isEnrolled = enrollment !== null || thisMockCourse?.progress !== undefined || isPurchased(id)
  const isCourseComplete = progressPct === 100
  const firstLessonId = course.sections[0]?.lessons[0]?.id
  // When API course is loaded, use last-accessed lesson (or first); otherwise use mock nextLessonId
  const continueHref = `/student/courses/${id}/learn/${
    apiCourse
      ? (enrollment?.lastAccessedLessonId || firstLessonId)
      : (course.nextLessonId || firstLessonId)
  }`

  const handleEnroll = async () => {
    if (course.price === "Free" || (apiCourse && apiCourse.price === 0)) {
      setEnrolling(true)
      try {
        const enr = await enrollmentsApi.enroll(id)
        setEnrollment({ id: enr.id, progressPct: 0 })
        purchase(id)
        router.push(continueHref)
      } catch {
        purchase(id)
        router.push(continueHref)
      } finally {
        setEnrolling(false)
      }
    } else {
      router.push(`/student/courses/${id}/checkout`)
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
    .filter((c) => c.id !== id)
    .sort((a, b) => b.studentsCount - a.studentsCount)
    .slice(0, 4)
    .map(toRecommendedItem)

  const alsoBoughtIds = new Set(alsoBought.map((c) => c.id))
  const recommended = [...COURSES]
    .filter((c) => c.id !== id && !alsoBoughtIds.has(c.id))
    .sort((a, b) => {
      const aSame = a.category === course.category ? 1 : 0
      const bSame = b.category === course.category ? 1 : 0
      if (aSame !== bSame) return bSame - aSame
      return b.rating - a.rating
    })
    .slice(0, 4)
    .map(toRecommendedItem)

  if (loading && !apiCourse) {
    return (
      <DashboardLayout role="student" userName={p.name}>
        <div className="max-w-6xl space-y-6 animate-pulse">
          <div className="h-4 w-48 rounded" style={{ backgroundColor: "var(--border-default)" }} />
          <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="h-3 w-24 rounded" style={{ backgroundColor: "var(--border-default)" }} />
                <div className="h-8 w-3/4 rounded" style={{ backgroundColor: "var(--border-default)" }} />
                <div className="h-4 w-full rounded" style={{ backgroundColor: "var(--border-default)" }} />
                <div className="h-4 w-5/6 rounded" style={{ backgroundColor: "var(--border-default)" }} />
              </div>
              <div className="lg:w-72 rounded-xl p-5" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
                <div className="h-28 rounded-lg mb-4" style={{ backgroundColor: "var(--border-default)" }} />
                <div className="h-10 rounded-xl" style={{ backgroundColor: "var(--border-default)" }} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-9 w-24 rounded-lg" style={{ backgroundColor: "var(--border-default)" }} />)}
          </div>
          <div className="rounded-2xl p-6 space-y-3" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            {[1, 2, 3].map((i) => <div key={i} className="h-4 rounded" style={{ backgroundColor: "var(--border-default)", width: `${90 - i * 10}%` }} />)}
          </div>
        </div>
      </DashboardLayout>
    )
  }

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
                    <div className="space-y-2">
                      <Link
                        href={continueHref}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold"
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                      >
                        <Play size={15} fill="#fff" /> Watch Again
                      </Link>
                      <Link
                        href={`/student/certificates?course=${id}`}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold"
                        style={{ backgroundColor: "var(--success)", color: "#fff" }}
                      >
                        <Award size={15} /> View Certificate
                      </Link>
                    </div>
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
                    disabled={enrolling}
                    className="block w-full text-center py-3 rounded-xl text-sm font-bold mb-2 disabled:opacity-70 transition-opacity"
                    style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                  >
                    {enrolling ? "Enrolling…" : course.price === "Free" ? "Enroll for Free" : "Enroll Now"}
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
              {t === "assignments" && (apiAssignments.length > 0 || courseAssignments.length > 0) && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                  {apiAssignments.length > 0 ? apiAssignments.length : courseAssignments.length}
                </span>
              )}
              {t === "quizzes" && (apiQuizzes.length > 0 || courseQuizzes.length > 0) && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                  {apiQuizzes.length > 0 ? apiQuizzes.length : courseQuizzes.length}
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
                    {(apiCourse?.learningObjectives?.length
                      ? apiCourse.learningObjectives
                      : [
                          "Build production-ready applications",
                          "Master Server Components & streaming",
                          "Implement robust data fetching patterns",
                          "Optimize performance (Core Web Vitals)",
                          "Deploy to Vercel and AWS",
                          "Write type-safe code with TypeScript",
                          "Design scalable component architecture",
                          "Handle authentication & authorization",
                        ]
                    ).map((item) => (
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
                    {(apiCourse?.requirements?.length
                      ? apiCourse.requirements
                      : ["Basic JavaScript knowledge (ES6+)", "Familiarity with HTML & CSS", "Node.js installed (v18+)"]
                    ).map((req) => (
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
              ) : course.sections.map((section, si) => {
                const open = openSections.has(section.id)
                const secCompleted = section.lessons.filter((l) => isDone(l.id, l.completed)).length
                const secTotal = section.lessons.length
                const secAllDone = secCompleted === secTotal
                const secPct = Math.round((secCompleted / secTotal) * 100)
                return (
                  <div
                    key={`${si}-${section.id}`}
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
                        {section.lessons.map((lesson, li) => {
                          const lessonDone = isDone(lesson.id, lesson.completed)
                          return (
                            <div
                              key={`${section.id}-${li}-${lesson.id}`}
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
                                  href={`/student/courses/${id}/learn/${lesson.id}`}
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
          {tab === "assignments" && (
            apiAssignments.length > 0
              ? <ApiAssignmentsPanel assignments={apiAssignments} isEnrolled={isEnrolled} />
              : <CourseAssignments assignments={courseAssignments} />
          )}

          {/* Quizzes & Exams */}
          {tab === "quizzes" && (
            apiQuizzes.length > 0 ? (
              <ApiQuizzesPanel quizzes={apiQuizzes} courseId={id} sections={apiCourse?.sections ?? []} isEnrolled={isEnrolled} />
            ) : (
              <CourseQuizzes quizzes={courseQuizzes} />
            )
          )}

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
                  href={`/student/discussions?scope=course:${id}&new=1`}
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
          {tab === "reviews" && (() => {
            const displayReviews = apiReviews.length > 0 ? apiReviews : null
            const total = displayReviews?.length ?? 0
            const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
              const count = displayReviews?.filter((r) => r.rating === stars).length ?? 0
              return { stars, pct: total > 0 ? Math.round((count / total) * 100) : stars === 5 ? 78 : stars === 4 ? 15 : stars === 3 ? 5 : 1 }
            })
            return (
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
                    {ratingDistribution.map(({ stars, pct }) => (
                      <div key={stars} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        <span className="w-3 text-right">{stars}</span>
                        <Star size={11} fill="var(--warning)" style={{ color: "var(--warning)" }} />
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--warning)" }} />
                        </div>
                        <span className="w-8 text-right">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write a review — shown only if enrolled and haven't reviewed yet */}
                {isEnrolled && !myReview && (
                  <div
                    className="rounded-2xl p-5 shadow-sm"
                    style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                  >
                    <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Write a Review</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setReviewRating(s)}>
                          <Star
                            size={22}
                            fill={s <= reviewRating ? "var(--warning)" : "none"}
                            style={{ color: "var(--warning)", cursor: "pointer" }}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm" style={{ color: "var(--text-tertiary)" }}>{reviewRating}/5</span>
                    </div>
                    <textarea
                      className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)", minHeight: 100 }}
                      placeholder="Share your experience with this course..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                    />
                    {reviewError && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{reviewError}</p>}
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleSubmitReview}
                        disabled={!reviewComment.trim() || reviewSubmitting}
                        className="text-sm px-4 py-2 rounded-xl font-semibold disabled:opacity-50"
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                      >
                        {reviewSubmitting ? "Submitting…" : "Submit Review"}
                      </button>
                    </div>
                  </div>
                )}

                {myReview && (
                  <div
                    className="rounded-2xl p-4 shadow-sm"
                    style={{ backgroundColor: "var(--bg-surface)", border: "1px solid #10B98140" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                      <span className="text-xs font-semibold" style={{ color: "var(--success)" }}>Your Review</span>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} fill={s <= myReview.rating ? "var(--warning)" : "none"} style={{ color: "var(--warning)" }} />
                      ))}
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{myReview.comment}</p>
                  </div>
                )}

                {/* Review list — API data or fallback mock */}
                {(displayReviews ?? MOCK_REVIEWS).map((r) => {
                  const isApiReview = "studentId" in r
                  const name = isApiReview ? `Student` : (r as typeof MOCK_REVIEWS[0]).name
                  const date = isApiReview
                    ? new Date((r as ApiReview).createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : (r as typeof MOCK_REVIEWS[0]).date
                  return (
                    <div
                      key={r.id}
                      className="rounded-2xl p-4 shadow-sm"
                      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                        >
                          {name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{name}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={11} fill={s <= r.rating ? "var(--warning)" : "none"} style={{ color: "var(--warning)" }} />
                            ))}
                            <span className="text-xs ml-1" style={{ color: "var(--text-tertiary)" }}>{date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.comment}</p>
                    </div>
                  )
                })}
              </div>
            )
          })()}

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
