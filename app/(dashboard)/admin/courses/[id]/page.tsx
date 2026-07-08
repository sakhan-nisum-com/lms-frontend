"use client"

import { use, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { coursesApi, type ApiCourse, type ApiReview } from "@/lib/api/courses"
import { instructorsAdminApi, type EnrolledStudent } from "@/lib/api/admin"
import type { PageResponse } from "@/lib/api/courses"
import { authStore } from "@/lib/auth-store"
import type { ApiLesson } from "@/lib/api/courses"
import {
  ChevronLeft, CheckCircle2, XCircle, Loader2, BookOpen, Video, FileText,
  HelpCircle, Users, Star, Clock, Globe, Tag, ChevronDown, AlertTriangle,
  Eye, BarChart2, DollarSign, MessageSquare, Archive, Play, ShieldOff,
  ChevronRight, UserCircle, Download, ExternalLink, X as CloseIcon,
} from "lucide-react"

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED:      { label: "Published",      color: "#34D399", bg: "#10B98120" },
  DRAFT:          { label: "Draft",          color: "#94A3B8", bg: "#64748B20" },
  PENDING_REVIEW: { label: "Pending Review", color: "#FCD34D", bg: "#F59E0B20" },
  ARCHIVED:       { label: "Archived",       color: "#94A3B8", bg: "#33415520" },
  REJECTED:       { label: "Rejected",       color: "#F87171", bg: "#EF444420" },
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "#10B981", INTERMEDIATE: "#F59E0B", ADVANCED: "#EF4444", ALL_LEVELS: "#3B82F6",
}

type ActionKey = "approve" | "reject" | "archive" | "publish"

function LessonTypeIcon({ type, size = 12 }: { type: string; size?: number }) {
  if (type === "QUIZ")     return <HelpCircle size={size} style={{ color: "#8B5CF6" }} />
  if (type === "READING")  return <FileText   size={size} style={{ color: "#10B981" }} />
  if (type === "PDF")      return <FileText   size={size} style={{ color: "#F59E0B" }} />
  if (type === "DOWNLOAD") return <Download   size={size} style={{ color: "#F59E0B" }} />
  return                          <Video      size={size} style={{ color: "#3B82F6" }} />
}

function isYoutube(url: string) {
  return /youtube\.com|youtu\.be/.test(url)
}
function isVimeo(url: string) {
  return /vimeo\.com/.test(url)
}
function youtubeEmbedUrl(url: string) {
  const id = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]
  return id ? `https://www.youtube.com/embed/${id}` : url
}
function vimeoEmbedUrl(url: string) {
  const id = url.match(/vimeo\.com\/(\d+)/)?.[1]
  return id ? `https://player.vimeo.com/video/${id}` : url
}

