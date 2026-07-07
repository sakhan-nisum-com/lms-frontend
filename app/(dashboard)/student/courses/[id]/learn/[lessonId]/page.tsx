"use client"

import { useState, use, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import { useProgress } from "@/lib/hooks/useProgress"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { enrollmentsApi } from "@/lib/api/enrollments"
import { quizzesApi, type AnswerSubmission, type ApiQuiz, type ApiQuizQuestion } from "@/lib/api/quizzes"
import { coursesApi, type ApiCourse, type ApiLesson } from "@/lib/api/courses"
import { notesApi } from "@/lib/api/notes"
import { discussionsApi, type ApiDiscussionThread, type ApiDiscussionReply } from "@/lib/api/discussions"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import {
  ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, Lock, Play,
  HelpCircle, FileText, PenLine, Wifi, Video,
  BookmarkPlus, Share2, MessageSquare,
  Volume2, Maximize2, Pause, SkipForward, RotateCcw,
  BrainCircuit, X, Download, Award, GraduationCap, Copy, Check,
  Loader2, Send, Trash2, Plus, ChevronUp,
} from "lucide-react"
import type { QuizQuestion } from "@/lib/data/courses"

function formatLessonDuration(secs: number | null): string {
  if (!secs) return ""
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function apiLessonType(t: string): "video" | "quiz" | "reading" | "assignment" | "live" {
  const map: Record<string, "video" | "quiz" | "reading" | "assignment" | "live"> = {
    VIDEO: "video", QUIZ: "quiz", READING: "reading",
    ASSIGNMENT: "assignment", LIVE: "live", PDF: "reading", DOWNLOAD: "reading",
  }
  return map[t?.toUpperCase()] ?? "video"
}

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

// ── Lesson Notes ──────────────────────────────────────────────────────────────
function LessonNotes({ lessonId }: { lessonId: string }) {
  const [text, setText] = useState("")
  const [saveStatus, setSaveStatus] = useState<"idle" | "pending" | "saving" | "saved" | "error">("idle")
  const [hasNote, setHasNote] = useState(false)
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLoading(true)
    setSaveStatus("idle")
    notesApi.getByLesson(lessonId)
      .then((note) => {
        if (note) { setText(note.content); setHasNote(true) }
        else { setText(""); setHasNote(false) }
      })
      .catch(() => { setText(""); setHasNote(false) })
      .finally(() => setLoading(false))
  }, [lessonId])

  const save = useCallback((content: string) => {
    setSaveStatus("saving")
    notesApi.upsert(lessonId, content)
      .then(() => { setHasNote(true); setSaveStatus("saved") })
      .catch(() => setSaveStatus("error"))
  }, [lessonId])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setText(val)
    setSaveStatus("pending")
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setSaveStatus("idle"); return }
    debounceRef.current = setTimeout(() => save(val), 1000)
  }

  function handleDelete() {
    notesApi.delete(lessonId).then(() => { setText(""); setHasNote(false); setSaveStatus("idle") }).catch(() => {})
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>My Notes</h3>
        <div className="flex items-center gap-3">
          {saveStatus === "pending" && <span className="text-xs" style={{ color: "var(--text-muted)" }}>Unsaved…</span>}
          {saveStatus === "saving" && <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}><Loader2 size={11} className="animate-spin" /> Saving…</span>}
          {saveStatus === "saved" && <span className="flex items-center gap-1 text-xs" style={{ color: "var(--success)" }}><CheckCircle2 size={11} /> Saved</span>}
          {saveStatus === "error" && <span className="text-xs" style={{ color: "var(--danger)" }}>Save failed</span>}
          {hasNote && (
            <button onClick={handleDelete} className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors hover:opacity-80"
              style={{ color: "var(--danger)", backgroundColor: "var(--bg-surface-muted)" }}>
              <Trash2 size={11} /> Delete
            </button>
          )}
        </div>
      </div>
      <textarea
        className="w-full p-4 text-sm resize-none outline-none rounded-lg"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)", minHeight: 240, lineHeight: 1.8, transition: "border-color 0.15s" }}
        placeholder="Take notes for this lesson… (auto-saved as you type)"
        value={text}
        onChange={handleChange}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
      />
      {!hasNote && !text && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Notes are saved automatically as you type and synced to your account.</p>
      )}
    </div>
  )
}

