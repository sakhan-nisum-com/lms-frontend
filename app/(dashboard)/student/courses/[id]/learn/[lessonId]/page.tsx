"use client"

import { useState, use, useEffect } from "react"
import Link from "next/link"
import { COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import { useProgress } from "@/lib/hooks/useProgress"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import {
  ChevronLeft, ChevronRight, CheckCircle2, Lock, Play,
  HelpCircle, FileText, PenLine, Wifi, Video,
  BookmarkPlus, Share2, MessageSquare, Settings2,
  Volume2, Maximize2, Pause, SkipForward, RotateCcw,
  BrainCircuit, AlertCircle, X,
} from "lucide-react"
import type { QuizQuestion } from "@/lib/data/courses"

const lessonTypeIcon = (type: string, size = 14) => {
  switch (type) {
    case "video": return <Video size={size} style={{ color: "var(--accent)" }} />
    case "quiz": return <HelpCircle size={size} style={{ color: "#8B5CF6" }} />
    case "reading": return <FileText size={size} style={{ color: "var(--success)" }} />
    case "assignment": return <PenLine size={size} style={{ color: "var(--warning)" }} />
    case "live": return <Wifi size={size} style={{ color: "#EC4899" }} />
    default: return <Video size={size} style={{ color: "var(--accent)" }} />
  }
}

const OPTION_LABELS = ["A", "B", "C", "D"]

function QuizPlayer({
  questions,
  onComplete,
  passingScore = 70,
}: {
  questions: QuizQuestion[]
  onComplete: (passed: boolean) => void
  passingScore?: number
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
    const passed = pct >= passingScore

    return (
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        {/* Results header */}
        <div
          className="flex flex-col items-center py-8 px-6"
          style={{ borderBottom: "1px solid var(--border-default)", backgroundColor: passed ? "#10B98110" : "#EF444410" }}
        >
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: passed ? "#10B98120" : "#EF444420" }}
          >
            {passed
              ? <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
              : <HelpCircle size={32} style={{ color: "var(--danger)" }} />
            }
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{passed ? "Quiz Passed!" : "Quiz Complete"}</h2>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            You scored <span className="font-bold" style={{ color: passed ? "var(--success)" : "var(--danger)" }}>{score}/{questions.length}</span>
          </p>
          {/* Score bar */}
          <div className="w-48 h-2 rounded-full mt-4 overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: passed ? "var(--success)" : "var(--danger)" }}
            />
          </div>
          <p className="text-2xl font-bold mt-2" style={{ color: passed ? "var(--success)" : "var(--danger)" }}>{pct}%</p>
        </div>

        {/* Per-question breakdown */}
        <div className="px-6 py-4 space-y-2">
          {questions.map((q, i) => {
            const correct = selected[i] === q.correctIndex
            return (
              <div key={q.id} className="flex items-start gap-3 py-2" style={{ borderBottom: i < questions.length - 1 ? "1px solid var(--bg-surface)" : "none" }}>
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: correct ? "#10B98118" : "#EF444418" }}
                >
                  {correct
                    ? <CheckCircle2 size={12} style={{ color: "var(--success)" }} />
                    : <HelpCircle size={12} style={{ color: "var(--danger)" }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{q.question}</p>
                  {!correct && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--success)" }}>
                      Correct: {q.options[q.correctIndex]}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--border-default)" }}>
          <button
            onClick={retry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
          >
            <RotateCcw size={14} /> Try Again
          </button>
          <button
            onClick={() => onComplete(passed)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <CheckCircle2 size={14} /> Mark Complete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
      {/* Progress bar */}
      <div className="h-1.5" style={{ backgroundColor: "var(--border-default)" }}>
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
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {questions.filter((_, i) => selected[i] !== null).length} answered
          </span>
        </div>

        {/* Question */}
        <h2 className="text-base font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{q.question}</h2>

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
                  backgroundColor: isSelected ? "#8B5CF620" : "var(--bg-surface-muted)",
                  border: `1px solid ${isSelected ? "#8B5CF6" : "var(--border-default)"}`,
                  color: isSelected ? "#E9D5FF" : "#CBD5E1",
                }}
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: isSelected ? "#8B5CF6" : "var(--bg-surface)",
                    color: isSelected ? "#fff" : "var(--text-tertiary)",
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
            style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
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
  const course = COURSES.find((c) => c.id === id) ?? COURSES[0]
  const { completedIds, markComplete, isComplete } = useProgress(id)
  const { isPurchased } = usePurchases()

  const [playing, setPlaying] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Knowledge check state
  const [lessonKCResults, setLessonKCResults] = useState<Record<string, "passed" | "failed" | "skipped">>({})
  const [sectionKCDone, setSectionKCDone] = useState<Record<string, string[]>>({})
  const [sessionKCFlow, setSessionKCFlow] = useState<{
    sectionId: string
    partIndex: number
    phase: "taking" | "results"
    passedLessonIds: string[]
  } | null>(null)

  const owned = course.progress !== undefined || isPurchased(course.id)

  if (!owned) {
    return (
      <div className="flex h-screen items-center justify-center p-6" style={{ backgroundColor: "var(--bg-canvas)" }}>
        <div className="rounded-2xl p-8 text-center shadow-sm" style={{ maxWidth: 420, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <CourseThumbnail course={course} heightClass="h-32 mb-5" roundedClass="rounded-xl" />
          <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full" style={{ backgroundColor: "#3B82F620" }}>
            <Lock size={24} style={{ color: "#60A5FA" }} />
          </div>
          <h1 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Purchase this course to start watching</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}><strong style={{ color: "var(--text-primary)" }}>{course.title}</strong> isn&apos;t in your library yet. Buy it once and watch every lesson, anytime.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href={course.price === "Free" ? `/student/courses/${course.id}` : `/student/courses/${course.id}/checkout`}
              className="px-5 py-3 rounded-xl text-sm font-bold"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              {course.price === "Free" ? "Enroll for Free" : `Buy Now — $${course.price}`}
            </Link>
            <Link
              href={`/student/courses/${course.id}`}
              className="px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "var(--border-default)", color: "#CBD5E1" }}
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

  // KC derived state
  const currentSection = course.sections.find(s => s.lessons.some(l => l.id === currentLesson?.id))
  const lessonKCResult = lessonKCResults[currentLesson?.id]
  const showLessonKCGate = !!currentLesson?.lessonKC && lessonKCResult === undefined
  const skippableLessonIds = currentSection ? (sectionKCDone[currentSection.id] ?? []) : []

  // Auto-start session KC when entering a section with an unseen KC
  const sectionId = currentSection?.id ?? ""
  const hasSessionKC = !!currentSection?.sessionKC
  const sessionKCUnseen = hasSessionKC && sectionKCDone[sectionId] === undefined && sessionKCFlow === null && !showLessonKCGate
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (sessionKCUnseen) setSessionKCFlow({ sectionId, partIndex: 0, phase: "taking", passedLessonIds: [] })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, sessionKCUnseen])

  function finishSessionKC(passedIds: string[]) {
    setSectionKCDone(prev => ({ ...prev, [sectionId]: passedIds }))
    setSessionKCFlow(null)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-canvas)" }}>

      {/* ── Session KC Modal (full-screen) ── */}
      {sessionKCFlow && currentSection?.sessionKC && (() => {
        const kc = currentSection.sessionKC!
        const part = kc.parts[sessionKCFlow.partIndex]
        const partLesson = currentSection.lessons.find(l => l.id === part?.lessonId)
        return (
          <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "var(--bg-canvas)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}>
              <div className="flex items-center gap-3">
                <BrainCircuit size={18} style={{ color: "#8B5CF6" }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Session Knowledge Check</p>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{currentSection.title}</p>
                </div>
                {kc.isMandatory && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#F59E0B20", color: "var(--warning)" }}>Mandatory</span>
                )}
              </div>
              {!kc.isMandatory && (
                <button onClick={() => finishSessionKC([])} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-colors" style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                  <X size={12} /> Skip Check
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
                {sessionKCFlow.phase === "taking" && part ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: "#8B5CF6" }}>
                          Part {sessionKCFlow.partIndex + 1} of {kc.parts.length}
                        </p>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{partLesson?.title}</p>
                      </div>
                      <div className="flex gap-1">
                        {kc.parts.map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i < sessionKCFlow.partIndex ? "var(--success)" : i === sessionKCFlow.partIndex ? "#8B5CF6" : "var(--border-default)" }} />
                        ))}
                      </div>
                    </div>
                    {part.questions.length > 0 ? (
                      <QuizPlayer
                        questions={part.questions}
                        passingScore={part.passingScore}
                        onComplete={(passed) => {
                          const newPassed = passed
                            ? [...sessionKCFlow.passedLessonIds, part.lessonId]
                            : sessionKCFlow.passedLessonIds
                          const nextIdx = sessionKCFlow.partIndex + 1
                          if (nextIdx < kc.parts.length) {
                            setSessionKCFlow({ ...sessionKCFlow, partIndex: nextIdx, passedLessonIds: newPassed })
                          } else {
                            setSessionKCFlow({ ...sessionKCFlow, phase: "results", passedLessonIds: newPassed })
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center py-10" style={{ color: "var(--text-tertiary)" }}>
                        <p className="text-sm">No questions for this part.</p>
                        <button onClick={() => {
                          const nextIdx = sessionKCFlow.partIndex + 1
                          if (nextIdx < kc.parts.length) setSessionKCFlow({ ...sessionKCFlow, partIndex: nextIdx })
                          else setSessionKCFlow({ ...sessionKCFlow, phase: "results" })
                        }} className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#8B5CF6" }}>
                          Next Part
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* Results phase */
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#8B5CF620" }}>
                        <BrainCircuit size={28} style={{ color: "#8B5CF6" }} />
                      </div>
                      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Check Complete</h2>
                      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Here&apos;s what you can skip:</p>
                    </div>
                    <div className="space-y-2">
                      {kc.parts.map((p, i) => {
                        const passed = sessionKCFlow.passedLessonIds.includes(p.lessonId)
                        const ln = currentSection.lessons.find(l => l.id === p.lessonId)
                        return (
                          <div key={p.lessonId} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${passed ? "#10B98140" : "var(--border-default)"}` }}>
                            {passed
                              ? <CheckCircle2 size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
                              : <AlertCircle size={16} style={{ color: "var(--danger)", flexShrink: 0 }} />}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>Part {i + 1} — {ln?.title}</p>
                              <p className="text-xs mt-0.5" style={{ color: passed ? "var(--success)" : "var(--danger)" }}>
                                {passed ? "Passed — lesson can be skipped" : "Not passed — lesson required"}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => finishSessionKC(sessionKCFlow.passedLessonIds)}
                      className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all"
                      style={{ backgroundColor: "#8B5CF6" }}
                    >
                      Start Learning →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Left Sidebar: Curriculum ── */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300"
        style={{
          width: sidebarCollapsed ? "0px" : "280px",
          overflow: "hidden",
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--border-default)",
        }}
      >
        {/* Header */}
        <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-default)" }}>
          <Link
            href={`/student/courses/${id}`}
            className="flex items-center gap-1.5 text-xs mb-3"
            style={{ color: "var(--accent)" }}
          >
            <ChevronLeft size={13} /> Back to course
          </Link>
          <h2 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: "var(--text-primary)" }}>{course.title}</h2>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>
              <span>{completedCount}/{totalLessons} lessons</span>
              <span style={{ color: progressPct === 100 ? "var(--success)" : "var(--text-secondary)" }}>{progressPct}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: progressPct === 100 ? "var(--success)" : "var(--accent)",
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
                  style={{ color: "var(--text-muted)", backgroundColor: "#172033", borderBottom: "1px solid var(--border-default)" }}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{section.title}</span>
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: allSecDone ? "#10B98120" : "#33415540",
                      color: allSecDone ? "var(--success)" : "var(--text-tertiary)",
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
                        color: lesson.locked ? "var(--text-muted)" : active ? "var(--text-primary)" : "var(--text-secondary)",
                        cursor: lesson.locked ? "not-allowed" : "pointer",
                        borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                      }}
                      onMouseEnter={(e) => { if (!active && !lesson.locked) e.currentTarget.style.backgroundColor = "#33415540" }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = active ? "#3B82F620" : "transparent" }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {done ? (
                          <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                        ) : lesson.locked ? (
                          <Lock size={13} style={{ color: "var(--text-muted)" }} />
                        ) : (
                          lessonTypeIcon(lesson.type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-snug" style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{lesson.duration}</p>
                          {skippableLessonIds.includes(lesson.id) && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#8B5CF620", color: "#A78BFA" }}>SKIP</span>
                          )}
                          {lesson.lessonKC && !lessonKCResults[lesson.id] && (
                            <BrainCircuit size={10} style={{ color: "#8B5CF6", flexShrink: 0 }} />
                          )}
                        </div>
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
          style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)", height: 56 }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)", backgroundColor: "var(--border-default)" }}
            >
              {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
            <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              <span>{course.title}</span>
              <span className="mx-1.5">›</span>
              <span style={{ color: "var(--text-primary)" }}>{currentLesson?.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ backgroundColor: notesOpen ? "#3B82F620" : "var(--border-default)", color: notesOpen ? "#60A5FA" : "var(--text-secondary)" }}
            >
              <PenLine size={13} /> Notes
            </button>
            <button className="p-1.5 rounded-lg" style={{ color: "var(--text-secondary)", backgroundColor: "var(--border-default)" }}>
              <BookmarkPlus size={15} />
            </button>
            <button className="p-1.5 rounded-lg" style={{ color: "var(--text-secondary)", backgroundColor: "var(--border-default)" }}>
              <Share2 size={15} />
            </button>
            <Link href="/student/discussions" className="p-1.5 rounded-lg" style={{ color: "var(--text-secondary)", backgroundColor: "var(--border-default)" }}>
              <MessageSquare size={15} />
            </Link>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

            {/* Lesson KC Gate */}
            {showLessonKCGate && currentLesson?.lessonKC && (
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid #8B5CF640" }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border-default)", backgroundColor: "#8B5CF610" }}>
                  <div className="flex items-center gap-3">
                    <BrainCircuit size={18} style={{ color: "#8B5CF6" }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Lesson Knowledge Check</p>
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>Do you already know this? Pass to skip the lesson.</p>
                    </div>
                  </div>
                  {!currentLesson.lessonKC.isMandatory && (
                    <button
                      onClick={() => setLessonKCResults(prev => ({ ...prev, [currentLesson.id]: "skipped" }))}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-colors flex-shrink-0"
                      style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                    >
                      <X size={12} /> Skip Check
                    </button>
                  )}
                </div>
                <div className="p-6">
                  <QuizPlayer
                    questions={currentLesson.lessonKC.questions}
                    passingScore={currentLesson.lessonKC.passingScore}
                    onComplete={(passed) => {
                      setLessonKCResults(prev => ({ ...prev, [currentLesson.id]: passed ? "passed" : "failed" }))
                    }}
                  />
                </div>
              </div>
            )}

            {/* Passed KC — offer skip or continue */}
            {lessonKCResult === "passed" && nextLesson && (
              <div className="flex items-center gap-4 px-5 py-4 rounded-2xl" style={{ backgroundColor: "#10B98115", border: "1px solid #10B98140" }}>
                <CheckCircle2 size={20} style={{ color: "var(--success)", flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>You already know this!</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>You passed the knowledge check — this lesson is optional for you.</p>
                </div>
                <Link
                  href={`/student/courses/${id}/learn/${nextLesson.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0 hover:opacity-90"
                  style={{ backgroundColor: "var(--success)" }}
                >
                  Skip Lesson <SkipForward size={14} />
                </Link>
              </div>
            )}

            {/* Video player or Quiz */}
            {!showLessonKCGate && (currentLesson?.type === "quiz" && currentLesson.questions && currentLesson.questions.length > 0 ? (
              <QuizPlayer
                questions={currentLesson.questions}
                onComplete={() => markComplete(currentLesson.id, true)}
                passingScore={70}
              />
            ) : (
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{ backgroundColor: "#0A0F1E", border: "1px solid var(--border-default)", aspectRatio: "16/9" }}
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
                      style={{ backgroundColor: "var(--accent)", boxShadow: "0 0 40px rgba(59,130,246,0.4)" }}
                      onClick={() => setPlaying(!playing)}
                    >
                      {playing ? <Pause size={32} fill="#fff" color="#fff" /> : <Play size={32} fill="#fff" color="#fff" className="ml-1" />}
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>
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
                    <div className="flex-1 h-1 rounded-full cursor-pointer" style={{ backgroundColor: "var(--border-default)" }}>
                      <div className="h-full rounded-full" style={{ width: "34%", backgroundColor: "var(--accent)" }} />
                    </div>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>8:12 / {currentLesson?.duration}</span>
                    <button><Volume2 size={16} color="#9CA3AF" /></button>
                    <button><Settings2 size={16} color="#9CA3AF" /></button>
                    <button><Maximize2 size={16} color="#9CA3AF" /></button>
                  </div>
                </>
              )}
            </div>
            ))}

            {/* Lesson header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {lessonTypeIcon(currentLesson?.type ?? "video", 13)}
                    <span className="capitalize">{currentLesson?.type}</span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>·</span>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{currentLesson?.duration}</span>
                  {currentDone && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#10B98120", color: "var(--success)" }}>
                      <CheckCircle2 size={11} /> Completed
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{currentLesson?.title}</h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {(currentLesson as { sectionTitle?: string })?.sectionTitle ?? ""} · {course.instructor}
                </p>
              </div>
            </div>

            {/* Transcript */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Transcript</h3>
              <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {[
                  ["0:00", "Welcome back to the course. In this lesson, we're going to dive deep into Server Components and how they fundamentally change the way we think about data fetching in Next.js."],
                  ["0:42", "Before we start, let me quickly recap what we covered in the previous lesson about the App Router architecture and why server-side rendering matters for performance."],
                  ["2:15", "Server Components run exclusively on the server. They have direct access to your database, file system, and backend services without any client-side JavaScript being sent to the browser."],
                  ["4:30", "This is the key insight: because Server Components never ship their code to the client, you can import heavy dependencies, secret keys, and database queries without any security or bundle-size concerns."],
                ].map(([time, text]) => (
                  <p key={time}>
                    <span className="text-xs mr-2 font-mono" style={{ color: "var(--text-muted)" }}>{time}</span>
                    {text}
                  </p>
                ))}
              </div>
            </div>

            {/* Notes panel */}
            {notesOpen && (
              <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>My Notes</h3>
                <textarea
                  className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)", minHeight: 120 }}
                  placeholder="Take notes here..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
                <div className="flex justify-end mt-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
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
          style={{ backgroundColor: "var(--bg-surface)", borderTop: "1px solid var(--border-default)" }}
        >
          {/* Prev */}
          <div>
            {prevLesson ? (
              <Link
                href={`/student/courses/${id}/learn/${prevLesson.id}`}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl"
                style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                <ChevronLeft size={16} />
                <span>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Previous</p>
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
              backgroundColor: currentDone ? "#10B98120" : "var(--accent)",
              color: currentDone ? "var(--success)" : "#fff",
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
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Next</p>
                  <p className="truncate max-w-36">{nextLesson.title}</p>
                </span>
                <ChevronRight size={16} />
              </Link>
            ) : nextLesson?.locked ? (
              <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-muted)" }}>
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
                  style={{ backgroundColor: "var(--success)", color: "#fff" }}
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
