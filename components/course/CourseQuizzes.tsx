"use client"

import { useState, useEffect } from "react"
import type { Quiz } from "@/lib/data/courses"
import {
  Brain, Clock, Star, Lock,
  ChevronRight, X, ArrowRight, Flag, Square, CheckSquare, Circle,
} from "lucide-react"

type Tab = "all" | "available" | "completed" | "locked"
type AnswerValue = number | number[] | boolean | string

const statusConfig: Record<Quiz["status"], { label: string; color: string }> = {
  available: { label: "Available", color: "#10B981" },
  "in-progress": { label: "In Progress", color: "#3B82F6" },
  completed: { label: "Completed", color: "#8B5CF6" },
  locked: { label: "Locked", color: "#475569" },
}

function isAnswered(value: AnswerValue | undefined): boolean {
  if (value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === "string") return value.trim().length > 0
  return true
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function CourseQuizzes({ quizzes }: { quizzes: Quiz[] }) {
  const [tab, setTab] = useState<Tab>("all")
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  // Countdown timer — auto-submits when time runs out
  useEffect(() => {
    if (!activeQuiz || submitted || secondsLeft === null || secondsLeft <= 0) return
    const timer = setTimeout(() => {
      setSecondsLeft((s) => {
        if (s === null) return null
        if (s <= 1) {
          setSubmitted(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [activeQuiz, submitted, secondsLeft])

  if (quizzes.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
        <Brain size={36} className="mx-auto mb-3" style={{ color: "#334155" }} />
        <p className="text-sm" style={{ color: "#475569" }}>No quizzes or exams for this course yet.</p>
      </div>
    )
  }

  const filtered = quizzes.filter((q) => {
    if (tab === "all") return true
    return q.status === tab
  })

  const counts = {
    all: quizzes.length,
    available: quizzes.filter((q) => q.status === "available").length,
    completed: quizzes.filter((q) => q.status === "completed").length,
    locked: quizzes.filter((q) => q.status === "locked").length,
  }

  const avgScore = quizzes.filter((q) => q.bestScore !== undefined)
    .reduce((s, q, _, arr) => s + q.bestScore! / arr.length, 0)

  const handleStartQuiz = (quiz: Quiz) => {
    if (quiz.status === "locked" || quiz.questions.length === 0) return
    setActiveQuiz(quiz)
    setCurrentQ(0)
    setAnswers({})
    setFlagged(new Set())
    setSubmitted(false)
    setSecondsLeft(quiz.timeLimit * 60)
  }

  const handleSelectMCQ = (qId: string, idx: number) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qId]: idx }))
  }

  const handleSelectTrueFalse = (qId: string, value: boolean) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  const handleToggleMultiSelect = (qId: string, idx: number) => {
    if (submitted) return
    setAnswers((prev) => {
      const current = Array.isArray(prev[qId]) ? (prev[qId] as number[]) : []
      const next = current.includes(idx) ? current.filter((i) => i !== idx) : [...current, idx]
      return { ...prev, [qId]: next }
    })
  }

  const handleShortAnswerChange = (qId: string, value: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(qId)) next.delete(qId)
      else next.add(qId)
      return next
    })
  }

  const handleSubmit = () => setSubmitted(true)

  const isQuestionCorrect = (q: Quiz["questions"][number]): boolean => {
    const value = answers[q.id]
    if (q.type === "true-false") return value === q.correctAnswer
    if (q.type === "multi-select") {
      const selected = Array.isArray(value) ? [...value].sort() : []
      const expected = [...q.correctIndexes].sort()
      return selected.length === expected.length && selected.every((v, i) => v === expected[i])
    }
    if (q.type === "short-answer") {
      const text = typeof value === "string" ? value.trim().toLowerCase() : ""
      return q.acceptedAnswers.some((a: string) => a.trim().toLowerCase() === text)
    }
    return value === q.correctIndex
  }

  const calcScore = () => {
    if (!activeQuiz) return 0
    const correct = activeQuiz.questions.filter(isQuestionCorrect).length
    return Math.round((correct / activeQuiz.questions.length) * 100)
  }

  // ── Quiz Taking UI ──
  if (activeQuiz) {
    const question = activeQuiz.questions[currentQ]
    const score = submitted ? calcScore() : 0
    const passed = score >= activeQuiz.passingScore

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Quiz header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{activeQuiz.title}</h2>
            <p className="text-sm" style={{ color: "#64748B" }}>{activeQuiz.description}</p>
          </div>
          <button
            onClick={() => setActiveQuiz(null)}
            className="p-2 rounded-lg"
            style={{ backgroundColor: "#1E293B", color: "#94A3B8" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        {submitted ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#1E293B", border: `1px solid ${passed ? "#10B98140" : "#EF444440"}` }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4"
              style={{ backgroundColor: passed ? "#10B98120" : "#EF444420", color: passed ? "#10B981" : "#EF4444" }}
            >
              {score}%
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{passed ? "Passed! 🎉" : "Not Passed"}</h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
              {passed ? "Great work! You've passed this quiz." : `You need ${activeQuiz.passingScore}% to pass. Try again!`}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#334155", color: "#94A3B8" }}
              >
                Back to Quizzes
              </button>
              {!passed && (
                <button
                  onClick={() => { setAnswers({}); setFlagged(new Set()); setSubmitted(false); setCurrentQ(0); setSecondsLeft(activeQuiz.timeLimit * 60) }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                >
                  Try Again
                </button>
              )}
            </div>

            {/* Answer review */}
            <div className="mt-6 text-left space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#475569" }}>Answer Review</p>
              {activeQuiz.questions.map((q, i) => {
                const correct = isQuestionCorrect(q)
                const userAnswer = answers[q.id]
                return (
                  <div key={q.id} className="rounded-xl p-4" style={{ backgroundColor: "#0F172A", border: `1px solid ${correct ? "#10B98130" : "#EF444430"}` }}>
                    <p className="text-sm font-medium text-white mb-2">Q{i + 1}. {q.question}</p>
                    <div className="space-y-1.5">
                      {!q.type && q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correctIndex
                        const isUser = idx === userAnswer
                        return (
                          <div
                            key={idx}
                            className="px-3 py-2 rounded-lg text-xs"
                            style={{
                              backgroundColor: isCorrect ? "#10B98115" : isUser && !correct ? "#EF444415" : "#1E293B",
                              color: isCorrect ? "#10B981" : isUser && !correct ? "#EF4444" : "#94A3B8",
                              border: `1px solid ${isCorrect ? "#10B98130" : isUser && !correct ? "#EF444430" : "#334155"}`,
                            }}
                          >
                            {isCorrect && "✓ "}{isUser && !correct && "✗ "}{opt}
                          </div>
                        )
                      })}

                      {q.type === "multi-select" && q.options.map((opt, idx) => {
                        const isCorrect = q.correctIndexes.includes(idx)
                        const isUser = Array.isArray(userAnswer) && userAnswer.includes(idx)
                        const wrongPick = isUser && !isCorrect
                        return (
                          <div
                            key={idx}
                            className="px-3 py-2 rounded-lg text-xs"
                            style={{
                              backgroundColor: isCorrect ? "#10B98115" : wrongPick ? "#EF444415" : "#1E293B",
                              color: isCorrect ? "#10B981" : wrongPick ? "#EF4444" : "#94A3B8",
                              border: `1px solid ${isCorrect ? "#10B98130" : wrongPick ? "#EF444430" : "#334155"}`,
                            }}
                          >
                            {isCorrect && "✓ "}{wrongPick && "✗ "}{opt}
                          </div>
                        )
                      })}

                      {q.type === "true-false" && (
                        <div className="flex gap-2">
                          {[true, false].map((val) => {
                            const isCorrect = val === q.correctAnswer
                            const isUser = val === userAnswer
                            return (
                              <div
                                key={String(val)}
                                className="flex-1 px-3 py-2 rounded-lg text-xs text-center"
                                style={{
                                  backgroundColor: isCorrect ? "#10B98115" : isUser && !correct ? "#EF444415" : "#1E293B",
                                  color: isCorrect ? "#10B981" : isUser && !correct ? "#EF4444" : "#94A3B8",
                                  border: `1px solid ${isCorrect ? "#10B98130" : isUser && !correct ? "#EF444430" : "#334155"}`,
                                }}
                              >
                                {isCorrect && "✓ "}{isUser && !correct && "✗ "}{val ? "True" : "False"}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {q.type === "short-answer" && (
                        <div className="space-y-1.5">
                          <div
                            className="px-3 py-2 rounded-lg text-xs"
                            style={{
                              backgroundColor: correct ? "#10B98115" : "#EF444415",
                              color: correct ? "#10B981" : "#EF4444",
                              border: `1px solid ${correct ? "#10B98130" : "#EF444430"}`,
                            }}
                          >
                            Your answer: {typeof userAnswer === "string" && userAnswer.trim() ? userAnswer : "(blank)"}
                          </div>
                          {!correct && (
                            <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#10B98115", color: "#10B981", border: "1px solid #10B98130" }}>
                              Accepted: {q.acceptedAnswers.join(" / ")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {q.explanation && (
                      <p className="text-xs mt-2.5 leading-relaxed" style={{ color: "#64748B" }}>
                        <strong style={{ color: "#94A3B8" }}>Explanation: </strong>{q.explanation}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <div className="flex items-center justify-between mb-2 text-xs" style={{ color: "#64748B" }}>
                <span>Question {currentQ + 1} of {activeQuiz.questions.length}</span>
                <span className="flex items-center gap-1 font-semibold" style={{ color: secondsLeft !== null && secondsLeft <= 60 ? "#EF4444" : "#64748B" }}>
                  <Clock size={11} /> {secondsLeft !== null ? formatTime(secondsLeft) : `${activeQuiz.timeLimit}:00`} left
                </span>
              </div>
              <div className="h-1.5 rounded-full mb-3" style={{ backgroundColor: "#334155" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${((currentQ + 1) / activeQuiz.questions.length) * 100}%`,
                    backgroundColor: "#3B82F6",
                  }}
                />
              </div>

              {/* Question navigator palette */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeQuiz.questions.map((q, i) => {
                  const answeredQ = isAnswered(answers[q.id])
                  const isCurrent = i === currentQ
                  const isFlagged = flagged.has(q.id)
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQ(i)}
                      className="relative flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-colors"
                      style={{
                        backgroundColor: isCurrent ? "#3B82F6" : answeredQ ? "#10B98120" : "#0F172A",
                        color: isCurrent ? "#fff" : answeredQ ? "#10B981" : "#64748B",
                        border: `1px solid ${isCurrent ? "#3B82F6" : answeredQ ? "#10B98130" : "#334155"}`,
                      }}
                    >
                      {i + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F59E0B" }}>
                          <Flag size={7} fill="#0F172A" style={{ color: "#0F172A" }} />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Question */}
            {question && (
              <div
                className="rounded-2xl p-6"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <h2 className="text-base font-semibold text-white flex-1">{question.question}</h2>
                  <button
                    onClick={() => toggleFlag(question.id)}
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0"
                    style={{
                      backgroundColor: flagged.has(question.id) ? "#F59E0B20" : "#334155",
                      color: flagged.has(question.id) ? "#F59E0B" : "#64748B",
                    }}
                  >
                    <Flag size={12} fill={flagged.has(question.id) ? "#F59E0B" : "none"} />
                    {flagged.has(question.id) ? "Flagged" : "Flag"}
                  </button>
                </div>

                {/* MCQ */}
                {!question.type && (
                  <div className="space-y-3">
                    {question.options.map((opt, idx) => {
                      const selected = answers[question.id] === idx
                      return (
                        <button
                          key={idx}
                          className="w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all"
                          style={{
                            backgroundColor: selected ? "#3B82F620" : "#0F172A",
                            border: `1px solid ${selected ? "#3B82F6" : "#334155"}`,
                            color: selected ? "#60A5FA" : "#CBD5E1",
                          }}
                          onClick={() => handleSelectMCQ(question.id, idx)}
                        >
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3"
                            style={{
                              backgroundColor: selected ? "#3B82F6" : "#334155",
                              color: selected ? "#fff" : "#94A3B8",
                            }}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Multi-select */}
                {question.type === "multi-select" && (
                  <div className="space-y-3">
                    <p className="text-xs -mt-2 mb-1" style={{ color: "#64748B" }}>Select all that apply</p>
                    {question.options.map((opt, idx) => {
                      const current = answers[question.id]
                      const selected = Array.isArray(current) && current.includes(idx)
                      return (
                        <button
                          key={idx}
                          className="w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all flex items-center gap-3"
                          style={{
                            backgroundColor: selected ? "#3B82F620" : "#0F172A",
                            border: `1px solid ${selected ? "#3B82F6" : "#334155"}`,
                            color: selected ? "#60A5FA" : "#CBD5E1",
                          }}
                          onClick={() => handleToggleMultiSelect(question.id, idx)}
                        >
                          {selected ? (
                            <CheckSquare size={18} style={{ color: "#3B82F6", flexShrink: 0 }} />
                          ) : (
                            <Square size={18} style={{ color: "#475569", flexShrink: 0 }} />
                          )}
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* True / False */}
                {question.type === "true-false" && (
                  <div className="grid grid-cols-2 gap-3">
                    {[true, false].map((val) => {
                      const selected = answers[question.id] === val
                      return (
                        <button
                          key={String(val)}
                          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            backgroundColor: selected ? "#3B82F620" : "#0F172A",
                            border: `1px solid ${selected ? "#3B82F6" : "#334155"}`,
                            color: selected ? "#60A5FA" : "#CBD5E1",
                          }}
                          onClick={() => handleSelectTrueFalse(question.id, val)}
                        >
                          <Circle size={14} fill={selected ? "#3B82F6" : "none"} style={{ color: selected ? "#3B82F6" : "#475569" }} />
                          {val ? "True" : "False"}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Short answer */}
                {question.type === "short-answer" && (
                  <input
                    type="text"
                    value={typeof answers[question.id] === "string" ? (answers[question.id] as string) : ""}
                    onChange={(e) => handleShortAnswerChange(question.id, e.target.value)}
                    placeholder="Type your answer…"
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                  />
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ backgroundColor: "#334155", color: "#94A3B8" }}
              >
                Previous
              </button>
              <span className="text-xs" style={{ color: "#64748B" }}>
                {activeQuiz.questions.filter((q) => isAnswered(answers[q.id])).length}/{activeQuiz.questions.length} answered
                {flagged.size > 0 && <span style={{ color: "#F59E0B" }}> · {flagged.size} flagged</span>}
              </span>
              {currentQ < activeQuiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ(currentQ + 1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                >
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={activeQuiz.questions.some((q) => !isAnswered(answers[q.id]))}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                  style={{ backgroundColor: "#10B981", color: "#fff" }}
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Quizzes", value: quizzes.length, color: "#3B82F6" },
          { label: "Passed", value: quizzes.filter((q) => q.bestScore !== undefined && q.bestScore >= q.passingScore).length, color: "#10B981" },
          { label: "Available", value: counts.available, color: "#F59E0B" },
          { label: "Avg Score", value: `${Math.round(avgScore)}%`, color: "#8B5CF6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor: "#1E293B", border: "1px solid #334155", display: "inline-flex" }}>
        {(["all", "available", "completed", "locked"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
            style={{
              backgroundColor: tab === t ? "#3B82F6" : "transparent",
              color: tab === t ? "#fff" : "#94A3B8",
            }}
          >
            {t}
            <span className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: tab === t ? "rgba(255,255,255,0.2)" : "#33415540", color: tab === t ? "#fff" : "#64748B" }}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Quiz cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((quiz) => {
          const sc = statusConfig[quiz.status]
          const passed = quiz.bestScore !== undefined && quiz.bestScore >= quiz.passingScore
          const scoreColor = quiz.bestScore !== undefined
            ? quiz.bestScore >= quiz.passingScore ? "#10B981" : "#EF4444"
            : "#94A3B8"

          return (
            <div
              key={quiz.id}
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${sc.color}20`, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                    {quiz.dueDate && (
                      <span className="text-xs" style={{ color: "#64748B" }}>Due {quiz.dueDate}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{quiz.title}</h3>
                  <p className="text-xs" style={{ color: "#64748B" }}>{quiz.description}</p>
                </div>
                {quiz.bestScore !== undefined && (
                  <div
                    className="text-center flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                    style={{ backgroundColor: `${scoreColor}15`, border: `1px solid ${scoreColor}30` }}
                  >
                    <p className="text-base font-black" style={{ color: scoreColor }}>{quiz.bestScore}%</p>
                    <p className="text-xs" style={{ color: scoreColor, fontSize: 10 }}>{passed ? "Passed" : "Failed"}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: "#64748B" }}>
                <span className="flex items-center gap-1"><Brain size={11} />{quiz.questions.length} questions</span>
                <span className="flex items-center gap-1"><Clock size={11} />{quiz.timeLimit} min</span>
                <span className="flex items-center gap-1">
                  {quiz.attempts}/{quiz.maxAttempts} attempts
                </span>
                <span>Pass: {quiz.passingScore}%</span>
              </div>

              {/* Score bar */}
              {quiz.bestScore !== undefined && (
                <div className="mb-4">
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${quiz.bestScore}%`, backgroundColor: scoreColor }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs" style={{ color: "#475569" }}>
                    <span>0%</span>
                    <span style={{ color: "#64748B" }}>Pass: {quiz.passingScore}%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleStartQuiz(quiz)}
                disabled={quiz.status === "locked" || quiz.questions.length === 0 || quiz.attempts >= quiz.maxAttempts}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: quiz.status === "locked" ? "#33415550" : quiz.status === "completed" ? "#8B5CF620" : "#3B82F6",
                  color: quiz.status === "locked" ? "#475569" : quiz.status === "completed" ? "#8B5CF6" : "#fff",
                }}
              >
                {quiz.status === "locked" ? (
                  <><Lock size={14} /> Locked</>
                ) : quiz.status === "completed" ? (
                  <><Star size={14} /> {quiz.attempts < quiz.maxAttempts ? "Retake Quiz" : "Max Attempts Reached"}</>
                ) : quiz.questions.length === 0 ? (
                  "Coming Soon"
                ) : (
                  <>Start Quiz <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
