"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  Users, Star, BookOpen, ChevronDown, Edit2, ArrowLeft,
  Video, FileText, HelpCircle, Eye, Loader2, MessageSquare,
  ThumbsUp, Clock, Award, BarChart2,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"
import { coursesApi, type ApiCourse, type ApiReview } from "@/lib/api/courses"
import { authStore } from "@/lib/auth-store"

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED:      { label: "Published",   color: "var(--success)",      bg: "#10B98118" },
  DRAFT:          { label: "Draft",       color: "var(--text-tertiary)", bg: "#33415518" },
  PENDING_REVIEW: { label: "In Review",   color: "var(--warning)",      bg: "#F59E0B18" },
  ARCHIVED:       { label: "Archived",    color: "var(--text-muted)",   bg: "#33415510" },
  REJECTED:       { label: "Rejected",    color: "var(--danger)",       bg: "#EF444418" },
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "#10B981", INTERMEDIATE: "#F59E0B", ADVANCED: "#EF4444", ALL_LEVELS: "#3B82F6",
}

function LessonTypeIcon({ type }: { type: string }) {
  if (type === "QUIZ")    return <HelpCircle size={13} style={{ color: "#8B5CF6" }} />
  if (type === "READING") return <FileText   size={13} style={{ color: "#10B981" }} />
  if (type === "PDF")     return <FileText   size={13} style={{ color: "#F59E0B" }} />
  return                         <Video      size={13} style={{ color: "#3B82F6" }} />
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12}
          fill={s <= rating ? "#F59E0B" : "transparent"}
          style={{ color: s <= rating ? "#F59E0B" : "var(--border-default)" }} />
      ))}
    </span>
  )
}

type Tab = "overview" | "curriculum" | "reviews"