// ── Lesson Q&A ────────────────────────────────────────────────────────────────
function LessonQA({ lessonId, courseId }: { lessonId: string; courseId: string }) {
  const [threads, setThreads] = useState<ApiDiscussionThread[]>([])
  const [loading, setLoading] = useState(true)
  const [openThreadId, setOpenThreadId] = useState<string | null>(null)
  const [replies, setReplies] = useState<Record<string, ApiDiscussionReply[]>>({})
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setThreads([])
    setOpenThreadId(null)
    discussionsApi.listByLesson(lessonId)
      .then((r) => setThreads(r.data ?? []))
      .catch(() => setThreads([]))
      .finally(() => setLoading(false))
  }, [lessonId])

  function toggleThread(threadId: string) {
    if (openThreadId === threadId) { setOpenThreadId(null); return }
    setOpenThreadId(threadId)
    if (!replies[threadId]) {
      setLoadingReplies(threadId)
      discussionsApi.listReplies(threadId)
        .then((r) => setReplies((prev) => ({ ...prev, [threadId]: r })))
        .catch(() => setReplies((prev) => ({ ...prev, [threadId]: [] })))
        .finally(() => setLoadingReplies(null))
    }
  }

  async function submitQuestion() {
    if (!newTitle.trim() || !newBody.trim() || submitting) return
    setSubmitting(true)
    try {
      const thread = await discussionsApi.create({ lessonId, courseId, title: newTitle.trim(), body: newBody.trim() })
      setThreads((prev) => [thread, ...prev])
      setNewTitle(""); setNewBody(""); setShowForm(false)
    } catch { /* ignore */ } finally { setSubmitting(false) }
  }

  async function submitReply(threadId: string) {
    const body = replyText[threadId]?.trim()
    if (!body || replySubmitting) return
    setReplySubmitting(threadId)
    try {
      const reply = await discussionsApi.createReply(threadId, body)
      setReplies((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), reply] }))
      setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, replyCount: t.replyCount + 1 } : t))
      setReplyText((prev) => ({ ...prev, [threadId]: "" }))
    } catch { /* ignore */ } finally { setReplySubmitting(null) }
  }

  function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return "just now"
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Q&amp;A — {threads.length} question{threads.length !== 1 ? "s" : ""}
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          <Plus size={13} /> Ask a Question
        </button>
      </div>

      {/* New question form */}
      {showForm && (
        <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>New Question</p>
          <input
            className="w-full px-3 py-2 text-sm rounded outline-none"
            style={{ backgroundColor: "var(--bg-canvas)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            placeholder="Question title (e.g. What does X mean?)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
          />
          <textarea
            className="w-full px-3 py-2 text-sm rounded outline-none resize-none"
            style={{ backgroundColor: "var(--bg-canvas)", border: "1px solid var(--border-default)", color: "var(--text-primary)", minHeight: 100, lineHeight: 1.7 }}
            placeholder="Describe your question in detail…"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="text-xs px-3 py-1.5 rounded" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-surface-muted)" }}>Cancel</button>
            <button
              onClick={submitQuestion}
              disabled={!newTitle.trim() || !newBody.trim() || submitting}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Post Question
            </button>
          </div>
        </div>
      )}

      {/* Thread list */}
      {threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <MessageSquare size={36} style={{ color: "var(--text-muted)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No questions yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Be the first to ask a question about this lesson.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => {
            const isOpen = openThreadId === thread.id
            const threadReplies = replies[thread.id] ?? []
            return (
              <div key={thread.id} className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
                {/* Thread header */}
                <button
                  className="w-full flex items-start gap-3 p-4 text-left transition-colors"
                  style={{ backgroundColor: isOpen ? "var(--accent-subtle)" : "var(--bg-surface)" }}
                  onClick={() => toggleThread(thread.id)}
                >
                  <MessageSquare size={15} className="flex-shrink-0 mt-0.5" style={{ color: isOpen ? "var(--accent)" : "var(--text-tertiary)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{thread.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{thread.authorName}</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>·</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{relativeTime(thread.createdAt)}</span>
                      {thread.replyCount > 0 && (
                        <>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>·</span>
                          <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>{thread.replyCount} reply{thread.replyCount !== 1 ? "ies" : ""}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={15} style={{ color: "var(--text-tertiary)" }} /> : <ChevronDown size={15} style={{ color: "var(--text-tertiary)" }} />}
                </button>

                {/* Expanded thread body + replies */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--border-default)" }}>
                    {/* Original post body */}
                    <div className="px-4 py-3" style={{ backgroundColor: "var(--bg-canvas)" }}>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{thread.body}</p>
                    </div>

                    {/* Replies */}
                    {loadingReplies === thread.id ? (
                      <div className="flex justify-center py-4" style={{ borderTop: "1px solid var(--border-default)" }}>
                        <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
                      </div>
                    ) : threadReplies.length > 0 ? (
                      <div style={{ borderTop: "1px solid var(--border-default)" }}>
                        {threadReplies.map((reply) => (
                          <div key={reply.id} className="px-4 py-3 flex gap-3" style={{ borderBottom: "1px solid var(--border-default)" }}>
                            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}>
                              {reply.authorName?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{reply.authorName}</span>
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{relativeTime(reply.createdAt)}</span>
                                {reply.acceptedAnswer && (
                                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#dcfce7", color: "var(--success)" }}>✓ Answer</span>
                                )}
                              </div>
                              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{reply.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Reply input */}
                    <div className="px-4 py-3 flex gap-2" style={{ borderTop: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)" }}>
                      <input
                        className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                        style={{ backgroundColor: "var(--bg-canvas)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                        placeholder="Write a reply…"
                        value={replyText[thread.id] ?? ""}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(thread.id) } }}
                      />
                      <button
                        onClick={() => submitReply(thread.id)}
                        disabled={!replyText[thread.id]?.trim() || replySubmitting === thread.id}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-40 transition-opacity hover:opacity-80 flex-shrink-0"
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                      >
                        {replySubmitting === thread.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface NormalizedQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

function normalizeQuestion(q: QuizQuestion): NormalizedQuestion {
  if (q.type === "true-false") {
    return { id: q.id, question: q.question, options: ["True", "False"], correctIndex: q.correctAnswer ? 0 : 1, explanation: q.explanation }
  }
  if (q.type === "multi-select") {
    return { id: q.id, question: q.question, options: q.options, correctIndex: q.correctIndexes[0] ?? 0, explanation: q.explanation }
  }
  if (q.type === "short-answer") {
    return { id: q.id, question: q.question, options: q.acceptedAnswers ?? [], correctIndex: 0, explanation: q.explanation }
  }
  return { id: q.id, question: q.question, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation }
}

function normalizeApiQuestion(q: ApiQuizQuestion, idx: number): NormalizedQuestion {
  const id = q.id ?? `api-q-${idx}`
  const questionText = q.questionText ?? q.questionTextAr ?? `Question ${idx + 1}`
  const options = q.options?.map((o) => o.text ?? o.textAr ?? "").filter(Boolean) ?? []
  if (q.type === "TRUE_FALSE") {
    return { id, question: questionText, options: ["True", "False"], correctIndex: (q.correctIndex ?? 0) === 0 ? 0 : 1, explanation: q.explanation }
  }
  if (q.type === "MULTI_SELECT") {
    return { id, question: questionText, options, correctIndex: q.correctIndices?.[0] ?? 0, explanation: q.explanation }
  }
  if (q.type === "SHORT_ANSWER" || q.type === "ESSAY") {
    return { id, question: questionText, options: q.acceptedAnswers ?? [], correctIndex: 0, explanation: q.explanation }
  }
  return { id, question: questionText, options, correctIndex: q.correctIndex ?? 0, explanation: q.explanation }
}

function QuizPlayer({
  questions,
  randomize = false,
  questionsPerAttempt,
  onComplete,
  onAnswersSubmitted,
  passingScore = 70,
}: {
  questions: NormalizedQuestion[]
  randomize?: boolean
  questionsPerAttempt?: number | null
  onComplete: (passed: boolean) => void
  onAnswersSubmitted?: (
    selected: (number | null)[],
    nqs: NormalizedQuestion[],
  ) => Promise<{ score: number; maxScore: number; passed: boolean } | null>
  passingScore?: number
}) {
  function sampleQuestions(): NormalizedQuestion[] {
    let pool = randomize ? [...questions].sort(() => Math.random() - 0.5) : [...questions]
    if (questionsPerAttempt && questionsPerAttempt > 0 && questionsPerAttempt < pool.length) {
      pool = pool.slice(0, questionsPerAttempt)
    }
    return pool
  }

  const [nqs, setNqs] = useState<NormalizedQuestion[]>(() => sampleQuestions())
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<(number | null)[]>(Array(nqs.length).fill(null))
  const [phase, setPhase] = useState<"taking" | "submitting" | "results">("taking")
  const [serverResult, setServerResult] = useState<{ score: number; maxScore: number; passed: boolean } | null>(null)

  const q = nqs[current]
  const isLast = current === nqs.length - 1
  const answered = selected[current] !== null || (q?.options?.length === 0)

  function choose(oi: number) {
    if (phase !== "taking") return
    const next = [...selected]
    next[current] = oi
    setSelected(next)
  }

  async function submit() {
    setPhase("submitting")
    let res: { score: number; maxScore: number; passed: boolean } | null = null
    try {
      res = (await onAnswersSubmitted?.(selected, nqs)) ?? null
    } catch { /* ignore — fall back to client scoring */ }
    setServerResult(res)
    setPhase("results")
  }

  function next() {
    if (isLast) {
      submit()
    } else {
      setCurrent((c) => c + 1)
    }
  }

  function retry() {
    const fresh = sampleQuestions()
    setNqs(fresh)
    setCurrent(0)
    setSelected(Array(fresh.length).fill(null))
    setPhase("taking")
    setServerResult(null)
  }

  if (phase === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 300, backgroundColor: "var(--bg-surface)", borderRadius: 8 }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Submitting your answers…</p>
      </div>
    )
  }

  if (phase === "results") {
    // Prefer server-calculated score; fall back to client-side correctIndex comparison
    const localScore = nqs.filter((q, i) => selected[i] === q.correctIndex).length
    const score = serverResult?.score ?? localScore
    const maxScore = serverResult?.maxScore ?? nqs.length
    const pct = Math.round((score / maxScore) * 100)
    const passed = serverResult?.passed ?? pct >= passingScore

    return (
      <div style={{ backgroundColor: "var(--bg-surface)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-default)" }}>
        {/* Results header */}
        <div
          className="flex flex-col items-center py-8 px-6"
          style={{ borderBottom: "1px solid var(--border-default)", backgroundColor: passed ? "#10B98108" : "#EF444408" }}
        >
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: passed ? "#10B98118" : "#EF444418" }}
          >
            {passed
              ? <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
              : <HelpCircle size={32} style={{ color: "var(--danger)" }} />
            }
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{passed ? "Quiz Passed!" : "Quiz Complete"}</h2>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            You scored <span className="font-bold" style={{ color: passed ? "var(--success)" : "var(--danger)" }}>{score}/{maxScore}</span>
          </p>
          <div className="w-48 h-2 rounded-full mt-4 overflow-hidden" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: passed ? "var(--success)" : "var(--danger)" }}
            />
          </div>
          <p className="text-3xl font-bold mt-2" style={{ color: passed ? "var(--success)" : "var(--danger)" }}>{pct}%</p>
          {!passed && (
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Passing score: {passingScore}%</p>
          )}
        </div>

        {/* Per-question breakdown */}
        <div className="px-6 py-4 space-y-2">
          {nqs.map((q, i) => {
            const correct = selected[i] === q.correctIndex
            return (
              <div key={q.id} className="flex items-start gap-3 py-2.5" style={{ borderBottom: i < nqs.length - 1 ? "1px solid var(--border-default)" : "none" }}>
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
                  {!correct && q.options[q.correctIndex] && (
                    <p className="text-xs mt-1" style={{ color: "var(--success)" }}>
                      Correct answer: {q.options[q.correctIndex]}
                    </p>
                  )}
                  {q.explanation && (
                    <p className="text-xs mt-0.5 italic" style={{ color: "var(--text-tertiary)" }}>{q.explanation}</p>
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
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
          >
            <RotateCcw size={14} /> Try Again
          </button>
          <button
            onClick={() => onComplete(passed)}
            className="flex items-center gap-2 px-5 py-2 rounded text-sm font-bold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <CheckCircle2 size={14} /> {passed ? "Continue" : "Mark Complete"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: "var(--bg-surface)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-default)" }}>
      {/* Progress bar */}
      <div className="h-1" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
        <div
          className="h-full transition-all"
          style={{ width: `${((current + 1) / nqs.length) * 100}%`, backgroundColor: "var(--accent)" }}
        />
      </div>

      <div className="p-7 space-y-6">
        {/* Question counter */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            Question {current + 1} of {nqs.length}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {nqs.filter((_, i) => selected[i] !== null).length} answered
          </span>
        </div>

        {/* Question */}
        <h2 className="text-base font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>{q.question}</h2>

        {/* Options */}
        {q.options.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-3.5 rounded" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
            <HelpCircle size={16} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Answer options not available for this question.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {q.options.map((opt, oi) => {
              const isSelected = selected[current] === oi
              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => choose(oi)}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-left transition-all"
                  style={{
                    backgroundColor: isSelected ? "var(--accent-subtle)" : "var(--bg-canvas)",
                    border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border-default)"}`,
                    borderRadius: 6,
                    color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full"
                    style={{
                      backgroundColor: isSelected ? "var(--accent)" : "var(--bg-surface-muted)",
                      color: isSelected ? "#fff" : "var(--text-tertiary)",
                    }}
                  >
                    {OPTION_LABELS[oi] ?? oi + 1}
                  </span>
                  <span className="text-sm">{opt}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-30"
            style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
          >
            <ChevronLeft size={15} /> Back
          </button>
          <button
            onClick={next}
            disabled={!answered}
            className="flex items-center gap-1.5 px-5 py-2 rounded text-sm font-bold text-white disabled:opacity-30 transition-all"
            style={{ backgroundColor: "var(--accent)" }}
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
  const mockCourse = COURSES.find((c) => c.id === id) ?? null
  const { markComplete, isComplete } = useProgress(id)
  const { isPurchased } = usePurchases()

  const [playing, setPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "qa">("overview")
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [showCertModal, setShowCertModal] = useState(false)
  const [copiedCred, setCopiedCred] = useState(false)

  // API course — fetched once per course ID; used for sections, lessons, and video URLs
  const [apiCourse, setApiCourse] = useState<ApiCourse | null>(null)
  // null = still checking; true/false = result known
  const [enrolledInCourse, setEnrolledInCourse] = useState<boolean | null>(null)
  const [courseCompleted, setCourseCompleted] = useState(false)

  // API quiz state — fetched when the current lesson is a quiz type
  const [apiQuiz, setApiQuiz] = useState<ApiQuiz | null>(null)
  const [apiQuizLoaded, setApiQuizLoaded] = useState(true)

  // Knowledge check state
  const [lessonKCResults, setLessonKCResults] = useState<Record<string, "passed" | "failed" | "skipped">>({})
  const [sectionKCDone, setSectionKCDone] = useState<Record<string, string[]>>({})
  const [sessionKCFlow, setSessionKCFlow] = useState<{
    sectionId: string
    partIndex: number
    phase: "taking" | "results"
    passedLessonIds: string[]
  } | null>(null)

  // Must be before any early return so the fetch always fires on every render cycle
  useEffect(() => {
    setApiCourse(null)
    setEnrolledInCourse(null)
    Promise.all([
      coursesApi.getById(id).catch(() => null),
      enrollmentsApi.getForCourse(id).catch(() => null),
    ]).then(([fetchedCourse, enrollment]) => {
      if (fetchedCourse) setApiCourse(fetchedCourse)
      setEnrolledInCourse(enrollment !== null)
      if (enrollment?.completedAt) setCourseCompleted(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Build effective sections — API data as primary source, merged with mock KC/quiz data
  const effectiveSections = apiCourse
    ? apiCourse.sections
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((s) => {
          const mockSec = mockCourse?.sections.find((ms) => ms.id === s.id)
          return {
            id: s.id,
            title: s.title,
            lessons: s.lessons
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((l) => {
                const mockL = mockSec?.lessons.find((ml) => ml.id === l.id)
                return {
                  id: l.id,
                  title: l.title,
                  type: apiLessonType(l.type),
                  duration: formatLessonDuration(l.durationSeconds),
                  completed: mockL?.completed ?? false,
                  locked: l.locked && !isPurchased(id),
                  videoId: mockL?.videoId,
                  questions: mockL?.questions,
                  lessonKC: mockL?.lessonKC,
                }
              }),
            sessionKC: mockSec?.sessionKC,
          }
        })
    : (mockCourse?.sections ?? [])

  const owned = enrolledInCourse === true || mockCourse?.progress !== undefined || isPurchased(id)
  const stillChecking = enrolledInCourse === null && !mockCourse && !isPurchased(id)

  const courseTitle = apiCourse?.title ?? mockCourse?.title ?? "Course"
  const coursePrice = mockCourse?.price ?? (apiCourse?.price === 0 ? ("Free" as const) : (apiCourse?.price ?? 0))

  // Derive all lesson data unconditionally (hooks must fire before any early return)
  const allLessonsRaw = effectiveSections.flatMap((s) =>
    s.lessons.map((l) => ({ ...l, sectionTitle: s.title, sectionId: s.id }))
  )
  const seenIds = new Set<string>()
  const allLessons = allLessonsRaw.filter((l) => {
    if (seenIds.has(l.id)) return false
    seenIds.add(l.id)
    return true
  })
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const currentLesson = allLessons[currentIndex] ?? allLessons[0] ?? null

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const isDone = (lId: string, staticDone: boolean) => staticDone || isComplete(lId)

  const completedCount = allLessons.filter((l) => isDone(l.id, l.completed)).length
  const totalLessons = allLessons.length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const currentDone = currentLesson ? isDone(currentLesson.id, currentLesson.completed) : false

  // Persist course-complete state as soon as all lessons are done locally
  if (progressPct === 100 && !courseCompleted && totalLessons > 0) setCourseCompleted(true)

  const sectionProgress = effectiveSections.map((sec) => {
    const lessons = sec.lessons
    const done = lessons.filter((l) => isDone(l.id, l.completed)).length
    return { ...sec, done, total: lessons.length, pct: Math.round((done / lessons.length) * 100) }
  })

  const currentSection = effectiveSections.find((s) => s.lessons.some((l) => l.id === currentLesson?.id))
  const lessonKCResult = currentLesson ? lessonKCResults[currentLesson.id] : undefined
  const showLessonKCGate = !!currentLesson?.lessonKC && lessonKCResult === undefined
  const skippableLessonIds = currentSection ? (sectionKCDone[currentSection.id] ?? []) : []

  const sectionId = currentSection?.id ?? ""
  const hasSessionKC = !!currentSection?.sessionKC
  const sessionKCUnseen = hasSessionKC && sectionKCDone[sectionId] === undefined && sessionKCFlow === null && !showLessonKCGate

  // Fetch API quiz only for quiz-type lessons.
  // List endpoints often omit the questions array — fall back to getById when that happens.
  useEffect(() => {
    if (!currentLesson || currentLesson.type !== "quiz") {
      setApiQuiz(null)
      setApiQuizLoaded(true)
      return
    }
    setApiQuiz(null)
    setApiQuizLoaded(false)

    async function resolveWithQuestions(q: ApiQuiz): Promise<ApiQuiz | null> {
      if (q.questions.length > 0) return q
      const full = await quizzesApi.getById(q.id).catch(() => null)
      return full && full.questions.length > 0 ? full : null
    }

    ;(async () => {
      try {
        // 1. Lesson-scoped endpoint
        const lessonQuizzes = await quizzesApi.getByLesson(currentLesson.id).catch(() => [] as ApiQuiz[])
        if (lessonQuizzes.length > 0) {
          const resolved = await resolveWithQuestions(lessonQuizzes[0])
          if (resolved) { setApiQuiz(resolved); return }
        }

        // 2. Course-scoped endpoint — only match by lessonId
        const courseQuizzes = await quizzesApi.getByCourse(id).catch(() => [] as ApiQuiz[])
        const candidate = courseQuizzes.find(q => q.lessonId === currentLesson.id) ?? null
        if (candidate) {
          const resolved = await resolveWithQuestions(candidate)
          if (resolved) { setApiQuiz(resolved); return }
        }

        // 3. Try sibling quiz-type lessons in the same section — handles quiz data saved
        //    under a different lesson ID than this one
        const sectionForLesson = effectiveSections.find(s => s.lessons.some(l => l.id === currentLesson.id))
        if (sectionForLesson) {
          const siblingQuizIds = sectionForLesson.lessons
            .filter(l => l.type === "quiz" && l.id !== currentLesson.id)
            .map(l => l.id)
          for (const siblingId of siblingQuizIds) {
            const siblingQuizzes = await quizzesApi.getByLesson(siblingId).catch(() => [] as ApiQuiz[])
            if (siblingQuizzes.length > 0) {
              const resolved = await resolveWithQuestions(siblingQuizzes[0])
              if (resolved) { setApiQuiz(resolved); return }
            }
          }
        }

        setApiQuiz(null)
      } catch {
        setApiQuiz(null)
      } finally {
        setApiQuizLoaded(true)
      }
    })()
  }, [currentLesson?.id, currentLesson?.type, id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-start session KC when entering a section with an unseen KC
  useEffect(() => {
    if (sessionKCUnseen) setSessionKCFlow({ sectionId, partIndex: 0, phase: "taking", passedLessonIds: [] })
  }, [sectionId, sessionKCUnseen]) // eslint-disable-line react-hooks/exhaustive-deps

  function buildApiAnswers(selected: (number | null)[], nqs: NormalizedQuestion[]): AnswerSubmission[] {
    return nqs.map((q, i) => ({ questionId: q.id, selectedIndex: selected[i] ?? undefined }))
  }

  async function handleQuizAnswersSubmitted(
    selected: (number | null)[],
    nqs: NormalizedQuestion[],
  ): Promise<{ score: number; maxScore: number; passed: boolean } | null> {
    if (!apiQuiz) return null
    try {
      const attempt = await quizzesApi.submit(apiQuiz.id, buildApiAnswers(selected, nqs))
      return { score: attempt.score, maxScore: attempt.maxScore, passed: attempt.passed }
    } catch {
      return null
    }
  }

  function finishSessionKC(passedIds: string[]) {
    setSectionKCDone(prev => ({ ...prev, [sectionId]: passedIds }))
    setSessionKCFlow(null)
  }

  // ── Early returns (all hooks above, nothing below) ──────────────────────────

  if (stillChecking) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "var(--bg-canvas)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    )
  }

  if (!owned) {
    return (
      <div className="flex h-screen items-center justify-center p-6" style={{ backgroundColor: "var(--bg-canvas)" }}>
        <div className="rounded-2xl p-8 text-center shadow-sm" style={{ maxWidth: 420, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {mockCourse && <CourseThumbnail course={mockCourse} heightClass="h-32 mb-5" roundedClass="rounded-xl" />}
          <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full" style={{ backgroundColor: "#3B82F620" }}>
            <Lock size={24} style={{ color: "#60A5FA" }} />
          </div>
          <h1 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Purchase this course to start watching</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}><strong style={{ color: "var(--text-primary)" }}>{courseTitle}</strong> isn&apos;t in your library yet. Buy it once and watch every lesson, anytime.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href={coursePrice === "Free" ? `/student/courses/${id}` : `/student/courses/${id}/checkout`}
              className="px-5 py-3 rounded-xl text-sm font-bold"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              {coursePrice === "Free" ? "Enroll for Free" : `Buy Now — $${coursePrice}`}
            </Link>
            <Link
              href={`/student/courses/${id}`}
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

  if (!currentLesson) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: "var(--bg-canvas)" }}>
        <div className="w-[280px] flex-shrink-0 animate-pulse space-y-4 p-5" style={{ backgroundColor: "var(--bg-surface)", borderRight: "1px solid var(--border-default)" }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-3 rounded" style={{ backgroundColor: "var(--border-default)", width: `${50 + (i % 4) * 12}%` }} />
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-canvas)" }}>

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
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#F59E0B20", color: "#F59E0B" }}>Mandatory</span>
                )}
              </div>
              {!kc.isMandatory && (
                <button onClick={() => finishSessionKC([])} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors" style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)" }}>
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
                        questions={part.questions.map(normalizeQuestion)}
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
                              : <X size={16} style={{ color: "var(--danger)", flexShrink: 0 }} />}
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

      {/* ── Certificate modal ── */}
      {showCertModal && (() => {
        const student = STUDENT_PROFILE
        const credentialId = `LF-${id.slice(0, 8).toUpperCase()}-${new Date().getFullYear()}`
        const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        const instructor = mockCourse?.instructor ?? "LearnFlow Instructor"

        return (
          <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "#0a0f1e" }}>

            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCertModal(false)}
                  className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  <ChevronLeft size={16} /> Back to course
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} style={{ color: "#60a5fa" }} />
                <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>Certificate of Completion</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(credentialId).catch(() => {}); setCopiedCred(true); setTimeout(() => setCopiedCred(false), 2000) }}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  {copiedCred ? <Check size={13} style={{ color: "#4ade80" }} /> : <Copy size={13} />}
                  {copiedCred ? "Copied!" : "Copy ID"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <Download size={13} /> Download
                </button>
              </div>
            </div>

            {/* Certificate stage */}
            <div className="flex-1 overflow-y-auto flex items-center justify-center p-8"
              style={{ background: "radial-gradient(ellipse at 50% 40%, #111827 0%, #0a0f1e 70%)" }}
            >
              {/* The certificate document */}
              <div
                className="relative w-full rounded-2xl overflow-hidden"
                style={{
                  maxWidth: 860,
                  backgroundColor: "#fff",
                  boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              >
                {/* Top accent bar */}
                <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)" }} />

                <div className="px-12 py-10">
                  {/* Header row: logo left, cert ID right */}
                  <div className="flex items-start justify-between mb-10">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
                        <GraduationCap size={20} color="#fff" />
                      </div>
                      <div>
                        <p className="text-lg font-black tracking-tight" style={{ color: "#0f172a" }}>LearnFlow</p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>Learning Management System</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>Credential ID</p>
                      <p className="text-sm font-mono font-bold" style={{ color: "#1e40af" }}>{credentialId}</p>
                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Issued {today}</p>
                    </div>
                  </div>

                  {/* Horizontal divider with embellishment */}
                  <div className="flex items-center gap-4 mb-10">
                    <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #e2e8f0)" }} />
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Certificate of Completion</p>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                    </div>
                    <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #e2e8f0, transparent)" }} />
                  </div>

                  {/* Main content */}
                  <div className="text-center mb-10">
                    <p className="text-sm mb-3" style={{ color: "#64748b" }}>This certifies that</p>
                    <h2 className="text-5xl font-black mb-4" style={{ color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                      {student.name}
                    </h2>
                    <p className="text-base mb-6" style={{ color: "#475569" }}>
                      has successfully completed the course
                    </p>
                    <div className="inline-block px-8 py-4 rounded-2xl mb-6" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe" }}>
                      <h3 className="text-2xl font-black leading-tight" style={{ color: "#1e40af" }}>
                        {courseTitle}
                      </h3>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-sm" style={{ color: "#64748b" }}>Instructed by</p>
                      <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{instructor}</p>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="flex items-end justify-between pt-8" style={{ borderTop: "1px dashed #e2e8f0" }}>
                    {/* Lessons stat */}
                    <div className="text-center">
                      <p className="text-3xl font-black" style={{ color: "#1e40af" }}>{totalLessons}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: "#94a3b8" }}>Lessons completed</p>
                    </div>

                    {/* Seal */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center w-20 h-20 rounded-full"
                        style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", boxShadow: "0 4px 24px rgba(59,130,246,0.4)" }}
                      >
                        <Award size={32} color="#fff" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3b82f6" }}>Verified</p>
                    </div>

                    {/* Signature */}
                    <div className="text-center">
                      <div className="h-8 mb-1 flex items-end justify-center">
                        <p className="text-xl italic font-semibold" style={{ color: "#cbd5e1", fontFamily: "Georgia, serif" }}>LearnFlow</p>
                      </div>
                      <div className="h-px w-32" style={{ backgroundColor: "#e2e8f0" }} />
                      <p className="text-xs mt-1.5" style={{ color: "#94a3b8" }}>Authorized Signature</p>
                    </div>
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)" }} />
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-center gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <Link
                href={`/student/certificates?course=${id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#3b82f6", color: "#fff" }}
                onClick={() => setShowCertModal(false)}
              >
                <Award size={15} /> View All My Certificates
              </Link>
            </div>
          </div>
        )
      })()}

      {/* ── Top header bar (Udemy style) ── */}
      <header
        className="flex items-center justify-between flex-shrink-0 gap-2 px-4"
        style={{ height: 60, backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)", zIndex: 10 }}
      >
        {/* Left: back arrow + course title + progress */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href={`/student/courses/${id}`}
            className="flex-shrink-0 p-1.5 rounded transition-opacity hover:opacity-70"
            style={{ color: "var(--text-primary)" }}
            title="Back to course"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="w-px h-5 flex-shrink-0" style={{ backgroundColor: "var(--bg-surface-muted)" }} />
          <span className="text-sm font-bold truncate hidden sm:block" style={{ color: "var(--text-primary)", maxWidth: 280 }}>
            {courseTitle}
          </span>
          <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
            <div className="w-28 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: "var(--accent)" }} />
            </div>
            <span className="text-xs whitespace-nowrap font-medium" style={{ color: "var(--text-tertiary)" }}>{progressPct}% complete</span>
          </div>
        </div>

        {/* Right: prev / next / mark complete / tools */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Prev */}
          {prevLesson ? (
            <Link href={`/student/courses/${id}/learn/${prevLesson.id}`}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors hover:bg-white/10"
              style={{ color: "var(--text-secondary)" }} title={prevLesson.title}
            ><ChevronLeft size={16} /> Previous</Link>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1.5 text-sm cursor-not-allowed" style={{ color: "var(--text-muted)" }}>
              <ChevronLeft size={16} /> Previous
            </span>
          )}
          {/* Next */}
          {nextLesson && !nextLesson.locked ? (
            <Link href={`/student/courses/${id}/learn/${nextLesson.id}`}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors hover:bg-white/10"
              style={{ color: "var(--text-secondary)" }} title={nextLesson.title}
            >Next <ChevronRight size={16} /></Link>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1.5 text-sm cursor-not-allowed" style={{ color: "var(--text-muted)" }}>
              Next <ChevronRight size={16} />
            </span>
          )}

          <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--bg-surface-muted)" }} />

          {/* Mark complete — Udemy style bordered/filled toggle */}
          <button
            onClick={() => { markComplete(currentLesson.id, !currentDone) }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded transition-all"
            style={currentDone
              ? { backgroundColor: "var(--accent)", color: "#fff", border: "1px solid var(--accent)" }
              : { backgroundColor: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }
            }
          >
            <CheckCircle2 size={13} />{currentDone ? "Completed" : "Mark complete"}
          </button>

          <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--bg-surface-muted)" }} />

          {/* Tools */}
          <button
            onClick={() => setActiveTab(t => t === "notes" ? "overview" : "notes")}
            className="p-1.5 rounded transition-colors hover:bg-white/10"
            style={{ color: activeTab === "notes" ? "var(--accent)" : "var(--text-tertiary)" }} title="Notes"
          ><PenLine size={17} /></button>
          <button className="p-1.5 rounded transition-colors hover:bg-white/10" style={{ color: "var(--text-tertiary)" }} title="Bookmark"><BookmarkPlus size={17} /></button>
          <button className="p-1.5 rounded transition-colors hover:bg-white/10" style={{ color: "var(--text-tertiary)" }} title="Share"><Share2 size={17} /></button>
        </div>
      </header>

      {/* ── Main row: left panel + right sidebar ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel: content + tabs ── */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ minWidth: 0, backgroundColor: "var(--bg-canvas)" }}>

          {/* Content area (video / quiz / document / KC gate) */}
          <div className="flex-shrink-0 overflow-y-auto" style={{ backgroundColor: "#000", maxHeight: "calc(100vh - 160px)" }}>

            {/* Lesson KC Gate */}
            {showLessonKCGate && currentLesson?.lessonKC && (
              <div style={{ backgroundColor: "var(--bg-canvas)", padding: "32px 24px" }}>
                <div className="max-w-2xl mx-auto rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid #8B5CF640" }}>
                  <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border-default)", backgroundColor: "#8B5CF608" }}>
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
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded flex-shrink-0"
                        style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)" }}
                      ><X size={12} /> Skip Check</button>
                    )}
                  </div>
                  <div className="p-6">
                    <QuizPlayer
                      questions={currentLesson.lessonKC.questions.map(normalizeQuestion)}
                      passingScore={currentLesson.lessonKC.passingScore}
                      onComplete={(passed) => setLessonKCResults(prev => ({ ...prev, [currentLesson.id]: passed ? "passed" : "failed" }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Video / Quiz / Document */}
            {!showLessonKCGate && (() => {
              const apiLesson = apiCourse?.sections.flatMap((s) => s.lessons).find((l) => l.id === lessonId) ?? null

              if (!apiQuizLoaded) {
                return (
                  <div className="flex items-center justify-center" style={{ aspectRatio: "16/9", backgroundColor: "#000" }}>
                    <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
                  </div>
                )
              }

              if (apiQuiz && apiQuiz.questions.length > 0) {
                const quizNqs = apiQuiz.questions.map(normalizeApiQuestion)
                return (
                  <div style={{ backgroundColor: "var(--bg-canvas)", padding: "32px 24px" }}>
                    <div className="max-w-2xl mx-auto">
                      <QuizPlayer
                        key={apiQuiz.id}
                        questions={quizNqs}
                        randomize={apiQuiz.randomizeQuestions}
                        questionsPerAttempt={
                          apiQuiz.randomizeQuestions && apiQuiz.maxAttempts && apiQuiz.maxAttempts < quizNqs.length
                            ? apiQuiz.maxAttempts
                            : undefined
                        }
                        onComplete={() => { markComplete(currentLesson.id, true) }}
                        onAnswersSubmitted={(sel, nqs) => handleQuizAnswersSubmitted(sel, nqs)}
                        passingScore={apiQuiz.passingScore ?? 70}
                      />
                    </div>
                  </div>
                )
              }

              if (currentLesson.type === "quiz") {
                const quizNqs: NormalizedQuestion[] = currentLesson.questions?.map(normalizeQuestion) ?? []
                if (quizNqs.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 260, backgroundColor: "var(--bg-canvas)", padding: "40px 24px" }}>
                      <HelpCircle size={36} style={{ color: "var(--text-muted)" }} />
                      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No questions available for this quiz yet.</p>
                    </div>
                  )
                }
                return (
                  <div style={{ backgroundColor: "var(--bg-canvas)", padding: "32px 24px" }}>
                    <div className="max-w-2xl mx-auto">
                      <QuizPlayer
                        key={currentLesson.id}
                        questions={quizNqs}
                        onComplete={() => { markComplete(currentLesson.id, true) }}
                        onAnswersSubmitted={(sel, nqs) => handleQuizAnswersSubmitted(sel, nqs)}
                        passingScore={70}
                      />
                    </div>
                  </div>
                )
              }

              if (currentLesson.type === "reading") {
                const resourceUrl = apiLesson?.resourceUrl ?? null
                const content = apiLesson?.content ?? null
                return (
                  <div className="flex flex-col items-center gap-6 text-center" style={{ backgroundColor: "var(--bg-canvas)", padding: "48px 24px", minHeight: 260 }}>
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl" style={{ backgroundColor: "#10B98118" }}>
                      <FileText size={28} style={{ color: "var(--success)" }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{currentLesson.title}</h3>
                      {content && <p className="text-sm leading-relaxed max-w-lg" style={{ color: "var(--text-tertiary)" }}>{content}</p>}
                    </div>
                    {resourceUrl ? (
                      <a href={resourceUrl} download target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-bold"
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                        onClick={() => { if (!currentDone) { markComplete(currentLesson.id, true) } }}
                      ><Download size={16} /> Download Document</a>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-5 py-3 rounded text-sm" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-tertiary)", border: "1px solid var(--border-default)" }}>
                        <FileText size={16} /> Document not available yet
                      </div>
                    )}
                  </div>
                )
              }

              // Video — edge-to-edge black box, no border/radius (Udemy style)
              const directUrl = apiLesson?.videoUrl ?? null
              const ytMatch = directUrl?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
              const ytId = ytMatch?.[1] ?? currentLesson?.videoId ?? null

              return (
                <div style={{ backgroundColor: "#000", aspectRatio: "16/9", position: "relative", maxHeight: "calc(100vh - 120px)", width: "100%" }}>
                  {directUrl && !ytMatch ? (
                    <video key={directUrl} controls preload="metadata" className="absolute inset-0 w-full h-full"
                      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
                      onEnded={() => { setPlaying(false); if (!currentDone) { markComplete(currentLesson.id, true) } }}
                    >
                      <source src={directUrl} type="video/mp4" />
                      <source src={directUrl} type="video/webm" />
                    </video>
                  ) : ytId ? (
                    <iframe key={ytId + currentLesson.id}
                      src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                      title={currentLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen className="absolute inset-0 w-full h-full" style={{ border: "none" }}
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                        <button
                          className="flex items-center justify-center w-20 h-20 rounded-full transition-transform hover:scale-105"
                          style={{ backgroundColor: "#fff" }}
                          onClick={() => setPlaying(!playing)}
                        >
                          {playing
                            ? <Pause size={30} fill="#1c1d1f" color="#1c1d1f" />
                            : <Play size={30} fill="#1c1d1f" color="#1c1d1f" className="ml-1" />}
                        </button>
                        <p className="text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>{currentLesson.title}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 px-5 py-3 flex items-center gap-3" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>
                        <button onClick={() => setPlaying(!playing)}>
                          {playing ? <Pause size={18} fill="#fff" color="#fff" /> : <Play size={18} fill="#fff" color="#fff" />}
                        </button>
                        <button><SkipForward size={17} color="var(--text-secondary)" /></button>
                        <div className="flex-1 h-1 rounded-full cursor-pointer" style={{ backgroundColor: "var(--text-muted)" }}>
                          <div className="h-full rounded-full" style={{ width: playing ? "34%" : "0%", backgroundColor: "var(--accent)", transition: "width 0.5s" }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{currentLesson.duration ?? ""}</span>
                        <button><Volume2 size={17} color="var(--text-secondary)" /></button>
                        <button><Maximize2 size={17} color="var(--text-secondary)" /></button>
                      </div>
                    </>
                  )}
                </div>
              )
            })()}
          </div>

          {/* ── Tabs + content ── */}
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--bg-canvas)" }}>

            {/* Passed KC banner */}
            {lessonKCResult === "passed" && nextLesson && (
              <div className="flex items-center gap-3 px-5 py-3 flex-wrap" style={{ backgroundColor: "#10B98112", borderBottom: "1px solid #10B98130" }}>
                <CheckCircle2 size={15} style={{ color: "var(--success)", flexShrink: 0 }} />
                <p className="flex-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>You already know this — the lesson is optional.</p>
                <Link href={`/student/courses/${id}/learn/${nextLesson.id}`}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold text-white flex-shrink-0"
                  style={{ backgroundColor: "var(--success)" }}
                >Skip Lesson <SkipForward size={13} /></Link>
              </div>
            )}

            {/* Tab bar — Udemy style */}
            <div className="flex flex-shrink-0" style={{ borderBottom: "1px solid var(--border-default)" }}>
              {(["overview", "notes", "qa"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-5 py-3.5 text-sm font-medium transition-colors"
                  style={{
                    color: activeTab === tab ? "var(--text-primary)" : "var(--text-tertiary)",
                    borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                    backgroundColor: "transparent",
                  }}
                >
                  {tab === "qa" ? "Q&A" : tab === "notes" ? "Notes" : "Overview"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ maxWidth: 768, margin: "0 auto", padding: "28px 24px" }} className="space-y-6">

              {activeTab === "overview" && (
                <>
                  {/* Lesson title + meta */}
                  <div style={{ borderBottom: "1px solid var(--border-default)", paddingBottom: 20 }}>
                    <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{currentLesson?.title}</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-tertiary)" }}>
                        {lessonTypeIcon(currentLesson?.type ?? "video", 14)}
                        <span className="capitalize">{currentLesson?.type}</span>
                      </div>
                      {currentLesson?.duration && (
                        <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>· {currentLesson.duration}</span>
                      )}
                      {(currentLesson as { sectionTitle?: string })?.sectionTitle && (
                        <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>· {(currentLesson as { sectionTitle?: string }).sectionTitle}</span>
                      )}
                      {currentDone && (
                        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#10B98118", color: "var(--success)" }}>
                          <CheckCircle2 size={11} /> Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lesson content/notes */}
                  {(() => {
                    const apiLesson = apiCourse?.sections.flatMap((s) => s.lessons).find((l) => l.id === lessonId)
                    if (!apiLesson?.content) return null
                    return (
                      <div>
                        <h3 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>About this lesson</h3>
                        <div className="text-sm leading-7 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{apiLesson.content}</div>
                      </div>
                    )
                  })()}

                  {/* Instructor row */}
                  {(mockCourse?.instructor || apiCourse) && (
                    <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 20 }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Instructor</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{mockCourse?.instructor ?? "Instructor"}</p>
                    </div>
                  )}

                  {/* Prev / Next navigation */}
                  <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border-default)" }}>
                    <div>
                      {prevLesson ? (
                        <Link href={`/student/courses/${id}/learn/${prevLesson.id}`}
                          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded"
                          style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
                        >
                          <ChevronLeft size={16} />
                          <span><p className="text-xs" style={{ color: "var(--text-muted)" }}>Previous</p><p className="truncate max-w-[160px]">{prevLesson.title}</p></span>
                        </Link>
                      ) : <div />}
                    </div>
                    <div>
                      {nextLesson && !nextLesson.locked ? (
                        <Link href={`/student/courses/${id}/learn/${nextLesson.id}`}
                          className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded"
                          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                        >
                          <span className="text-right"><p className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.75)" }}>Next</p><p className="truncate max-w-[160px]">{nextLesson.title}</p></span>
                          <ChevronRight size={16} />
                        </Link>
                      ) : nextLesson?.locked ? (
                        <div className="flex items-center gap-2 text-sm px-4 py-2.5 rounded" style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                          <span className="text-right"><p className="text-xs">Next</p><p className="truncate max-w-[160px]">{nextLesson.title}</p></span>
                          <Lock size={14} />
                        </div>
                      ) : currentDone ? (
                        <Link href={`/student/courses/${id}`}
                          className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded"
                          style={{ backgroundColor: "var(--success)", color: "#fff" }}
                        ><CheckCircle2 size={15} /> Course Complete!</Link>
                      ) : <div />}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "notes" && currentLesson && (
                <LessonNotes key={currentLesson.id} lessonId={currentLesson.id} />
              )}

              {activeTab === "qa" && currentLesson && (
                <LessonQA key={currentLesson.id} lessonId={currentLesson.id} courseId={id} />
              )}

            </div>
          </div>
        </div>

        {/* ── Right sidebar: Course content (Udemy style) ── */}
        <aside
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: 420, borderLeft: "1px solid var(--border-default)", backgroundColor: "var(--bg-canvas)" }}
        >
          {/* Sidebar header */}
          <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)" }}>
            <h2 className="text-base font-bold mb-2.5" style={{ color: "var(--text-primary)" }}>Course content</h2>
            <div className="flex justify-between text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>
              <span>{completedCount}/{totalLessons} completed</span>
              <span style={{ color: progressPct === 100 ? "var(--success)" : "var(--text-secondary)", fontWeight: 600 }}>{progressPct}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? "var(--success)" : "var(--accent)" }} />
            </div>
          </div>

          {/* Sections + lessons */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border-default) transparent" }}>
            {effectiveSections.length === 0 && (
              <div className="px-5 py-5 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: "var(--bg-surface-muted)" }} />
                    <div className="h-2.5 rounded" style={{ backgroundColor: "var(--bg-surface-muted)", width: `${60 + (i % 3) * 15}%` }} />
                  </div>
                ))}
              </div>
            )}
            {effectiveSections.map((section, si) => {
              const sp = sectionProgress[si]
              const isCollapsed = collapsedSections.has(section.id)
              return (
                <div key={`${si}-${section.id}`} style={{ borderBottom: "1px solid var(--border-default)" }}>
                  {/* Collapsible section header — Udemy style */}
                  <button
                    className="w-full flex items-start gap-2.5 px-5 py-4 text-left"
                    style={{ backgroundColor: "var(--bg-surface)" }}
                    onClick={() => setCollapsedSections(prev => {
                      const next = new Set(prev)
                      if (next.has(section.id)) next.delete(section.id); else next.add(section.id)
                      return next
                    })}
                  >
                    <ChevronDown
                      size={15}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "var(--text-tertiary)", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug" style={{ color: "var(--text-primary)" }}>{section.title}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                        {sp.done}/{sp.total} | {sp.done === sp.total ? "Complete" : `${sp.total - sp.done} remaining`}
                      </p>
                    </div>
                  </button>

                  {/* Lesson rows — Udemy style: icon + title flex-1 + duration right */}
                  {!isCollapsed && section.lessons.map((lesson, li) => {
                    const active = lesson.id === currentLesson.id
                    const done = isDone(lesson.id, lesson.completed)
                    return (
                      <Link
                        key={`${section.id}-${li}-${lesson.id}`}
                        href={lesson.locked ? "#" : `/student/courses/${id}/learn/${lesson.id}`}
                        className="flex items-center gap-3 px-5 py-3 group"
                        style={{
                          backgroundColor: active ? "var(--bg-surface-muted)" : "transparent",
                          cursor: lesson.locked ? "not-allowed" : "pointer",
                          borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => { if (!active && !lesson.locked) e.currentTarget.style.backgroundColor = "var(--bg-surface-muted)" }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = active ? "var(--bg-surface-muted)" : "transparent" }}
                      >
                        {/* Clickable checkbox — lets students mark any lesson complete */}
                        {lesson.locked ? (
                          <Lock size={14} className="flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                        ) : (
                          <button
                            title={done ? "Mark incomplete" : "Mark complete"}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              markComplete(lesson.id, !done)
                            }}
                            className="flex-shrink-0 flex items-center justify-center rounded transition-all hover:scale-110"
                            style={{ width: 20, height: 20, border: done ? "none" : "2px solid var(--border-default)", borderRadius: 3, backgroundColor: done ? "transparent" : "transparent" }}
                          >
                            {done && <CheckCircle2 size={18} style={{ color: "var(--success)" }} />}
                          </button>
                        )}

                        {/* Title + type indicator */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug truncate" style={{
                            color: active ? "var(--text-primary)" : lesson.locked ? "var(--text-muted)" : "var(--text-secondary)",
                            fontWeight: active ? 700 : 400,
                          }}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {lessonTypeIcon(lesson.type, 11)}
                            {skippableLessonIds.includes(lesson.id) && (
                              <span className="text-[9px] font-bold px-1.5 py-px rounded-full" style={{ backgroundColor: "#8B5CF620", color: "#A78BFA" }}>SKIP</span>
                            )}
                            {lesson.lessonKC && !lessonKCResults[lesson.id] && (
                              <BrainCircuit size={10} style={{ color: "#8B5CF6" }} />
                            )}
                          </div>
                        </div>

                        {/* Duration — right aligned */}
                        {lesson.duration && (
                          <span className="flex-shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>{lesson.duration}</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Certificate CTA — visible once all lessons complete or course previously completed */}
          {(progressPct === 100 || courseCompleted) && (
            <div className="flex-shrink-0 p-4" style={{ borderTop: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)" }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={15} style={{ color: "var(--success)" }} />
                <span className="text-xs font-bold" style={{ color: "var(--success)" }}>Course Complete!</span>
              </div>
              <button
                onClick={() => setShowCertModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                <Award size={15} /> Get Your Certificate
              </button>
            </div>
          )}
        </aside>

      </div>{/* end main row */}
    </div>
  )
}
