"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { QUIZZES, STUDENT_PROFILE } from "@/lib/data/courses"
import type { Quiz } from "@/lib/data/courses"
import {
  Brain, Clock, Star, CheckCircle2, Lock, AlertCircle,
  ChevronRight, X, ArrowRight,
} from "lucide-react"

type Tab = "all" | "available" | "completed" | "locked"

const statusConfig: Record<Quiz["status"], { label: string; color: string }> = {
  available: { label: "Available", color: "#10B981" },
  "in-progress": { label: "In Progress", color: "#3B82F6" },
  completed: { label: "Completed", color: "#8B5CF6" },
  locked: { label: "Locked", color: "#475569" },
}

export default function QuizzesPage() {
  const p = STUDENT_PROFILE
  const [tab, setTab] = useState<Tab>("all")
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft] = useState<number | null>(null)

  const filtered = QUIZZES.filter((q) => {
    if (tab === "all") return true
    return q.status === tab
  })

  const counts = {
    all: QUIZZES.length,
    available: QUIZZES.filter((q) => q.status === "available").length,
    completed: QUIZZES.filter((q) => q.status === "completed").length,
    locked: QUIZZES.filter((q) => q.status === "locked").length,
  }

  const avgScore = QUIZZES.filter((q) => q.bestScore !== undefined)
    .reduce((s, q, _, arr) => s + q.bestScore! / arr.length, 0)

  const handleStartQuiz = (quiz: Quiz) => {
    if (quiz.status === "locked" || quiz.questions.length === 0) return
    setActiveQuiz(quiz)
    setCurrentQ(0)
    setAnswers({})
    setSubmitted(false)
  }

  const handleAnswer = (qId: string, idx: number) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qId]: idx }))
  }

  const handleSubmit = () => setSubmitted(true)

  const calcScore = () => {
    if (!activeQuiz) return 0
    const correct = activeQuiz.questions.filter(
      (q) => answers[q.id] === q.correctIndex
    ).length
    return Math.round((correct / activeQuiz.questions.length) * 100)
  }

  // ── Quiz Taking UI ──
  if (activeQuiz) {
    const question = activeQuiz.questions[currentQ]
    const score = submitted ? calcScore() : 0
    const passed = score >= activeQuiz.passingScore

    return (
      <DashboardLayout role="student" userName={p.name}>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Quiz header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{activeQuiz.title}</h1>
              <p className="text-sm" style={{ color: "#64748B" }}>{activeQuiz.courseName}</p>
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
                    onClick={() => { setAnswers({}); setSubmitted(false); setCurrentQ(0) }}
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
                  const userAnswer = answers[q.id]
                  const correct = userAnswer === q.correctIndex
                  return (
                    <div key={q.id} className="rounded-xl p-4" style={{ backgroundColor: "#0F172A", border: `1px solid ${correct ? "#10B98130" : "#EF444430"}` }}>
                      <p className="text-sm font-medium text-white mb-2">Q{i + 1}. {q.question}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, idx) => {
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
                      </div>
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
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {activeQuiz.timeLimit} min limit
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${((currentQ + 1) / activeQuiz.questions.length) * 100}%`,
                      backgroundColor: "#3B82F6",
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              {question && (
                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                >
                  <h2 className="text-base font-semibold text-white mb-5">{question.question}</h2>
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
                          onClick={() => handleAnswer(question.id, idx)}
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
                  {Object.keys(answers).length}/{activeQuiz.questions.length} answered
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
                    disabled={Object.keys(answers).length < activeQuiz.questions.length}
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
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-6 max-w-6xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Quizzes & Exams</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            {counts.available} available · {counts.completed} completed · avg score {Math.round(avgScore)}%
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Quizzes", value: QUIZZES.length, color: "#3B82F6" },
            { label: "Passed", value: QUIZZES.filter((q) => q.bestScore !== undefined && q.bestScore >= q.passingScore).length, color: "#10B981" },
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
                    <p className="text-xs" style={{ color: "#64748B" }}>{quiz.courseName}</p>
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
    </DashboardLayout>
  )
}
