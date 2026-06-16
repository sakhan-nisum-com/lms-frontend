"use client"

import { useState, use } from "react"
import Link from "next/link"
import { COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import { useProgress } from "@/lib/hooks/useProgress"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import {
  ChevronLeft, ChevronRight, CheckCircle2, Lock, Play,
  HelpCircle, FileText, PenLine, Wifi, Video,
  BookmarkPlus, Share2, MessageSquare, Settings2,
  Volume2, Maximize2, Pause, SkipForward,
} from "lucide-react"

const lessonTypeIcon = (type: string, size = 14) => {
  switch (type) {
    case "video": return <Video size={size} style={{ color: "#3B82F6" }} />
    case "quiz": return <HelpCircle size={size} style={{ color: "#8B5CF6" }} />
    case "reading": return <FileText size={size} style={{ color: "#10B981" }} />
    case "assignment": return <PenLine size={size} style={{ color: "#F59E0B" }} />
    case "live": return <Wifi size={size} style={{ color: "#EC4899" }} />
    default: return <Video size={size} style={{ color: "#3B82F6" }} />
  }
}

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id, lessonId } = use(params)
  const course = COURSES.find((c) => c.id === id) ?? COURSES[0]
  const { completedIds, markComplete, isComplete } = useProgress(id)
  const { isPurchased } = usePurchases()

  const [playing, setPlaying] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const owned = course.progress !== undefined || isPurchased(course.id)

  if (!owned) {
    return (
      <div className="flex h-screen items-center justify-center p-6" style={{ backgroundColor: "#0F172A" }}>
        <div className="rounded-2xl p-8 text-center" style={{ maxWidth: 420, backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <CourseThumbnail course={course} heightClass="h-32 mb-5" roundedClass="rounded-xl" />
          <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full" style={{ backgroundColor: "#3B82F620" }}>
            <Lock size={24} style={{ color: "#60A5FA" }} />
          </div>
          <h1 className="text-lg font-bold text-white mb-2">Purchase this course to start watching</h1>
          <p className="text-sm mb-6" style={{ color: "#94A3B8" }}><strong className="text-white">{course.title}</strong> isn&apos;t in your library yet. Buy it once and watch every lesson, anytime.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href={course.price === "Free" ? `/student/courses/${course.id}` : `/student/courses/${course.id}/checkout`}
              className="px-5 py-3 rounded-xl text-sm font-bold"
              style={{ backgroundColor: "#3B82F6", color: "#fff" }}
            >
              {course.price === "Free" ? "Enroll for Free" : `Buy Now — $${course.price}`}
            </Link>
            <Link
              href={`/student/courses/${course.id}`}
              className="px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#334155", color: "#CBD5E1" }}
            >
              Back to course
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const allLessons = course.sections.flatMap((s) =>
    s.lessons.map((l) => ({ ...l, sectionTitle: s.title, sectionId: s.id }))
  )
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const currentLesson = allLessons[currentIndex] ?? allLessons[0]
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // A lesson is done if the static data says so OR the user just marked it
  const isDone = (lId: string, staticDone: boolean) => staticDone || isComplete(lId)

  const completedCount = allLessons.filter((l) => isDone(l.id, l.completed)).length
  const totalLessons = allLessons.length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const currentDone = isDone(currentLesson.id, currentLesson.completed)

  // Section completion derived from tracked state
  const sectionProgress = course.sections.map((sec) => {
    const lessons = sec.lessons
    const done = lessons.filter((l) => isDone(l.id, l.completed)).length
    return { ...sec, done, total: lessons.length, pct: Math.round((done / lessons.length) * 100) }
  })

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0F172A" }}>

      {/* ── Left Sidebar: Curriculum ── */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300"
        style={{
          width: sidebarCollapsed ? "0px" : "280px",
          overflow: "hidden",
          backgroundColor: "#1E293B",
          borderRight: "1px solid #334155",
        }}
      >
        {/* Header */}
        <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #334155" }}>
          <Link
            href={`/student/courses/${id}`}
            className="flex items-center gap-1.5 text-xs mb-3"
            style={{ color: "#3B82F6" }}
          >
            <ChevronLeft size={13} /> Back to course
          </Link>
          <h2 className="text-sm font-bold text-white leading-snug line-clamp-2">{course.title}</h2>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1" style={{ color: "#64748B" }}>
              <span>{completedCount}/{totalLessons} lessons</span>
              <span style={{ color: progressPct === 100 ? "#10B981" : "#94A3B8" }}>{progressPct}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: progressPct === 100 ? "#10B981" : "#3B82F6",
                }}
              />
            </div>
          </div>
        </div>

        {/* Lessons list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {course.sections.map((section, si) => {
            const sp = sectionProgress[si]
            const allSecDone = sp.done === sp.total
            return (
              <div key={section.id}>
                {/* Section header */}
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{ color: "#475569", backgroundColor: "#172033", borderBottom: "1px solid #334155" }}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{section.title}</span>
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: allSecDone ? "#10B98120" : "#33415540",
                      color: allSecDone ? "#10B981" : "#64748B",
                    }}
                  >
                    {allSecDone && <CheckCircle2 size={10} />}
                    {sp.done}/{sp.total}
                  </span>
                </div>

                {section.lessons.map((lesson) => {
                  const active = lesson.id === currentLesson.id
                  const done = isDone(lesson.id, lesson.completed)
                  return (
                    <Link
                      key={lesson.id}
                      href={lesson.locked ? "#" : `/student/courses/${id}/learn/${lesson.id}`}
                      className="flex items-start gap-3 px-4 py-3 text-sm transition-colors"
                      style={{
                        backgroundColor: active ? "#3B82F620" : "transparent",
                        color: lesson.locked ? "#475569" : active ? "#F8FAFC" : "#94A3B8",
                        cursor: lesson.locked ? "not-allowed" : "pointer",
                        borderLeft: active ? "2px solid #3B82F6" : "2px solid transparent",
                      }}
                      onMouseEnter={(e) => { if (!active && !lesson.locked) e.currentTarget.style.backgroundColor = "#33415540" }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = active ? "#3B82F620" : "transparent" }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {done ? (
                          <CheckCircle2 size={14} style={{ color: "#10B981" }} />
                        ) : lesson.locked ? (
                          <Lock size={13} style={{ color: "#475569" }} />
                        ) : (
                          lessonTypeIcon(lesson.type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-snug" style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>
                          {lesson.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{lesson.duration}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ backgroundColor: "#1E293B", borderBottom: "1px solid #334155", height: 56 }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "#94A3B8", backgroundColor: "#334155" }}
            >
              {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
            <div className="text-xs" style={{ color: "#64748B" }}>
              <span>{course.title}</span>
              <span className="mx-1.5">›</span>
              <span className="text-white">{currentLesson?.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ backgroundColor: notesOpen ? "#3B82F620" : "#334155", color: notesOpen ? "#60A5FA" : "#94A3B8" }}
            >
              <PenLine size={13} /> Notes
            </button>
            <button className="p-1.5 rounded-lg" style={{ color: "#94A3B8", backgroundColor: "#334155" }}>
              <BookmarkPlus size={15} />
            </button>
            <button className="p-1.5 rounded-lg" style={{ color: "#94A3B8", backgroundColor: "#334155" }}>
              <Share2 size={15} />
            </button>
            <Link href="/student/discussions" className="p-1.5 rounded-lg" style={{ color: "#94A3B8", backgroundColor: "#334155" }}>
              <MessageSquare size={15} />
            </Link>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

            {/* Video player */}
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{ backgroundColor: "#0A0F1E", border: "1px solid #334155", aspectRatio: "16/9" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div
                  className="flex items-center justify-center w-20 h-20 rounded-full cursor-pointer"
                  style={{ backgroundColor: "#3B82F6", boxShadow: "0 0 40px rgba(59,130,246,0.4)" }}
                  onClick={() => setPlaying(!playing)}
                >
                  {playing
                    ? <Pause size={32} fill="#fff" color="#fff" />
                    : <Play size={32} fill="#fff" color="#fff" className="ml-1" />
                  }
                </div>
                <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                  {currentLesson?.type === "video" ? currentLesson?.title : "Interactive content"}
                </p>
              </div>

              {/* Controls bar */}
              <div
                className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center gap-3"
                style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}
              >
                <button onClick={() => setPlaying(!playing)}>
                  {playing ? <Pause size={16} fill="#fff" color="#fff" /> : <Play size={16} fill="#fff" color="#fff" />}
                </button>
                <button><SkipForward size={16} color="#9CA3AF" /></button>
                <div className="flex-1 h-1 rounded-full cursor-pointer" style={{ backgroundColor: "#334155" }}>
                  <div className="h-full rounded-full" style={{ width: "34%", backgroundColor: "#3B82F6" }} />
                </div>
                <span className="text-xs" style={{ color: "#9CA3AF" }}>8:12 / {currentLesson?.duration}</span>
                <button><Volume2 size={16} color="#9CA3AF" /></button>
                <button><Settings2 size={16} color="#9CA3AF" /></button>
                <button><Maximize2 size={16} color="#9CA3AF" /></button>
              </div>
            </div>

            {/* Lesson header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
                    {lessonTypeIcon(currentLesson?.type ?? "video", 13)}
                    <span className="capitalize">{currentLesson?.type}</span>
                  </div>
                  <span className="text-xs" style={{ color: "#475569" }}>·</span>
                  <span className="text-xs" style={{ color: "#64748B" }}>{currentLesson?.duration}</span>
                  {currentDone && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>
                      <CheckCircle2 size={11} /> Completed
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-white">{currentLesson?.title}</h1>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                  {(currentLesson as { sectionTitle?: string })?.sectionTitle ?? ""} · {course.instructor}
                </p>
              </div>
            </div>

            {/* Transcript */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <h3 className="text-sm font-bold text-white mb-3">Transcript</h3>
              <div className="space-y-3 text-sm" style={{ color: "#94A3B8", lineHeight: 1.7 }}>
                {[
                  ["0:00", "Welcome back to the course. In this lesson, we're going to dive deep into Server Components and how they fundamentally change the way we think about data fetching in Next.js."],
                  ["0:42", "Before we start, let me quickly recap what we covered in the previous lesson about the App Router architecture and why server-side rendering matters for performance."],
                  ["2:15", "Server Components run exclusively on the server. They have direct access to your database, file system, and backend services without any client-side JavaScript being sent to the browser."],
                  ["4:30", "This is the key insight: because Server Components never ship their code to the client, you can import heavy dependencies, secret keys, and database queries without any security or bundle-size concerns."],
                ].map(([time, text]) => (
                  <p key={time}>
                    <span className="text-xs mr-2 font-mono" style={{ color: "#475569" }}>{time}</span>
                    {text}
                  </p>
                ))}
              </div>
            </div>

            {/* Notes panel */}
            {notesOpen && (
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                <h3 className="text-sm font-bold text-white mb-3">My Notes</h3>
                <textarea
                  className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC", minHeight: 120 }}
                  placeholder="Take notes here..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
                <div className="flex justify-end mt-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ backgroundColor: "#3B82F6", color: "#fff" }}>
                    Save Note
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom navigation */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ backgroundColor: "#1E293B", borderTop: "1px solid #334155" }}
        >
          {/* Prev */}
          <div>
            {prevLesson ? (
              <Link
                href={`/student/courses/${id}/learn/${prevLesson.id}`}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl"
                style={{ backgroundColor: "#334155", color: "#94A3B8" }}
              >
                <ChevronLeft size={16} />
                <span>
                  <p className="text-xs" style={{ color: "#475569" }}>Previous</p>
                  <p className="truncate max-w-36">{prevLesson.title}</p>
                </span>
              </Link>
            ) : <div />}
          </div>

          {/* Mark complete */}
          <button
            onClick={() => markComplete(currentLesson.id, !currentDone)}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            style={{
              backgroundColor: currentDone ? "#10B98120" : "#3B82F6",
              color: currentDone ? "#10B981" : "#fff",
              border: currentDone ? "1px solid #10B98140" : "none",
            }}
          >
            <CheckCircle2 size={16} />
            {currentDone ? "Completed ✓" : "Mark Complete"}
          </button>

          {/* Next */}
          <div>
            {nextLesson && !nextLesson.locked ? (
              <Link
                href={`/student/courses/${id}/learn/${nextLesson.id}`}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl"
                style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}
              >
                <span className="text-right">
                  <p className="text-xs" style={{ color: "#475569" }}>Next</p>
                  <p className="truncate max-w-36">{nextLesson.title}</p>
                </span>
                <ChevronRight size={16} />
              </Link>
            ) : nextLesson?.locked ? (
              <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl" style={{ backgroundColor: "#1E293B", color: "#475569" }}>
                <span className="text-right">
                  <p className="text-xs">Next</p>
                  <p className="truncate max-w-36">{nextLesson.title}</p>
                </span>
                <Lock size={14} />
              </div>
            ) : (
              // Last lesson — course complete
              currentDone ? (
                <Link
                  href={`/student/courses/${id}`}
                  className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl"
                  style={{ backgroundColor: "#10B981", color: "#fff" }}
                >
                  <CheckCircle2 size={15} /> Course Complete!
                </Link>
              ) : <div />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
