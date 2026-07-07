"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TrainingCard } from "@/components/TrainingCard"
import { STUDENT_PROFILE } from "@/lib/data/courses"
import { TRAINING_TRACKS } from "@/lib/data/trainings"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { useAllProgress } from "@/lib/hooks/useProgress"
import { useTrainingEnrollments } from "@/lib/hooks/useTrainingEnrollments"
import { useAllTrainingProgress } from "@/lib/hooks/useTrainingProgress"
import { getTrainingProgress } from "@/lib/trainingProgress"
import { useMyEnrollments } from "@/lib/hooks/useMyEnrollments"
import { BookOpen, Play, CheckCircle2, Clock, Compass, GraduationCap, Loader2, Star } from "lucide-react"

interface DisplayCourse {
  id: string
  title: string
  instructor: string
  thumbnail: string
  thumbnailColor: string
  thumbnailUrl?: string | null
  level: string
  totalDuration: string
  progress: number
  certificateOffered: boolean
  resumeLessonId?: string | null
  grade?: number
}

const levelColors: Record<string, string> = {
  Beginner: "var(--success)",
  BEGINNER: "var(--success)",
  Intermediate: "var(--warning)",
  INTERMEDIATE: "var(--warning)",
  Advanced: "var(--danger)",
  ADVANCED: "var(--danger)",
}

function CourseCard({ course }: { course: DisplayCourse }) {
  const isDone = course.progress === 100
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-150 shadow-sm"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
    >
      <div className="relative overflow-hidden h-28 flex-shrink-0">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.thumbnailUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${course.thumbnailColor}55 0%, #0F172A80 100%)` }} />
        <div className="absolute bottom-2 right-2 flex items-center justify-center w-8 h-8 rounded-lg text-lg"
          style={{ backgroundColor: "#0F172AE6", border: `1px solid ${course.thumbnailColor}60` }}>
          {course.thumbnail}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>{course.title}</h3>
        <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>{course.instructor}</p>
        <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <span className="flex items-center gap-1"><Clock size={11} /> {course.totalDuration}</span>
          <span className="font-semibold" style={{ color: levelColors[course.level] ?? "var(--text-secondary)" }}>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()}
          </span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between mb-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${course.progress}%`, backgroundColor: isDone ? "var(--success)" : course.thumbnailColor }} />
          </div>
        </div>
        <div className="mt-auto flex gap-2">
          <Link href={`/student/courses/${course.id}`}
            className="flex-1 text-center py-2 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: "var(--border-default)", color: "#CBD5E1" }}>
            View Details
          </Link>
          {isDone ? (
            <Link href={`/student/certificates?course=${course.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: "#10B98120", color: "var(--success)" }}>
              <CheckCircle2 size={12} /> Certificate
            </Link>
          ) : course.resumeLessonId ? (
            <Link href={`/student/courses/${course.id}/learn/${course.resumeLessonId}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              <Play size={12} fill="#fff" /> Resume
            </Link>
          ) : null}
        </div>
        {course.grade !== undefined && (
          <p className="text-xs text-center mt-2 flex items-center justify-center gap-1" style={{ color: "var(--text-tertiary)" }}>
            <Star size={11} style={{ color: "var(--warning)" }} /> Grade: {course.grade}%
          </p>
        )}
      </div>
    </div>
  )
}

export default function MyLearningPage() {
  const p = STUDENT_PROFILE
  const { purchasedIds } = usePurchases()
  const allCourseProgress = useAllProgress()
  const { isEnrolled } = useTrainingEnrollments()
  const allTrainingProgress = useAllTrainingProgress()

  const { items: apiEnrollments, loading: enrollmentsLoading } = useMyEnrollments(Array.from(purchasedIds))

  const myCourses: DisplayCourse[] = apiEnrollments.map(({ course, enrollment }) => {
    const totalLessons = course.sections.reduce((n, s) => n + s.lessons.length, 0)
    const localIds = allCourseProgress[course.id] ?? []
    const localPct = totalLessons > 0 ? Math.round((localIds.length / totalLessons) * 100) : 0
    return {
      id: course.id,
      title: course.title,
      instructor: "Instructor",
      thumbnail: "📚",
      thumbnailColor: "#3B82F6",
      thumbnailUrl: course.thumbnailUrl,
      level: course.level ?? "BEGINNER",
      totalDuration: course.totalDurationSeconds
        ? `${Math.round(course.totalDurationSeconds / 3600)}h`
        : "—",
      progress: enrollment.progressPct > 0 ? enrollment.progressPct : localPct,
      certificateOffered: course.certificateOffered,
      resumeLessonId: enrollment.lastAccessedLessonId
        ?? course.sections[0]?.lessons[0]?.id
        ?? null,
    }
  })

  const myTrainings = TRAINING_TRACKS
    .filter((t) => t.enrolled || isEnrolled(t.id))
    .map((t) => ({ ...t, progress: getTrainingProgress(t, allTrainingProgress).progressPct }))

  const completedCourses = myCourses.filter((c) => c.progress === 100).length
  const completedTrainings = myTrainings.filter((t) => t.progress === 100).length

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>My Learning</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {myCourses.length} courses · {myTrainings.length} trainings · {completedCourses + completedTrainings} completed
            </p>
          </div>
          <Link href="/student/explore"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
            <Compass size={15} /> Browse Catalog
          </Link>
        </div>

        {/* My Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <BookOpen size={16} style={{ color: "var(--accent)" }} /> My Courses
              <span className="text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>({myCourses.length})</span>
            </h2>
            {myCourses.length > 0 && (
              <Link href="/student/courses" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>View all courses →</Link>
            )}
          </div>

          {enrollmentsLoading ? (
            <div className="flex items-center gap-2 py-6" style={{ color: "var(--text-muted)" }}>
              <Loader2 size={16} className="animate-spin" /> Loading your courses…
            </div>
          ) : myCourses.length === 0 ? (
            <div className="rounded-2xl p-10 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
              <BookOpen size={32} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>No courses yet</p>
              <Link href="/student/explore" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Browse the catalog →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {myCourses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          )}
        </div>

        {/* My Trainings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <GraduationCap size={16} style={{ color: "#8B5CF6" }} /> My Trainings
              <span className="text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>({myTrainings.length})</span>
            </h2>
            {myTrainings.length > 0 && (
              <Link href="/student/my-trainings" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>View all trainings →</Link>
            )}
          </div>

          {myTrainings.length === 0 ? (
            <div className="rounded-2xl p-10 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
              <GraduationCap size={32} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>No trainings yet</p>
              <Link href="/student/trainings" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Browse training tracks →</Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-5">
              {myTrainings.map((track) => <TrainingCard key={track.id} track={track} />)}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
