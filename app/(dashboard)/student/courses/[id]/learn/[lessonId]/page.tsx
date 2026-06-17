"use client"

import { useState, use } from "react"
import Link from "next/link"
import { COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import {
  ChevronLeft, ChevronRight, CheckCircle2, Lock, Play,
  HelpCircle, FileText, PenLine, Wifi, Video,
  BookmarkPlus, Share2, MessageSquare, Settings2,
  Volume2, Maximize2, Pause, SkipForward, RotateCcw,
} from "lucide-react"
import type { QuizQuestion } from "@/lib/data/courses"

const lessonTypeIcon = (type: string, size = 14) => {
  const s = size
  switch (type) {
    case "video": return <Video size={s} style={{ color: "#3B82F6" }} />
    case "quiz": return <HelpCircle size={s} style={{ color: "#8B5CF6" }} />
    case "reading": return <FileText size={s} style={{ color: "#10B981" }} />
    case "assignment": return <PenLine size={s} style={{ color: "#F59E0B" }} />
    case "live": return <Wifi size={s} style={{ color: "#EC4899" }} />
    default: return <Video size={s} style={{ color: "#3B82F6" }} />
  }
}

const OPTION_LABELS = ["A", "B", "C", "D"]

function QuizPlayer({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[]
  onComplete: () => void
}) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [submitted, setSubmitted] = useState(false)

  const q = questions[current]
  const isLast = current === questions.length - 1
  const answered = selected[current] !== null

  function choose(oi: number) {
    if (submitted) return
    const next = [...selected]
    next[current] = oi
    setSelected(next)
  }

  function next() {
    if (isLast) { setSubmitted(true) } else { setCurrent((c) => c + 1) }
  }

  function retry() {
    setCurrent(0)
    setSelected(Array(questions.length).fill(null))
    setSubmitted(false)
  }

  if (submitted) {
    const score = questions.filter((q, i) => selected[i] === q.correctIndex).length
    const pct = Math.round((score / questions.length) * 100)
    const passed = pct >= 70

    return (
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        {/* Results header */}
        <div
          className="flex flex-col items-center py-8 px-6"
          style={{ borderBottom: "1px solid #334155", backgroundColor: passed ? "#10B98110" : "#EF444410" }}
        >
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: passed ? "#10B98120" : "#EF444420" }}
          >
            {passed
              ? <CheckCircle2 size={32} style={{ color: "#10B981" }} />
              : <HelpCircle size={32} style={{ color: "#EF4444" }} />
            }
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{passed ? "Quiz Passed!" : "Quiz Complete"}</h2>
          <p className="text-sm" style={{ color: "#64748B" }}>
            You scored <span className="font-bold" style={{ color: passed ? "#10B981" : "#EF4444" }}>{score}/{questions.length}</span>
          </p>
          {/* Score bar */}
          <div className="w-48 h-2 rounded-full mt-4 overflow-hidden" style={{ backgroundColor: "#334155" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: passed ? "#10B981" : "#EF4444" }}
            />
          </div>
          <p className="text-2xl font-bold mt-2" style={{ color: passed ? "#10B981" : "#EF4444" }}>{pct}%</p>
        </div>

        {/* Per-question breakdown */}
        <div className="px-6 py-4 space-y-2">
          {questions.map((q, i) => {
            const correct = selected[i] === q.correctIndex
            return (
              <div key={q.id} className="flex items-start gap-3 py-2" style={{ borderBottom: i < questions.length - 1 ? "1px solid #1E293B" : "none" }}>
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: correct ? "#10B98118" : "#EF444418" }}
                >
                  {correct
                    ? <CheckCircle2 size={12} style={{ color: "#10B981" }} />
                    : <HelpCircle size={12} style={{ color: "#EF4444" }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-snug">{q.question}</p>
                  {!correct && (
                    <p className="text-xs mt-0.5" style={{ color: "#10B981" }}>
                      Correct: {q.options[q.correctIndex]}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid #334155" }}>
          <button
            onClick={retry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: "#334155", color: "#94A3B8" }}
          >
            <RotateCcw size={14} /> Try Again
          </button>
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <CheckCircle2 size={14} /> Mark Complete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
      {/* Progress bar */}
      <div className="h-1.5" style={{ backgroundColor: "#334155" }}>
        <div
          className="h-full transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%`, backgroundColor: "#8B5CF6" }}
        />
      </div>

      <div className="p-6 space-y-5">
        {/* Question counter */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>
            Question {current + 1} of {questions.length}
          </span>
          <span className="text-xs" style={{ color: "#475569" }}>
            {questions.filter((_, i) => selected[i] !== null).length} answered
          </span>
        </div>

        {/* Question */}
        <h2 className="text-base font-semibold text-white leading-snug">{q.question}</h2>

        {/* Options */}
        <div className="space-y-2.5">
          {q.options.map((opt, oi) => {
            const isSelected = selected[current] === oi
            return (
              <button
                key={oi}
                type="button"
                onClick={() => choose(oi)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: isSelected ? "#8B5CF620" : "#0F172A",
                  border: `1px solid ${isSelected ? "#8B5CF6" : "#334155"}`,
                  color: isSelected ? "#E9D5FF" : "#CBD5E1",
                }}
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: isSelected ? "#8B5CF6" : "#1E293B",
                    color: isSelected ? "#fff" : "#64748B",
                  }}
                >
                  {OPTION_LABELS[oi]}
                </span>
                <span className="text-sm">{opt}</span>
              </button>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30"
            style={{ backgroundColor: "#334155", color: "#94A3B8" }}
          >
            <ChevronLeft size={15} /> Back
          </button>
          <button
            onClick={next}
            disabled={!answered}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-30 transition-all"
            style={{ backgroundColor: "#8B5CF6" }}
          >
            {isLast ? "Submit Quiz" : "Next"} <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id, lessonId } = use(params)
  const p = STUDENT_PROFILE
  const course = COURSES.find((c) => c.id === id) ?? COURSES[0]

  const allLessons = course.sections.flatMap((s) => s.lessons.map((l) => ({ ...l, sectionTitle: s.title })))
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const currentLesson = allLessons[currentIndex] ?? allLessons[0]
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const [playing, setPlaying] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [markedComplete, setMarkedComplete] = useState(currentLesson.completed)

  const completedCount = allLessons.filter((l) => l.completed).length + (markedComplete && !currentLesson.completed ? 1 : 0)

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
              <span>{completedCount}/{allLessons.length} completed</span>
              <span>{course.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${course.progress}%`, backgroundColor: "#3B82F6" }}
              />
            </div>
          </div>
        </div>

        {/* Lessons list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {course.sections.map((section) => (
            <div key={section.id}>
              <div
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider"
                style={{ color: "#475569", backgroundColor: "#172033", borderBottom: "1px solid #334155" }}
              >
                {section.title}
              </div>
              {section.lessons.map((lesson) => {
                const active = lesson.id === (currentLesson?.id ?? lessonId)
                const done = lesson.completed || (active && markedComplete)
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
                      <p className="text-xs font-medium leading-snug">{lesson.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{lesson.duration}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
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
            <button
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "#94A3B8", backgroundColor: "#334155" }}
            >
              <BookmarkPlus size={15} />
            </button>
            <button
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "#94A3B8", backgroundColor: "#334155" }}
            >
              <Share2 size={15} />
            </button>
            <Link
              href="/student/discussions"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "#94A3B8", backgroundColor: "#334155" }}
            >
              <MessageSquare size={15} />
            </Link>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

            {/* Video player or Quiz */}
            {currentLesson?.type === "quiz" && currentLesson.questions && currentLesson.questions.length > 0 ? (
              <QuizPlayer
                questions={currentLesson.questions}
                onComplete={() => setMarkedComplete(true)}
              />
            ) : (
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{ backgroundColor: "#0A0F1E", border: "1px solid #334155", aspectRatio: "16/9" }}
            >
              {currentLesson?.videoId ? (
                <iframe
                  key={currentLesson.videoId + currentLesson.id}
                  src={`https://www.youtube.com/embed/${currentLesson.videoId}?rel=0&modestbranding=1`}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ border: "none" }}
                />
              ) : (
                <>
                  {/* Mock player for non-video or lessons without a videoId */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div
                      className="flex items-center justify-center w-20 h-20 rounded-full transition-transform cursor-pointer"
                      style={{ backgroundColor: "#3B82F6", boxShadow: "0 0 40px rgba(59,130,246,0.4)" }}
                      onClick={() => setPlaying(!playing)}
                    >
                      {playing ? <Pause size={32} fill="#fff" color="#fff" /> : <Play size={32} fill="#fff" color="#fff" className="ml-1" />}
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                      {currentLesson?.type === "video" ? currentLesson?.title : "Interactive content"}
                    </p>
                  </div>
                  {/* Video controls bar */}
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
                </>
              )}
            </div>
            )}

            {/* Lesson header */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
                  {lessonTypeIcon(currentLesson?.type ?? "video", 13)}
                  <span className="capitalize">{currentLesson?.type}</span>
                </div>
                <span className="text-xs" style={{ color: "#475569" }}>·</span>
                <span className="text-xs" style={{ color: "#64748B" }}>{currentLesson?.duration}</span>
              </div>
              <h1 className="text-xl font-bold text-white">{currentLesson?.title}</h1>
              <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                {(currentLesson as { sectionTitle?: string })?.sectionTitle ?? ""} · {course.instructor}
              </p>
            </div>

            {/* Transcript sample */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <h3 className="text-sm font-bold text-white mb-3">Transcript</h3>
              <div className="space-y-3 text-sm" style={{ color: "#94A3B8", lineHeight: 1.7 }}>
                <p>
                  <span className="text-xs mr-2 font-mono" style={{ color: "#475569" }}>0:00</span>
                  Welcome back to the course. In this lesson, we&apos;re going to dive deep into Server Components and how they fundamentally change the way we think about data fetching in Next.js.
                </p>
                <p>
                  <span className="text-xs mr-2 font-mono" style={{ color: "#475569" }}>0:42</span>
                  Before we start, let me quickly recap what we covered in the previous lesson about the App Router architecture and why server-side rendering matters for performance.
                </p>
                <p>
                  <span className="text-xs mr-2 font-mono" style={{ color: "#475569" }}>2:15</span>
                  Server Components run exclusively on the server. They have direct access to your database, file system, and backend services without any client-side JavaScript being sent to the browser.
                </p>
                <p>
                  <span className="text-xs mr-2 font-mono" style={{ color: "#475569" }}>4:30</span>
                  This is the key insight: because Server Components never ship their code to the client, you can import heavy dependencies, secret keys, and database queries without any security or bundle-size concerns.
                </p>
              </div>
            </div>

            {/* Notes panel */}
            {notesOpen && (
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
              >
                <h3 className="text-sm font-bold text-white mb-3">My Notes</h3>
                <textarea
                  className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                  style={{
                    backgroundColor: "#0F172A",
                    border: "1px solid #334155",
                    color: "#F8FAFC",
                    minHeight: 120,
                  }}
                  placeholder="Take notes here... They&apos;ll be saved to this lesson."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
                <div className="flex justify-end mt-2">
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                    style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                  >
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
          <div>
            {prevLesson ? (
              <Link
                href={`/student/courses/${id}/learn/${prevLesson.id}`}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                style={{ backgroundColor: "#334155", color: "#94A3B8" }}
              >
                <ChevronLeft size={16} />
                <span>
                  <p className="text-xs" style={{ color: "#475569" }}>Previous</p>
                  <p className="truncate max-w-36">{prevLesson.title}</p>
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>

          <button
            onClick={() => setMarkedComplete(true)}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            style={{
              backgroundColor: markedComplete ? "#10B98120" : "#3B82F6",
              color: markedComplete ? "#10B981" : "#fff",
              border: markedComplete ? "1px solid #10B98140" : "none",
            }}
          >
            <CheckCircle2 size={16} />
            {markedComplete ? "Marked Complete" : "Mark Complete"}
          </button>

          <div>
            {nextLesson && !nextLesson.locked ? (
              <Link
                href={`/student/courses/${id}/learn/${nextLesson.id}`}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}
              >
                <span className="text-right">
                  <p className="text-xs" style={{ color: "#475569" }}>Next</p>
                  <p className="truncate max-w-36">{nextLesson.title}</p>
                </span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
