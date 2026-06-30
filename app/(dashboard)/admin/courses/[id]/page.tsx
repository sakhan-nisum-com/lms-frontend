"use client"

import { useState, use } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import { COURSES, ASSIGNMENTS, QUIZZES } from "@/lib/data/courses"
import type { CourseCategory, CourseLevel } from "@/lib/data/courses"
import { useDiscussions } from "@/lib/hooks/useDiscussions"
import { useCourseModeration } from "@/lib/hooks/useCourseModeration"
import type { CourseStatus, CourseBadge } from "@/lib/hooks/useCourseModeration"
import { getInstructorByName } from "@/lib/data/instructors"
import {
  ChevronLeft, ChevronRight, ChevronDown, Clock, Star, Users, BookOpen,
  Award, MessageSquare, FileText, Video, HelpCircle, PenLine, Wifi,
  Sparkles, Crown, Trophy, ClipboardList, Brain, Download, Pencil,
} from "lucide-react"

type Tab = "overview" | "curriculum" | "assignments" | "quizzes" | "resources" | "discussions" | "reviews"

const levelColors: Record<string, string> = { Beginner: "#10B981", Intermediate: "#F59E0B", Advanced: "#EF4444" }

const CATEGORY_OPTIONS: CourseCategory[] = ["Engineering", "Data Science", "Design", "Business", "Compliance", "Leadership", "Security", "Product"]
const LEVEL_OPTIONS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"]

const statusColors: Record<CourseStatus, React.CSSProperties> = {
  published: { backgroundColor: "#10B98120", color: "#34D399" },
  draft: { backgroundColor: "#64748B20", color: "var(--text-secondary)" },
  "pending-review": { backgroundColor: "#F59E0B20", color: "#FCD34D" },
  unpublished: { backgroundColor: "#EF444420", color: "#F87171" },
}

const badgeMeta: Record<CourseBadge, { icon: React.ElementType; color: string; label: string }> = {
  featured: { icon: Sparkles, color: "#F59E0B", label: "Featured" },
  premium: { icon: Crown, color: "#A78BFA", label: "Premium" },
  topRated: { icon: Trophy, color: "#06B6D4", label: "Top Rated" },
}

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

const resources = [
  { name: "Course Slides (All Modules)", size: "12.4 MB", type: "PDF" },
  { name: "Starter Code Repository", size: "—", type: "GitHub" },
  { name: "Cheatsheet", size: "2.1 MB", type: "PDF" },
  { name: "Architecture Diagrams", size: "5.8 MB", type: "ZIP" },
]

const reviews = [
  { name: "Taylor R.", rating: 5, date: "May 2025", comment: "Best course I've taken on this topic. Explanations are crystal clear." },
  { name: "Morgan K.", rating: 5, date: "Apr 2025", comment: "Incredible depth. Worth every penny." },
  { name: "Jordan P.", rating: 4, date: "Mar 2025", comment: "Great content. A few lessons could be shorter but overall excellent." },
]

