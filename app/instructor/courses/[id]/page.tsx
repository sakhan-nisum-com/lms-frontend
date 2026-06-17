"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  Play,
  Users,
  Star,
  Clock,
  BookOpen,
  Award,
  ChevronDown,
  Edit2,
  ArrowLeft,
  Video,
  FileText,
  HelpCircle,
  Eye,
  Globe,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"
import { INSTRUCTOR_COURSES } from "@/lib/data/instructor-courses"
import type { Section } from "@/lib/data/instructor-courses"

const STATUS_MAP = {
  published: { label: "Published", color: "#10B981", bg: "#10B98118" },
  draft:     { label: "Draft",     color: "#64748B", bg: "#33415518" },
  review:    { label: "In Review", color: "#F59E0B", bg: "#F59E0B18" },
}

const LESSON_TYPE_ICONS = {
  video: Video,
  text:  FileText,
  quiz:  HelpCircle,
}

const LEARN_BULLETS = [
  "Build real-world projects from scratch",
  "Understand core concepts in depth",
  "Write clean, maintainable code",
  "Follow industry best practices",
  "Debug and troubleshoot effectively",
  "Deploy production-ready applications",
  "Collaborate with version control",
  "Pass technical interview questions",
]

function CurriculumSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: "1px solid #334155" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            size={14}
            style={{
              color: "#64748B",
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s",
              flexShrink: 0,
            }}
          />
          <span className="text-sm font-medium text-white">{section.title}</span>
        </div>
        <span className="text-xs flex-shrink-0 ml-3" style={{ color: "#64748B" }}>
          {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
        </span>
      </button>

      {open && (
        <div className="pb-2">
          {section.lessons.map((lesson) => {
            const Icon = LESSON_TYPE_ICONS[lesson.type]
            return (
              <div
                key={lesson.id}
                className="flex items-center gap-3 px-10 py-2"
              >
                <Icon size={13} style={{ color: "#475569", flexShrink: 0 }} />
                <span className="text-sm flex-1" style={{ color: "#94A3B8" }}>{lesson.title}</span>
                {lesson.isPreview && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#3B82F6" }}>
                    <Eye size={11} /> Preview
                  </span>
                )}
                {lesson.duration && (
                  <span className="text-xs" style={{ color: "#475569" }}>{lesson.duration}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CoursePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const course = INSTRUCTOR_COURSES.find((c) => c.id === parseInt(id, 10))

  if (!course) {
    return (
      <InstructorPageShell title="Course Not Found" user={{ name: "Jane Smith", email: "jane@example.com" }}>
        <div className="flex flex-col items-center justify-center py-24">
          <BookOpen size={40} style={{ color: "#334155" }} />
          <p className="mt-3 text-sm" style={{ color: "#64748B" }}>Course not found.</p>
          <Link
            href="/instructor/courses"
            className="mt-4 text-sm font-medium"
            style={{ color: "#3B82F6" }}
          >
            Back to My Courses
          </Link>
        </div>
      </InstructorPageShell>
    )
  }

  const status = STATUS_MAP[course.status]
  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0)

  return (
    <InstructorPageShell
      title="Course Preview"
      user={{ name: "Jane Smith", email: "jane@example.com" }}
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/instructor/courses"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:border-slate-500"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#CBD5E1" }}
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <Link
            href={`/instructor/courses/${course.id}/edit`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Edit2 size={14} />
            <span className="hidden sm:inline">Edit Course</span>
          </Link>
        </div>
      }
    >
      <div className="max-w-5xl space-y-5">
        {/* Hero card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
        >
          {/* Banner */}
          <div
            className="flex items-center justify-center h-40 relative"
            style={{ backgroundColor: course.color + "18" }}
          >
            <div
              className="flex items-center justify-center w-16 h-16 rounded-2xl"
              style={{ backgroundColor: course.color + "30" }}
            >
              <Play size={28} style={{ color: course.color }} />
            </div>
            <div className="absolute top-4 left-4">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ color: status.color, backgroundColor: status.bg }}
              >
                {status.label}
              </span>
            </div>
            {course.rating > 0 && (
              <div
                className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#F59E0B18", color: "#F59E0B" }}
              >
                <Star size={11} fill="#F59E0B" />
                {course.rating}
                <span style={{ color: "#92400E" }}>({course.reviews})</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5">
            <p className="text-xs font-semibold mb-1" style={{ color: course.color }}>
              {course.category}
            </p>
            <h1 className="text-xl font-bold text-white leading-snug mb-2">{course.title}</h1>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#94A3B8" }}>{course.description}</p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                { icon: BookOpen, label: `${course.lessons} lessons` },
                { icon: Clock,    label: course.duration },
                { icon: Users,    label: `${course.students.toLocaleString()} students` },
                { icon: Globe,    label: "English" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
                  <Icon size={13} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* What you'll learn */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <h2 className="text-sm font-semibold text-white mb-4">What You&apos;ll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
                {LEARN_BULLETS.map((b) => (
                  <div key={b} className="flex items-start gap-2.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: course.color }}
                    />
                    <p className="text-sm" style={{ color: "#CBD5E1" }}>{b}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor card */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <h2 className="text-sm font-semibold text-white mb-4">Instructor</h2>
              <div className="flex items-start gap-4">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: "#3B82F6" }}
                >
                  JS
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Jane Smith</p>
                  <p className="text-xs mt-0.5" style={{ color: "#3B82F6" }}>Senior Software Engineer · 6 courses</p>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: "#64748B" }}>
                    Passionate educator with 10+ years of industry experience building scalable systems.
                    Loves breaking complex topics into digestible, hands-on lessons.
                  </p>
                </div>
              </div>
            </div>

            {/* Curriculum preview */}
            {course.sections.length > 0 && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
              >
                <div className="px-5 py-4" style={{ borderBottom: "1px solid #334155" }}>
                  <h2 className="text-sm font-semibold text-white">Course Curriculum</h2>
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                    {course.sections.length} sections · {totalLessons} lessons
                  </p>
                </div>
                <div>
                  {course.sections.map((section) => (
                    <CurriculumSection key={section.id} section={section} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — Pricing card */}
          <div className="space-y-4">
            <div
              className="rounded-2xl p-5 sticky top-4"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              {/* Price */}
              <div className="mb-5">
                {course.students === 0 && course.revenue === "$0" ? (
                  <p className="text-3xl font-bold" style={{ color: "#10B981" }}>Free</p>
                ) : (
                  <p className="text-3xl font-bold text-white">{course.revenue}</p>
                )}
                <p className="text-xs mt-1" style={{ color: "#475569" }}>One-time purchase</p>
              </div>

              {/* Enroll button */}
              <button
                className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity mb-4"
                style={{ backgroundColor: "#3B82F6" }}
              >
                Enroll Now
              </button>

              {/* Revenue summary (instructor-only view) */}
              {course.students > 0 && (
                <div
                  className="rounded-xl p-3 mb-4"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
                >
                  <p className="text-xs font-semibold mb-2" style={{ color: "#64748B" }}>Your earnings</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#64748B" }}>Revenue</span>
                    <span className="text-sm font-bold" style={{ color: "#10B981" }}>{course.revenue}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs" style={{ color: "#64748B" }}>Students</span>
                    <span className="text-sm font-bold text-white">{course.students.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Course includes */}
              <div>
                <p className="text-xs font-semibold mb-3" style={{ color: "#94A3B8" }}>This course includes</p>
                <div className="space-y-2">
                  {[
                    { icon: BookOpen, label: `${course.lessons} lessons` },
                    { icon: Clock,    label: `${course.duration} of content` },
                    { icon: Award,    label: "Certificate of completion" },
                    { icon: Globe,    label: "Full lifetime access" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 text-xs" style={{ color: "#94A3B8" }}>
                      <Icon size={13} style={{ color: "#64748B", flexShrink: 0 }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Last updated */}
              <p className="text-xs mt-4 pt-4" style={{ borderTop: "1px solid #334155", color: "#475569" }}>
                Last updated {course.updated}
              </p>
            </div>
          </div>
        </div>
      </div>
    </InstructorPageShell>
  )
}
