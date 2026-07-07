"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { coursesApi, type ApiCourse, type ApiReview } from "@/lib/api/courses"
import { authStore } from "@/lib/auth-store"
import {
  ChevronLeft, CheckCircle2, XCircle, Loader2, BookOpen, Video, FileText,
  HelpCircle, Users, Star, Clock, Globe, Tag, ChevronDown, AlertTriangle,
  Eye, BarChart2, DollarSign, MessageSquare,
} from "lucide-react"

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED:      { label: "Published",     color: "#34D399", bg: "#10B98120" },
  DRAFT:          { label: "Draft",         color: "#94A3B8", bg: "#64748B20" },
  PENDING_REVIEW: { label: "Pending Review",color: "#FCD34D", bg: "#F59E0B20" },
  ARCHIVED:       { label: "Archived",      color: "#94A3B8", bg: "#33415520" },
  REJECTED:       { label: "Rejected",      color: "#F87171", bg: "#EF444420" },
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "#10B981", INTERMEDIATE: "#F59E0B", ADVANCED: "#EF4444", ALL_LEVELS: "#3B82F6",
}

function LessonTypeIcon({ type }: { type: string }) {
  if (type === "QUIZ")    return <HelpCircle size={12} style={{ color: "#8B5CF6" }} />
  if (type === "READING") return <FileText   size={12} style={{ color: "#10B981" }} />
  if (type === "PDF")     return <FileText   size={12} style={{ color: "#F59E0B" }} />
  return                         <Video      size={12} style={{ color: "#3B82F6" }} />
}