export default function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const course = COURSES.find((c) => c.id === id) ?? COURSES[0]
  const { getEntry, setStatus, toggleBadge, getContent, updateContent } = useCourseModeration()
  const { threads } = useDiscussions()
  const [tab, setTab] = useState<Tab>("overview")
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["s1", "s2"]))
  const [isEditing, setIsEditing] = useState(false)

  const entry = getEntry(course.id)
  const content = getContent(course)
  const instructorProfile = getInstructorByName(content.instructor)
  const courseAssignments = ASSIGNMENTS.filter((a) => a.courseId === course.id)
  const courseQuizzes = QUIZZES.filter((q) => q.courseId === course.id)
  const courseDiscussions = threads.filter((d) => d.courseId === course.id)
  const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0)

  const [form, setForm] = useState(() => ({
    title: content.title,
    shortDesc: content.shortDesc,
    description: content.description,
    category: content.category,
    level: content.level,
    price: content.price === "Free" ? "Free" : String(content.price),
    instructor: content.instructor,
    instructorTitle: content.instructorTitle,
    tags: content.tags.join(", "),
    isMandatory: !!content.isMandatory,
    certificateOffered: content.certificateOffered,
  }))

  const toggleSection = (sId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      next.has(sId) ? next.delete(sId) : next.add(sId)
      return next
    })
  }

  const startEditing = () => {
    setForm({
      title: content.title,
      shortDesc: content.shortDesc,
      description: content.description,
      category: content.category,
      level: content.level,
      price: content.price === "Free" ? "Free" : String(content.price),
      instructor: content.instructor,
      instructorTitle: content.instructorTitle,
      tags: content.tags.join(", "),
      isMandatory: !!content.isMandatory,
      certificateOffered: content.certificateOffered,
    })
    setIsEditing(true)
  }

  const handleSaveContent = () => {
    const trimmedPrice = form.price.trim()
    const price: number | "Free" = trimmedPrice === "" || trimmedPrice.toLowerCase() === "free"
      ? "Free"
      : Number(trimmedPrice) || 0
    updateContent(course.id, {
      title: form.title.trim() || content.title,
      shortDesc: form.shortDesc.trim(),
      description: form.description.trim(),
      category: form.category,
      level: form.level,
      price,
      instructor: form.instructor.trim() || content.instructor,
      instructorTitle: form.instructorTitle.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isMandatory: form.isMandatory,
      certificateOffered: form.certificateOffered,
    })
    setIsEditing(false)
  }

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="max-w-6xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/admin/courses" className="flex items-center gap-1.5 text-sm w-fit" style={{ color: "var(--text-tertiary)" }}>
            <ChevronLeft size={15} /> Back to Courses
          </Link>
          {!isEditing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-lg"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              <Pencil size={14} /> Edit Course
            </button>
          )}
        </div>

        {/* Edit form */}
        {isEditing && (
          <div className="rounded-2xl p-6 space-y-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Edit Course Details</h2>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Short Description</label>
              <textarea
                value={form.shortDesc}
                onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Full Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as CourseCategory }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as CourseLevel }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Price</label>
                <input
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 149 or Free"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Instructor Name</label>
                <input
                  value={form.instructor}
                  onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Instructor Title</label>
                <input
                  value={form.instructorTitle}
                  onChange={(e) => setForm((f) => ({ ...f, instructorTitle: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="React, Next.js, TypeScript"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setForm((f) => ({ ...f, isMandatory: !f.isMandatory }))}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg"
                style={{ backgroundColor: form.isMandatory ? "#EF444420" : "var(--border-default)", color: form.isMandatory ? "#F87171" : "var(--text-secondary)" }}
              >
                {form.isMandatory ? "Mandatory" : "Optional"}
              </button>
              <button
                onClick={() => setForm((f) => ({ ...f, certificateOffered: !f.certificateOffered }))}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg"
                style={{ backgroundColor: form.certificateOffered ? "#F59E0B20" : "var(--border-default)", color: form.certificateOffered ? "#FCD34D" : "var(--text-secondary)" }}
              >
                {form.certificateOffered ? "Certificate Offered" : "No Certificate"}
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2" style={{ borderTop: "1px solid var(--border-default)" }}>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContent}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Hero */}
        {!isEditing && (
        <div className="rounded-2xl p-6 relative overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${course.thumbnailColor}18 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
          />
          <div className="flex flex-col lg:flex-row gap-6 relative">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${course.thumbnailColor}20`, color: course.thumbnailColor }}>
                  {content.category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${levelColors[content.level]}20`, color: levelColors[content.level] }}>
                  {content.level}
                </span>
                {content.isMandatory && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EF444420", color: "#EF4444" }}>
                    Mandatory
                  </span>
                )}
                {(["featured", "premium", "topRated"] as CourseBadge[]).filter((b) => entry[b]).map((b) => {
                  const { icon: Icon, color, label } = badgeMeta[b]
                  return (
                    <span key={b} className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${color}20`, color }}>
                      <Icon size={10} /> {label}
                    </span>
                  )
                })}
              </div>

              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{content.title}</h1>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{content.shortDesc}</p>

              <div className="flex items-center gap-5 flex-wrap text-sm" style={{ color: "var(--text-tertiary)" }}>
                <span className="flex items-center gap-1.5">
                  <Star size={14} style={{ color: "var(--warning)" }} fill="#F59E0B" />
                  <strong style={{ color: "var(--text-primary)" }}>{course.rating}</strong>
                  <span>({course.reviewCount.toLocaleString()} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5"><Users size={14} /> {course.studentsCount.toLocaleString()} students</span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> {course.totalDuration}</span>
                <span className="flex items-center gap-1.5"><BookOpen size={14} /> {totalLessons} lessons</span>
              </div>

              <p className="text-sm mt-4" style={{ color: "var(--text-secondary)" }}>
                Instructor:{" "}
                {instructorProfile ? (
                  <Link href={`/instructors/${instructorProfile.id}`} className="font-bold hover:underline" style={{ color: "var(--text-primary)" }}>
                    {content.instructor}
                  </Link>
                ) : (
                  <strong style={{ color: "var(--text-primary)" }}>{content.instructor}</strong>
                )}
                <span className="ml-2" style={{ color: "var(--text-tertiary)" }}>{content.instructorTitle}</span>
              </p>
            </div>

            {/* Admin moderation panel */}
            <div className="lg:w-72 rounded-xl p-5 flex-shrink-0 space-y-4" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
              <CourseThumbnail course={course} heightClass="h-28" roundedClass="rounded-lg" />

              <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {content.price === "Free" ? "Free" : `$${content.price}`}
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Status</label>
                <select
                  value={entry.status}
                  onChange={(e) => setStatus(course.id, e.target.value as CourseStatus)}
                  className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold outline-none"
                  style={statusColors[entry.status]}
                >
                  <option value="published">Published</option>
                  <option value="pending-review">Pending Review</option>
                  <option value="draft">Draft</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Catalog Badges</label>
                <div className="space-y-2">
                  {(["featured", "premium", "topRated"] as CourseBadge[]).map((b) => {
                    const { icon: Icon, color, label } = badgeMeta[b]
                    const active = entry[b]
                    return (
                      <button
                        key={b}
                        onClick={() => toggleBadge(course.id, b)}
                        className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold px-3 py-2 rounded-lg"
                        style={{ backgroundColor: active ? `${color}20` : "var(--border-default)", color: active ? color : "var(--text-secondary)" }}
                      >
                        <Icon size={13} /> {active ? `${label} ✓` : `Mark ${label}`}
                      </button>
                    )
                  })}
                </div>
              </div>

              {content.certificateOffered && (
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  <Award size={13} style={{ color: "var(--warning)" }} /> Certificate of completion included
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Tabs */}
        {!isEditing && (<>
        <div className="flex items-center gap-1 border-b overflow-x-auto" style={{ borderColor: "var(--border-default)" }}>
          {(["overview", "curriculum", "assignments", "quizzes", "resources", "discussions", "reviews"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium capitalize transition-colors relative flex-shrink-0"
              style={{ color: tab === t ? "#60A5FA" : "var(--text-tertiary)" }}
            >
              {t === "quizzes" ? "Quizzes & Exams" : t}
              {t === "assignments" && courseAssignments.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>{courseAssignments.length}</span>
              )}
              {t === "quizzes" && courseQuizzes.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>{courseQuizzes.length}</span>
              )}
              {t === "discussions" && courseDiscussions.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>{courseDiscussions.length}</span>
              )}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ backgroundColor: "var(--accent)" }} />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {tab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>About This Course</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{content.description}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Course Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: "var(--border-default)", color: "#CBD5E1" }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "curriculum" && (
            <div className="space-y-3">
              {course.sections.length === 0 ? (
                <div className="rounded-2xl p-10 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Curriculum details coming soon.</p>
                </div>
              ) : course.sections.map((section) => {
                const open = openSections.has(section.id)
                return (
                  <div key={section.id} className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <button
                      className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
                      onClick={() => toggleSection(section.id)}
                      style={{ backgroundColor: open ? "var(--bg-surface-muted)" : "var(--bg-surface)" }}
                    >
                      <ChevronDown size={16} style={{ color: "var(--text-tertiary)", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }} />
                      <span className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>{section.title}</span>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{section.lessons.length} lessons</span>
                    </button>
                    {open && (
                      <div className="divide-y" style={{ borderColor: "var(--bg-surface)" }}>
                        {section.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center gap-3 px-5 py-3" style={{ backgroundColor: "#172033" }}>
                            <div className="flex-shrink-0 w-5 flex items-center justify-center">{lessonTypeIcon(lesson.type)}</div>
                            <span className="flex-1 text-sm" style={{ color: "#CBD5E1" }}>{lesson.title}</span>
                            <span className="text-xs capitalize flex-shrink-0" style={{ color: "var(--text-muted)" }}>{lesson.type}</span>
                            <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {tab === "assignments" && (
            <div className="space-y-3">
              {courseAssignments.length === 0 ? (
                <div className="rounded-2xl p-10 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
                  <ClipboardList size={32} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No assignments attached to this course.</p>
                </div>
              ) : courseAssignments.map((a) => (
                <div key={a.id} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{a.title}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize" style={{ backgroundColor: "#33415560", color: "var(--text-secondary)" }}>{a.type}</span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{a.description}</p>
                  <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "var(--text-tertiary)" }}>
                    <span>Due {a.dueDate}</span>
                    <span>Max grade: {a.maxGrade}</span>
                    <span className="capitalize">Format: {a.submissionFormat}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "quizzes" && (
            <div className="space-y-3">
              {courseQuizzes.length === 0 ? (
                <div className="rounded-2xl p-10 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
                  <Brain size={32} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No quizzes attached to this course.</p>
                </div>
              ) : courseQuizzes.map((q) => (
                <div key={q.id} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{q.title}</p>
                  <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{q.description}</p>
                  <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "var(--text-tertiary)" }}>
                    <span>{q.questions.length} questions</span>
                    <span>{q.timeLimit} min</span>
                    <span>Pass: {q.passingScore}%</span>
                    <span>Max attempts: {q.maxAttempts}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "resources" && (
            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              {resources.map((r, i) => (
                <div key={r.name} className="flex items-center gap-4 px-5 py-3.5" style={{ borderBottom: i < resources.length - 1 ? "1px solid #1E293B40" : "none", backgroundColor: i % 2 === 0 ? "#1A2535" : "var(--bg-surface)" }}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold flex-shrink-0" style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>{r.type}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                    {r.size !== "—" && <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{r.size}</p>}
                  </div>
                  <Download size={14} style={{ color: "var(--text-muted)" }} />
                </div>
              ))}
            </div>
          )}

          {tab === "discussions" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>{courseDiscussions.length} threads</p>
                <Link href="/admin/discussions" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--border-default)", color: "#CBD5E1" }}>
                  <MessageSquare size={13} /> Moderate Discussions
                </Link>
              </div>
              {courseDiscussions.length === 0 ? (
                <div className="rounded-2xl p-8 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No discussions yet for this course.</p>
                </div>
              ) : courseDiscussions.map((d) => (
                <div key={d.id} className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${d.isPinned ? "#3B82F640" : "var(--border-default)"}` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>{d.authorAvatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.title}</span>
                        {d.isPinned && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>Pinned</span>}
                        {d.isSolved && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>Solved</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{d.author} · {d.createdAt} · {d.replies} replies · {d.views} views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5 flex items-center gap-8 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <div className="text-center">
                  <div className="text-5xl font-black" style={{ color: "var(--text-primary)" }}>{course.rating}</div>
                  <div className="flex items-center gap-0.5 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={s <= Math.round(course.rating) ? "#F59E0B" : "none"} style={{ color: "var(--warning)" }} />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{course.reviewCount.toLocaleString()} reviews</p>
                </div>
              </div>
              {reviews.map((r) => (
                <div key={r.name} className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>{r.name[0]}</div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={11} fill={s <= r.rating ? "#F59E0B" : "none"} style={{ color: "var(--warning)" }} />
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
        </>)}

        <div className="flex items-center justify-end">
          <Link href="/admin/courses" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--accent)" }}>
            Back to all courses <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