export default function InstructorCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const user = authStore.getUser()

  const [course, setCourse]   = useState<ApiCourse | null>(null)
  const [reviews, setReviews] = useState<ApiReview[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<Tab>("overview")
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))

  useEffect(() => {
    Promise.all([
      coursesApi.getById(id),
      coursesApi.getReviews(id).catch(() => [] as ApiReview[]),
    ]).then(([c, r]) => {
      setCourse(c)
      setReviews(r)
    }).finally(() => setLoading(false))
  }, [id])

  function toggleSection(i: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const totalLessons = course?.sections.reduce((a, s) => a + s.lessons.length, 0) ?? 0
  const avgRating = reviews.length > 0
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : course?.rating ?? 0

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  if (loading) {
    return (
      <InstructorPageShell title="Course" user={{ name: user?.fullName ?? "Instructor", email: user?.email ?? "" }}>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      </InstructorPageShell>
    )
  }

  if (!course) {
    return (
      <InstructorPageShell title="Course" user={{ name: user?.fullName ?? "Instructor", email: user?.email ?? "" }}>
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Course not found.</p>
          <Link href="/instructor/courses" className="mt-3 text-sm font-medium" style={{ color: "var(--accent)" }}>
            Back to courses
          </Link>
        </div>
      </InstructorPageShell>
    )
  }

  const s = STATUS_MAP[course.status] ?? STATUS_MAP.DRAFT

  return (
    <InstructorPageShell
      title={course.title}
      user={{ name: user?.fullName ?? "Instructor", email: user?.email ?? "" }}
      action={
        <Link href={`/instructor/courses/${id}/edit`}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
          <Edit2 size={13} /> Edit Course
        </Link>
      }
    >
      <div className="max-w-4xl space-y-6">

        {/* Back */}
        <Link href="/instructor/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft size={14} /> My Courses
        </Link>

        {/* Header */}
        <div className="rounded-2xl p-6 space-y-4"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ color: s.color, backgroundColor: s.bg }}>
                  {s.label}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {course.category ?? course.level}
                </span>
              </div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{course.title}</h1>
              {course.subtitle && (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{course.subtitle}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Users,    label: "Students Enrolled", value: course.studentsCount.toLocaleString(), color: "#3B82F6" },
              { icon: Star,     label: "Avg Rating",        value: avgRating > 0 ? avgRating.toFixed(1) : "No ratings", color: "#F59E0B" },
              { icon: MessageSquare, label: "Reviews",      value: String(reviews.length || course.reviewCount), color: "#8B5CF6" },
              { icon: BookOpen, label: "Total Lessons",     value: String(totalLessons), color: "#10B981" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
                <Icon size={16} style={{ color, flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {(["overview", "curriculum", "reviews"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
              style={{ backgroundColor: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "#fff" : "var(--text-secondary)" }}>
              {t}
              {t === "reviews" && reviews.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                  style={{ backgroundColor: tab === t ? "rgba(255,255,255,0.2)" : "var(--bg-surface-muted)", color: tab === t ? "#fff" : "var(--text-muted)" }}>
                  {reviews.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && (
          <div className="space-y-5">
            {course.description && (
              <div className="rounded-2xl p-5 space-y-2"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Description</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{course.description}</p>
              </div>
            )}

            {(course.learningObjectives ?? []).filter(Boolean).length > 0 && (
              <div className="rounded-2xl p-5 space-y-3"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Learning Objectives</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(course.learningObjectives as string[]).filter(Boolean).map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <ThumbsUp size={12} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5 space-y-3"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Course Details</p>
                {[
                  { label: "Level",        value: course.level },
                  { label: "Language",     value: course.language ?? "English" },
                  { label: "Price",        value: course.isFree ? "Free" : `$${course.price}` },
                  { label: "Enrollment",   value: course.enrollmentType ?? "Open" },
                  { label: "Certificate",  value: course.certificateOffered ? "Yes" : "No" },
                  { label: "Max Students", value: course.maxStudents ? String(course.maxStudents) : "Unlimited" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Rating summary */}
              <div className="rounded-2xl p-5 space-y-3"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Rating Summary</p>
                {reviews.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No reviews yet.</p>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{avgRating.toFixed(1)}</span>
                      <div>
                        <StarRating rating={Math.round(avgRating)} />
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {ratingDist.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs w-4 text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>{star}</span>
                          <Star size={10} fill="#F59E0B" style={{ color: "#F59E0B", flexShrink: 0 }} />
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
                            <div className="h-full rounded-full" style={{
                              width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%",
                              backgroundColor: "#F59E0B",
                            }} />
                          </div>
                          <span className="text-xs w-4 flex-shrink-0" style={{ color: "var(--text-muted)" }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Curriculum tab */}
        {tab === "curriculum" && (
          <div className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--border-default)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Course Curriculum</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {course.sections.length} sections · {totalLessons} lessons
              </p>
            </div>
            {course.sections.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <BookOpen size={28} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No curriculum yet.</p>
                <Link href={`/instructor/courses/${id}/edit`}
                  className="inline-flex mt-3 text-sm font-medium" style={{ color: "var(--accent)" }}>
                  Add content →
                </Link>
              </div>
            ) : (
              course.sections.map((section, si) => {
                const open = expandedSections.has(si)
                return (
                  <div key={section.id}
                    style={{ borderBottom: si < course.sections.length - 1 ? "1px solid var(--border-default)" : "none" }}>
                    <button type="button" onClick={() => toggleSection(si)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.02]">
                      <ChevronDown size={14} style={{ color: "var(--text-muted)", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s", flexShrink: 0 }} />
                      <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{section.title}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>{section.lessons.length} lessons</span>
                    </button>
                    {open && section.lessons.length > 0 && (
                      <div style={{ borderTop: "1px solid var(--border-default)" }}>
                        {section.lessons.map((lesson, li) => (
                          <div key={lesson.id}
                            className="flex items-center gap-3 px-5 py-2.5"
                            style={{ borderTop: li > 0 ? "1px solid var(--bg-surface-muted)" : "none" }}>
                            <LessonTypeIcon type={lesson.type} />
                            <span className="flex-1 text-sm truncate" style={{ color: "var(--text-secondary)" }}>{lesson.title}</span>
                            {lesson.freePreview && (
                              <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                                <Eye size={9} /> Preview
                              </span>
                            )}
                            {lesson.durationSeconds && lesson.durationSeconds > 0 && (
                              <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                                {Math.ceil(lesson.durationSeconds / 60)}m
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Reviews tab */}
        {tab === "reviews" && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-2xl px-5 py-16 text-center"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <MessageSquare size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No reviews yet</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Reviews from students will appear here.</p>
              </div>
            ) : (
              <>
                {/* Summary row */}
                <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="text-center flex-shrink-0">
                    <p className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>{avgRating.toFixed(1)}</p>
                    <StarRating rating={Math.round(avgRating)} />
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {ratingDist.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-3 text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>{star}</span>
                        <Star size={10} fill="#F59E0B" style={{ color: "#F59E0B", flexShrink: 0 }} />
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${(count / reviews.length) * 100}%`,
                            backgroundColor: "#F59E0B",
                          }} />
                        </div>
                        <span className="text-xs w-4 flex-shrink-0" style={{ color: "var(--text-muted)" }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual reviews */}
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl p-5 space-y-3"
                      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                            style={{ backgroundColor: "var(--accent)20", color: "var(--accent)" }}>
                            {review.studentId.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                              Student {review.studentId.slice(0, 8)}
                            </p>
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                        <p className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </InstructorPageShell>
  )
}