function LessonViewer({ lesson, onClose }: { lesson: ApiLesson; onClose: () => void }) {
  const isVideo = lesson.type === "VIDEO" || lesson.type === "LIVE"
  const isPdf   = lesson.type === "PDF"
  const isText  = lesson.type === "READING" || lesson.type === "ASSIGNMENT"
  const isDownload = lesson.type === "DOWNLOAD"

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="relative ml-auto flex flex-col overflow-hidden"
        style={{
          width: "min(720px, 100vw)",
          height: "100vh",
          backgroundColor: "var(--bg-canvas)",
          borderLeft: "1px solid var(--border-default)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)" }}>
          <LessonTypeIcon type={lesson.type} size={16} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{lesson.title}</p>
            {lesson.titleAr && (
              <p className="text-xs truncate mt-0.5" dir="rtl" style={{ color: "var(--text-muted)" }}>{lesson.titleAr}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {lesson.durationSeconds && lesson.durationSeconds > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Clock size={12} /> {Math.ceil(lesson.durationSeconds / 60)}m
              </span>
            )}
            {lesson.freePreview && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                <Eye size={9} /> Free Preview
              </span>
            )}
            <button onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border-default)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* VIDEO */}
          {isVideo && lesson.videoUrl && (
            <div className="w-full" style={{ backgroundColor: "#000" }}>
              {isYoutube(lesson.videoUrl) ? (
                <iframe
                  src={youtubeEmbedUrl(lesson.videoUrl)}
                  className="w-full"
                  style={{ aspectRatio: "16/9", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isVimeo(lesson.videoUrl) ? (
                <iframe
                  src={vimeoEmbedUrl(lesson.videoUrl)}
                  className="w-full"
                  style={{ aspectRatio: "16/9", border: "none" }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={lesson.videoUrl}
                  controls
                  className="w-full"
                  style={{ maxHeight: "60vh", display: "block" }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          {isVideo && !lesson.videoUrl && (
            <div className="flex flex-col items-center justify-center py-16">
              <Video size={40} className="mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No video URL set for this lesson.</p>
            </div>
          )}

          {/* PDF */}
          {isPdf && lesson.resourceUrl && (
            <iframe
              src={lesson.resourceUrl}
              className="w-full"
              style={{ height: "calc(100vh - 65px)", border: "none" }}
              title={lesson.title}
            />
          )}

          {isPdf && !lesson.resourceUrl && (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText size={40} className="mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No PDF URL set for this lesson.</p>
            </div>
          )}

          {/* DOWNLOAD */}
          {isDownload && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Download size={40} style={{ color: "#F59E0B" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Downloadable Resource</p>
              {lesson.resourceUrl ? (
                <a
                  href={lesson.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "#F59E0B20", color: "#F59E0B", border: "1px solid #F59E0B40" }}>
                  <ExternalLink size={14} /> Open / Download File
                </a>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No file attached.</p>
              )}
            </div>
          )}

          {/* QUIZ */}
          {lesson.type === "QUIZ" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <HelpCircle size={40} style={{ color: "#8B5CF6" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Quiz Lesson</p>
              {lesson.passingScore != null && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Passing score: {lesson.passingScore}%</p>
              )}
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Quiz questions are not viewable in admin preview.</p>
            </div>
          )}

          {/* Text content (READING / ASSIGNMENT / any type with content) */}
          {(isText || (!isVideo && !isPdf && !isDownload && lesson.type !== "QUIZ")) && (
            <div className="p-6 space-y-4">
              {lesson.content ? (
                <div className="prose prose-invert max-w-none">
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--text-secondary)", fontFamily: "inherit" }}>
                    {lesson.content}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText size={36} className="mb-3" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No text content set for this lesson.</p>
                </div>
              )}
              {lesson.contentAr && (
                <div className="pt-4" style={{ borderTop: "1px solid var(--border-default)" }} dir="rtl">
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Arabic Content</p>
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--text-secondary)", fontFamily: "inherit" }}>
                    {lesson.contentAr}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Extra resource link (shown below video too) */}
          {isVideo && lesson.resourceUrl && (
            <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border-default)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Attached Resource</p>
              <a href={lesson.resourceUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--accent)" }}>
                <ExternalLink size={13} /> {lesson.resourceUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const user = authStore.getUser()

  const [course, setCourse]             = useState<ApiCourse | null>(null)
  const [reviews, setReviews]           = useState<ApiReview[]>([])
  const [loading, setLoading]           = useState(true)
  const [actionLoading, setActionLoading] = useState<ActionKey | null>(null)
  const [toast, setToast]               = useState<{ text: string; ok: boolean } | null>(null)
  const [modal, setModal]               = useState<"reject" | "archive" | null>(null)
  const [modalReason, setModalReason]   = useState("")
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))
  const [activeTab, setActiveTab]       = useState<"content" | "students">("content")
  const [students, setStudents]         = useState<EnrolledStudent[]>([])
  const [studentsPage, setStudentsPage] = useState(0)
  const [studentsMeta, setStudentsMeta] = useState<Pick<PageResponse<EnrolledStudent>, "totalElements" | "totalPages"> | null>(null)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<ApiLesson | null>(null)

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

  const loadStudents = useCallback(async () => {
    setStudentsLoading(true)
    try {
      const res = await instructorsAdminApi.getCourseStudents(id, studentsPage, 15)
      setStudents(res.data)
      setStudentsMeta({ totalElements: res.totalElements, totalPages: res.totalPages })
    } catch { setStudents([]) }
    finally { setStudentsLoading(false) }
  }, [id, studentsPage])

  useEffect(() => {
    if (activeTab === "students") loadStudents()
  }, [activeTab, loadStudents])

  async function doAction(action: ActionKey, reason?: string) {
    setActionLoading(action)
    try {
      let updated: ApiCourse
      if (action === "approve")  updated = await coursesApi.approve(id)
      else if (action === "publish") updated = await coursesApi.publish(id)
      else if (action === "archive") updated = await coursesApi.archive(id)
      else updated = await coursesApi.reject(id, reason ?? "")
      setCourse(updated)
      setModal(null)
      setModalReason("")
      const msgs: Record<ActionKey, string> = {
        approve:  "Course approved and published!",
        publish:  "Course is now live.",
        archive:  "Course has been archived.",
        reject:   "Course rejected.",
      }
      showToast(msgs[action], true)
    } catch {
      showToast(`Failed to ${action} course`, false)
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

      {/* Confirm modal (reject / archive) */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: modal === "reject" ? "#EF444420" : "#F59E0B20" }}>
                {modal === "reject"
                  ? <XCircle size={18} style={{ color: "#EF4444" }} />
                  : <Archive size={18} style={{ color: "#F59E0B" }} />}
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {modal === "reject" ? "Reject Course" : "Archive Course"}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {modal === "reject"
                    ? "The instructor will be notified with your feedback."
                    : "The course will be hidden from students. You can re-publish it later."}
                </p>
              </div>
            </div>
            <textarea
              autoFocus
              rows={3}
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder={modal === "reject"
                ? "Reason for rejection (required)…"
                : "Optional note for internal records…"}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setModal(null); setModalReason("") }}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                Cancel
              </button>
              <button
                onClick={() => doAction(modal, modal === "reject" ? modalReason : undefined)}
                disabled={(modal === "reject" && !modalReason.trim()) || !!actionLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: modal === "reject" ? "#EF4444" : "#F59E0B" }}>
                {actionLoading === modal
                  ? <Loader2 size={14} className="animate-spin" />
                  : modal === "reject" ? <XCircle size={14} /> : <Archive size={14} />}
                {modal === "reject" ? "Reject Course" : "Archive Course"}
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

            {/* Contextual action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {course.status === "PENDING_REVIEW" && (
                <>
                  <button onClick={() => setModal("reject")} disabled={!!actionLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}>
                    <XCircle size={14} /> Reject
                  </button>
                  <button onClick={() => doAction("approve")} disabled={!!actionLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#10B981" }}>
                    {actionLoading === "approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Approve & Publish
                  </button>
                </>
              )}

              {course.status === "PUBLISHED" && (
                <button onClick={() => setModal("archive")} disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "#F59E0B20", color: "#F59E0B", border: "1px solid #F59E0B40" }}>
                  <Archive size={14} /> Archive
                </button>
              )}

              {(course.status === "ARCHIVED" || course.status === "REJECTED" || course.status === "DRAFT") && (
                <>
                  <button onClick={() => doAction("publish")} disabled={!!actionLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#10B981" }}>
                    {actionLoading === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    {course.status === "DRAFT" ? "Force Publish" : "Re-publish"}
                  </button>
                  {course.status !== "ARCHIVED" && (
                    <button onClick={() => setModal("archive")} disabled={!!actionLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "#F59E0B20", color: "#F59E0B", border: "1px solid #F59E0B40" }}>
                      <Archive size={14} /> Archive
                    </button>
                  )}
                </>
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

          {/* Archived banner */}
          {course.status === "ARCHIVED" && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: "#33415520", border: "1px solid #33415540" }}>
              <ShieldOff size={16} className="flex-shrink-0" style={{ color: "#94A3B8" }} />
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                This course is archived and hidden from students.
              </p>
            </div>
          )}

          {/* Header card */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="space-y-4">
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

              <div>
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{course.title}</h1>
                {course.titleAr && (
                  <p className="text-base mt-0.5 font-medium" dir="rtl" style={{ color: "var(--text-secondary)" }}>{course.titleAr}</p>
                )}
                {course.subtitle && (
                  <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{course.subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
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
                  <BookOpen size={12} /> {totalLessons} lessons · {course.sections.length} sections
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { icon: Users,         label: "Students",   value: course.studentsCount.toLocaleString(),                     color: "#3B82F6" },
                  { icon: Star,          label: "Avg Rating", value: avgRating > 0 ? avgRating.toFixed(1) : "No ratings",       color: "#F59E0B" },
                  { icon: MessageSquare, label: "Reviews",    value: String(reviews.length || course.reviewCount),              color: "#8B5CF6" },
                  { icon: DollarSign,    label: "Price",      value: course.isFree ? "Free" : `$${course.price}`,               color: "#10B981" },
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

          {/* Tab strip */}
          <div className="flex gap-1 p-1 rounded-xl w-fit"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            {(["content", "students"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize"
                style={{
                  backgroundColor: activeTab === tab ? "var(--accent)" : "transparent",
                  color: activeTab === tab ? "#fff" : "var(--text-secondary)",
                }}>
                {tab === "students"
                  ? `Students${studentsMeta ? ` (${studentsMeta.totalElements})` : ""}`
                  : "Content"}
              </button>
            ))}
          </div>

          {/* Students tab */}
          {activeTab === "students" && (
            <div className="space-y-4">
              {studentsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <Users size={32} className="mb-3" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No students enrolled yet.</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                        {["Student", "Progress", "Time Spent", "Enrolled", "Completed"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "var(--text-tertiary)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => {
                        const hours = Math.floor(s.totalTimeSpentSeconds / 3600)
                        const mins  = Math.floor((s.totalTimeSpentSeconds % 3600) / 60)
                        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
                        return (
                          <tr key={s.enrollmentId}
                            style={{ borderBottom: i < students.length - 1 ? "1px solid var(--border-default)" : "none" }}
                            className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                {s.avatarUrl ? (
                                  <img src={s.avatarUrl} alt={s.fullName}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: "var(--accent)20" }}>
                                    <UserCircle size={16} style={{ color: "var(--accent)" }} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{s.fullName}</p>
                                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{s.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 rounded-full overflow-hidden flex-shrink-0"
                                  style={{ backgroundColor: "var(--border-default)" }}>
                                  <div className="h-full rounded-full"
                                    style={{ width: `${s.progressPct}%`, backgroundColor: s.progressPct === 100 ? "#10B981" : "var(--accent)" }} />
                                </div>
                                <span className="text-xs font-medium flex-shrink-0"
                                  style={{ color: s.progressPct === 100 ? "#10B981" : "var(--text-secondary)" }}>
                                  {s.progressPct}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                              {timeStr}
                            </td>
                            <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                              {new Date(s.enrolledAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3.5">
                              {s.completedAt ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold"
                                  style={{ color: "#10B981" }}>
                                  <CheckCircle2 size={12} />
                                  {new Date(s.completedAt).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {(studentsMeta?.totalPages ?? 1) > 1 && (
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ borderTop: "1px solid var(--border-default)" }}>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {studentsMeta?.totalElements} students
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setStudentsPage((p) => Math.max(0, p - 1))}
                          disabled={studentsPage === 0}
                          className="p-1.5 rounded-lg disabled:opacity-30"
                          style={{ color: "var(--text-secondary)" }}>
                          <ChevronLeft size={15} />
                        </button>
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          Page {studentsPage + 1} of {studentsMeta?.totalPages}
                        </span>
                        <button onClick={() => setStudentsPage((p) => Math.min((studentsMeta?.totalPages ?? 1) - 1, p + 1))}
                          disabled={studentsPage >= (studentsMeta?.totalPages ?? 1) - 1}
                          className="p-1.5 rounded-lg disabled:opacity-30"
                          style={{ color: "var(--text-secondary)" }}>
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Content tab */}
          {activeTab === "content" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left col */}
            <div className="lg:col-span-2 space-y-6">

              {course.description && (
                <div className="rounded-2xl p-5 space-y-2"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Description</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{course.description}</p>
                  {course.descriptionAr && (
                    <p className="text-sm leading-relaxed mt-2 pt-2" dir="rtl"
                      style={{ color: "var(--text-secondary)", borderTop: "1px solid var(--border-default)" }}>
                      {course.descriptionAr}
                    </p>
                  )}
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
                {course.sections.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No curriculum added yet.</p>
                  </div>
                ) : (
                  course.sections.map((section, si) => {
                    const open = expandedSections.has(si)
                    return (
                      <div key={section.id} style={{ borderBottom: si < course.sections.length - 1 ? "1px solid var(--border-default)" : "none" }}>
                        <button type="button" onClick={() => toggleSection(si)}
                          className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.02]">
                          <ChevronDown size={13} style={{ color: "var(--text-muted)", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s", flexShrink: 0 }} />
                          <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{section.title}</span>
                          {section.titleAr && (
                            <span className="text-xs" dir="rtl" style={{ color: "var(--text-muted)" }}>{section.titleAr}</span>
                          )}
                          <span className="text-xs flex-shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>{section.lessons.length} lessons</span>
                        </button>
                        {open && section.lessons.length > 0 && (
                          <div style={{ borderTop: "1px solid var(--border-default)" }}>
                            {section.lessons.map((lesson, li) => (
                              <div key={lesson.id}
                                className="flex items-center gap-3 px-5 py-2.5 group cursor-pointer transition-colors"
                                style={{ borderTop: li > 0 ? "1px solid var(--bg-surface-muted)" : "none", backgroundColor: "var(--bg-surface-muted)" }}
                                onClick={() => setSelectedLesson(lesson)}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border-default)")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-muted)")}>
                                <LessonTypeIcon type={lesson.type} />
                                <span className="flex-1 text-sm truncate" style={{ color: "var(--text-secondary)" }}>{lesson.title}</span>
                                {lesson.titleAr && (
                                  <span className="text-xs truncate max-w-[100px]" dir="rtl" style={{ color: "var(--text-muted)" }}>{lesson.titleAr}</span>
                                )}
                                {lesson.freePreview && (
                                  <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                                    <Eye size={9} /> Free
                                  </span>
                                )}
                                {lesson.durationSeconds && lesson.durationSeconds > 0 && (
                                  <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                                    <Clock size={10} /> {Math.ceil(lesson.durationSeconds / 60)}m
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ backgroundColor: "var(--accent)20", color: "var(--accent)" }}>
                                  <Eye size={9} /> View
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Reviews */}
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
                          <Star key={s} size={11} fill={s <= Math.round(avgRating) ? "#F59E0B" : "transparent"}
                            style={{ color: s <= Math.round(avgRating) ? "#F59E0B" : "var(--border-default)" }} />
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
                  <>
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
                                    <Star key={s} size={10}
                                      fill={s <= review.rating ? "#F59E0B" : "transparent"}
                                      style={{ color: s <= review.rating ? "#F59E0B" : "var(--border-default)" }} />
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
                  </>
                )}
              </div>
            </div>

            {/* Right col */}
            <div className="space-y-4">

              {/* Admin action panel */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Admin Actions</p>

                {course.status === "PENDING_REVIEW" && (
                  <>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      Review the curriculum and description before approving.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => doAction("approve")} disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                        style={{ backgroundColor: "#10B981" }}>
                        {actionLoading === "approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Approve & Publish
                      </button>
                      <button onClick={() => setModal("reject")} disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                        style={{ backgroundColor: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}>
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </>
                )}

                {course.status === "PUBLISHED" && (
                  <>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      This course is live and visible to students.
                    </p>
                    <button onClick={() => setModal("archive")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#F59E0B20", color: "#F59E0B", border: "1px solid #F59E0B40" }}>
                      <Archive size={14} /> Archive / Block
                    </button>
                    <button onClick={() => setModal("reject")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}

                {course.status === "ARCHIVED" && (
                  <>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      This course is archived and hidden from students.
                    </p>
                    <button onClick={() => doAction("publish")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{ backgroundColor: "#10B981" }}>
                      {actionLoading === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                      Re-publish Course
                    </button>
                    <button onClick={() => setModal("reject")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}

                {course.status === "REJECTED" && (
                  <>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      This course was rejected. You can override and publish it or archive it.
                    </p>
                    <button onClick={() => doAction("publish")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{ backgroundColor: "#10B981" }}>
                      {actionLoading === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                      Override & Publish
                    </button>
                    <button onClick={() => setModal("archive")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#F59E0B20", color: "#F59E0B", border: "1px solid #F59E0B40" }}>
                      <Archive size={14} /> Archive
                    </button>
                  </>
                )}

                {course.status === "DRAFT" && (
                  <>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      This course is a draft. Force-publish it or archive it.
                    </p>
                    <button onClick={() => doAction("publish")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{ backgroundColor: "#10B981" }}>
                      {actionLoading === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                      Force Publish
                    </button>
                    <button onClick={() => setModal("archive")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#F59E0B20", color: "#F59E0B", border: "1px solid #F59E0B40" }}>
                      <Archive size={14} /> Archive
                    </button>
                    <button onClick={() => setModal("reject")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                      style={{ backgroundColor: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}
              </div>

              {/* Course meta */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Course Details</p>
                {[
                  { label: "Instructor ID", value: course.instructorId.slice(0, 12) + "…" },
                  { label: "Enrollment",    value: course.enrollmentType ?? "Open" },
                  { label: "Max Students",  value: course.maxStudents ? course.maxStudents.toLocaleString() : "Unlimited" },
                  { label: "Certificate",   value: course.certificateOffered ? "Yes" : "No" },
                  { label: "Comments",      value: course.commentsEnabled ? "Enabled" : "Disabled" },
                  { label: "Created",       value: course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "—" },
                  { label: "Updated",       value: course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="text-xs font-medium text-right" style={{ color: "var(--text-secondary)" }}>{value}</span>
                  </div>
                ))}
              </div>

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
          )}
        </div>
      )}

      {selectedLesson && (
        <LessonViewer lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
      )}
    </DashboardLayout>
  )
}