export default function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const user = authStore.getUser()

  const [course, setCourse]           = useState<ApiCourse | null>(null)
  const [reviews, setReviews]         = useState<ApiReview[]>([])
  const [loading, setLoading]         = useState(true)
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null)
  const [toast, setToast]             = useState<{ text: string; ok: boolean } | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))

  function showToast(text: string, ok: boolean) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    Promise.all([
      coursesApi.getById(id),
      coursesApi.getReviews(id).catch(() => [] as ApiReview[]),
    ]).then(([c, r]) => {
      setCourse(c)
      setReviews(r)
    }).catch(() => showToast("Failed to load course", false))
      .finally(() => setLoading(false))
  }, [id])

  async function handleApprove() {
    setActionLoading("approve")
    try {
      const updated = await coursesApi.approve(id)
      setCourse(updated)
      showToast("Course approved and published!", true)
    } catch {
      showToast("Failed to approve course", false)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return
    setActionLoading("reject")
    try {
      const updated = await coursesApi.reject(id, rejectReason.trim())
      setCourse(updated)
      setShowRejectModal(false)
      setRejectReason("")
      showToast("Course rejected.", true)
    } catch {
      showToast("Failed to reject course", false)
    } finally {
      setActionLoading(null)
    }
  }

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

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{ backgroundColor: toast.ok ? "#10B98120" : "#EF444420", color: toast.ok ? "#10B981" : "#EF4444", border: `1px solid ${toast.ok ? "#10B98140" : "#EF444440"}` }}>
          {toast.text}
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EF444420" }}>
                <XCircle size={18} style={{ color: "#EF4444" }} />
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Reject Course</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>The instructor will be notified with your feedback.</p>
              </div>
            </div>
            <textarea
              autoFocus
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this course is being rejected (required)…"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowRejectModal(false); setRejectReason("") }}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                Cancel
              </button>
              <button onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === "reject"}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "#EF4444" }}>
                {actionLoading === "reject" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Reject Course
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : !course ? (
        <div className="flex flex-col items-center justify-center py-32">
          <BookOpen size={36} className="mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Course not found.</p>
          <Link href="/admin/courses" className="mt-4 text-sm font-medium" style={{ color: "var(--accent)" }}>
            Back to courses
          </Link>
        </div>
      ) : (
        <div className="max-w-5xl space-y-6">

          {/* Top bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Link href="/admin/courses"
              className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "var(--text-secondary)" }}>
              <ChevronLeft size={16} /> All Courses
            </Link>
            <div className="flex items-center gap-2">
              {course.status === "PENDING_REVIEW" && (
                <>
                  <button onClick={() => setShowRejectModal(true)} disabled={!!actionLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}>
                    <XCircle size={14} /> Reject
                  </button>
                  <button onClick={handleApprove} disabled={!!actionLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#10B981" }}>
                    {actionLoading === "approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Approve & Publish
                  </button>
                </>
              )}
              {course.status === "PUBLISHED" && (
                <button onClick={() => setShowRejectModal(true)} disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}>
                  <XCircle size={14} /> Unpublish
                </button>
              )}
            </div>
          </div>

          {/* Rejection banner */}
          {course.status === "REJECTED" && course.rejectionReason && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: "#EF444415", border: "1px solid #EF444430" }}>
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#EF4444" }}>Rejection Reason</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{course.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Header card */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const s = STATUS_STYLES[course.status] ?? STATUS_STYLES.DRAFT
                    return (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ color: s.color, backgroundColor: s.bg }}>
                        {s.label}
                      </span>
                    )
                  })()}
                  {course.featured && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ color: "#F59E0B", backgroundColor: "#F59E0B20" }}>
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{course.title}</h1>
                {course.subtitle && (
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{course.subtitle}</p>
                )}
                <div className="flex items-center gap-4 flex-wrap pt-1">
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Globe size={12} /> {course.language ?? "English"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: LEVEL_COLORS[course.level] ?? "#3B82F6" }}>
                    <BarChart2 size={12} /> {course.level}
                  </span>
                  {course.category && (
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      <Tag size={12} /> {course.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <BookOpen size={12} /> {totalLessons} lessons in {course.sections.length} sections
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {[
                  { icon: Users,         label: "Students",   value: course.studentsCount.toLocaleString(),                           color: "#3B82F6" },
                  { icon: Star,          label: "Avg Rating", value: avgRating > 0 ? avgRating.toFixed(1) : "No ratings",             color: "#F59E0B" },
                  { icon: MessageSquare, label: "Reviews",    value: String(reviews.length || course.reviewCount),                    color: "#8B5CF6" },
                  { icon: DollarSign,    label: "Price",      value: course.isFree ? "Free" : `$${course.price}`,                     color: "#10B981" },
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left col */}
            <div className="lg:col-span-2 space-y-6">

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
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>What Students Will Learn</p>
                  <ul className="space-y-2">
                    {(course.learningObjectives as string[]).filter(Boolean).map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#10B981" }} />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curriculum */}
              <div className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Curriculum</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {course.sections.length} sections · {totalLessons} lessons
                  </p>
                </div>
                {course.sections.map((section, si) => {
                  const open = expandedSections.has(si)
                  return (
                    <div key={section.id} style={{ borderBottom: si < course.sections.length - 1 ? "1px solid var(--border-default)" : "none" }}>
                      <button type="button" onClick={() => toggleSection(si)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.02]">
                        <ChevronDown size={13} style={{ color: "var(--text-muted)", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s", flexShrink: 0 }} />
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
                                <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                                  <Clock size={10} /> {Math.ceil(lesson.durationSeconds / 60)}m
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
                {course.sections.length === 0 && (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No curriculum added yet.</p>
                  </div>
                )}
              </div>

              {/* Reviews section */}
              <div className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Student Reviews</p>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: "#F59E0B" }}>{avgRating.toFixed(1)}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={11} fill={s <= Math.round(avgRating) ? "#F59E0B" : "transparent"} style={{ color: s <= Math.round(avgRating) ? "#F59E0B" : "var(--border-default)" }} />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>({reviews.length})</span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <MessageSquare size={28} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No reviews yet.</p>
                  </div>
                ) : (
                  <div>
                    {/* Rating distribution */}
                    <div className="px-5 py-4 space-y-2" style={{ borderBottom: "1px solid var(--border-default)" }}>
                      {ratingDist.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs w-3 text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>{star}</span>
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
                    {/* Review cards */}
                    <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
                      {reviews.map((review) => (
                        <div key={review.id} className="px-5 py-4 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                style={{ backgroundColor: "var(--accent)20", color: "var(--accent)" }}>
                                {review.studentId.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                  Student {review.studentId.slice(0, 8)}
                                </p>
                                <div className="flex gap-0.5 mt-0.5">
                                  {[1,2,3,4,5].map((s) => (
                                    <Star key={s} size={10} fill={s <= review.rating ? "#F59E0B" : "transparent"} style={{ color: s <= review.rating ? "#F59E0B" : "var(--border-default)" }} />
                                  ))}
                                </div>
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
                  </div>
                )}
              </div>
            </div>

            {/* Right col */}
            <div className="space-y-4">

              {/* Review decision card */}
              {course.status === "PENDING_REVIEW" && (
                <div className="rounded-2xl p-4 space-y-3"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid #F59E0B40" }}>
                  <p className="text-xs font-semibold" style={{ color: "#FCD34D" }}>Awaiting Review</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Review the curriculum and description carefully before making a decision.
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    <button onClick={handleApprove} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{ backgroundColor: "#10B981" }}>
                      {actionLoading === "approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Approve & Publish
                    </button>
                    <button onClick={() => setShowRejectModal(true)} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Course meta */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Course Details</p>
                {[
                  { label: "Enrollment",   value: course.enrollmentType ?? "Open" },
                  { label: "Max Students", value: course.maxStudents ? course.maxStudents.toLocaleString() : "Unlimited" },
                  { label: "Certificate",  value: course.certificateOffered ? "Yes" : "No" },
                  { label: "Comments",     value: course.commentsEnabled ? "Enabled" : "Disabled" },
                  { label: "Created",      value: course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "—" },
                  { label: "Updated",      value: course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Requirements */}
              {(course.requirements ?? []).filter(Boolean).length > 0 && (
                <div className="rounded-2xl p-4 space-y-2"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Requirements</p>
                  <ul className="space-y-1.5">
                    {(course.requirements as string[]).filter(Boolean).map((r, i) => (
                      <li key={i} className="text-xs" style={{ color: "var(--text-secondary)" }}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target audience */}
              {(course.targetAudience ?? []).filter(Boolean).length > 0 && (
                <div className="rounded-2xl p-4 space-y-2"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Target Audience</p>
                  <ul className="space-y-1.5">
                    {(course.targetAudience as string[]).filter(Boolean).map((a, i) => (
                      <li key={i} className="text-xs" style={{ color: "var(--text-secondary)" }}>• {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
