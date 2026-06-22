"use client"

import { use, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TRAINING_TRACKS, CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/lib/data/trainings"
import type { TrainingTrack, KnowledgeCheck } from "@/lib/data/trainings"
import { STUDENT_PROFILE } from "@/lib/data/courses"
import { useTrainingProgress } from "@/lib/hooks/useTrainingProgress"
import { useTrainingEnrollments } from "@/lib/hooks/useTrainingEnrollments"
import { useKnowledgeCheckResults } from "@/lib/hooks/useKnowledgeCheckResults"
import { useStudyGroups } from "@/lib/hooks/useStudyGroups"
import { useDiscussions } from "@/lib/hooks/useDiscussions"
import { StudyGroupCard } from "@/components/study-groups/StudyGroupCard"
import { RecommendedSection } from "@/components/RecommendedSection"
import type { RecommendedItem } from "@/components/RecommendedSection"
import {
  ChevronLeft, ChevronRight, BookOpen, Clock, Users, Award, Shield,
  CheckCircle2, Circle, PlayCircle, HelpCircle, Zap, ClipboardCheck, X,
  ClipboardList, CalendarClock, MessageSquare,
} from "lucide-react"

const moduleTypeIcon = (type: string, size = 16) => {
  switch (type) {
    case "quiz": return <HelpCircle size={size} style={{ color: "#8B5CF6" }} />
    case "assessment": return <Award size={size} style={{ color: "#F59E0B" }} />
    default: return <PlayCircle size={size} style={{ color: "#3B82F6" }} />
  }
}

export default function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const track = TRAINING_TRACKS.find((t) => t.id === id) ?? TRAINING_TRACKS[0]
  const { isComplete, markComplete } = useTrainingProgress(track.id)
  const { isEnrolled, enroll } = useTrainingEnrollments()
  const { getResult, submitResult } = useKnowledgeCheckResults()
  const { groups, addMembers, removeMember } = useStudyGroups()
  const { threads } = useDiscussions()
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null)
  const [checkAnswers, setCheckAnswers] = useState<Record<string, number | string>>({})
  const [checkSubmitted, setCheckSubmitted] = useState(false)

  const trainingGroups = groups.filter((g) => g.trainingId === track.id)
  const trainingDiscussions = threads.filter((d) => d.trainingId === track.id)
  const toggleJoinGroup = (groupId: string, isMember: boolean) => {
    if (isMember) removeMember(groupId, STUDENT_PROFILE.id)
    else addMembers(groupId, [STUDENT_PROFILE.id])
  }

  const owned = track.enrolled || isEnrolled(track.id)
  const isDone = (moduleId: string, staticDone: boolean) => staticDone || isComplete(moduleId)

  const totalModules = track.modules.length
  const completedModules = track.modules.filter((m) => isDone(m.id, m.completed)).length
  const progressPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : track.progress
  const trackDone = progressPct === 100

  const daysLeft = track.deadline
    ? Math.ceil((new Date(track.deadline).getTime() - Date.now()) / 86400000)
    : null

  const CategoryIcon = CATEGORY_ICONS[track.category] || DEFAULT_CATEGORY_ICON

  const toggleModule = (moduleId: string, done: boolean) => {
    if (!owned) enroll(track.id)
    markComplete(moduleId, done)
  }

  const startCheck = (checkId: string) => {
    setActiveCheckId(checkId)
    setCheckAnswers({})
    setCheckSubmitted(false)
  }

  const closeCheck = () => {
    setActiveCheckId(null)
    setCheckSubmitted(false)
  }

  const selectMCQAnswer = (qId: string, idx: number) => {
    if (checkSubmitted) return
    setCheckAnswers((prev) => ({ ...prev, [qId]: idx }))
  }

  const setTextAnswer = (qId: string, value: string) => {
    if (checkSubmitted) return
    setCheckAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  const isCheckQuestionCorrect = (q: KnowledgeCheck["questions"][number]) => {
    const value = checkAnswers[q.id]
    if (q.type === "text") {
      const text = typeof value === "string" ? value.trim().toLowerCase() : ""
      return q.acceptedAnswers.some((a) => a.trim().toLowerCase() === text)
    }
    return value === q.correctIndex
  }

  const submitCheck = (check: KnowledgeCheck) => {
    const correct = check.questions.filter(isCheckQuestionCorrect).length
    const score = Math.round((correct / check.questions.length) * 100)
    submitResult(check.id, score, score >= check.passingScore)
    setCheckSubmitted(true)
  }

  const isCheckAnswered = (q: KnowledgeCheck["questions"][number]) => {
    const value = checkAnswers[q.id]
    return typeof value === "string" ? value.trim().length > 0 : value !== undefined
  }

  const handleEnroll = () => enroll(track.id)

  const toRecommendedItem = (t: TrainingTrack): RecommendedItem => ({
    id: t.id,
    href: `/student/trainings/${t.id}`,
    thumbnail: t.icon,
    thumbnailColor: t.badgeColor,
    title: t.title,
    meta: `${t.level} · ${t.courses} courses · ${t.totalHours}h`,
    priceLabel: `${t.enrolledUsers.toLocaleString()} enrolled`,
  })

  const alsoBought = [...TRAINING_TRACKS]
    .filter((t) => t.id !== track.id)
    .sort((a, b) => b.enrolledUsers - a.enrolledUsers)
    .slice(0, 4)
    .map(toRecommendedItem)

  const alsoBoughtIds = new Set(alsoBought.map((t) => t.id))
  const recommended = [...TRAINING_TRACKS]
    .filter((t) => t.id !== track.id && !alsoBoughtIds.has(t.id))
    .sort((a, b) => {
      const aSame = a.category === track.category ? 1 : 0
      const bSame = b.category === track.category ? 1 : 0
      if (aSame !== bSame) return bSame - aSame
      return b.enrolledUsers - a.enrolledUsers
    })
    .slice(0, 4)
    .map(toRecommendedItem)

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl space-y-6">

        {/* Breadcrumb */}
        <Link href="/student/trainings" className="flex items-center gap-1.5 text-sm w-fit" style={{ color: "#64748B" }}>
          <ChevronLeft size={15} /> Back to Trainings
        </Link>

        {/* Hero */}
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${track.badgeColor}18 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
          />
          <div className="flex flex-col lg:flex-row gap-6 relative">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#0F172A" }}>
                  {track.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: track.type === "enterprise" ? "#3B82F615" : "#8B5CF615", color: track.type === "enterprise" ? "#60A5FA" : "#A78BFA" }}>
                      {track.type}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#334155", color: "#94A3B8" }}>
                      <CategoryIcon size={10} /> {track.category}
                    </span>
                    {track.isMandatory && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#EF444420", color: "#EF4444" }}>
                        <Shield size={10} /> Required
                      </span>
                    )}
                    {trackDone && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>
                        <CheckCircle2 size={10} /> Complete
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-white mb-2">{track.title}</h1>
                  <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{track.description}</p>

                  <div className="flex items-center gap-5 flex-wrap mt-4 text-sm" style={{ color: "#64748B" }}>
                    <span className="flex items-center gap-1.5"><BookOpen size={14} /> {totalModules} modules</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {track.totalHours}h total</span>
                    <span className="flex items-center gap-1.5"><Users size={14} /> {track.enrolledUsers.toLocaleString()} enrolled</span>
                    <span className="flex items-center gap-1.5">{track.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="lg:w-72 rounded-xl p-5 flex-shrink-0" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
              <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl" style={{ backgroundColor: "#1E293B" }}>
                <Award size={14} style={{ color: track.badgeColor, flexShrink: 0 }} />
                <span className="text-xs font-semibold" style={{ color: track.badgeColor }}>Earn: {track.badge}</span>
              </div>

              {owned ? (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: "#64748B" }}>
                      <span>{completedModules}/{totalModules} modules</span>
                      <span style={{ color: trackDone ? "#10B981" : "#94A3B8" }}>{progressPct}% complete</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: "#334155" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%`, backgroundColor: trackDone ? "#10B981" : track.isMandatory ? "#EF4444" : "#3B82F6" }}
                      />
                    </div>
                    {daysLeft !== null && !trackDone && (
                      <p className="text-xs mt-1.5" style={{ color: daysLeft < 30 ? "#EF4444" : "#F59E0B" }}>
                        {daysLeft}d left to complete
                      </p>
                    )}
                  </div>
                  {trackDone ? (
                    <Link
                      href="/student/certificates"
                      className="block w-full text-center py-3 rounded-xl text-sm font-bold"
                      style={{ backgroundColor: "#10B981", color: "#fff" }}
                    >
                      <Award size={16} className="inline mr-2" /> View Certificate
                    </Link>
                  ) : (
                    <p className="text-xs text-center" style={{ color: "#64748B" }}>
                      Mark modules complete below as you go
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
                    You haven&apos;t started this training yet.
                  </p>
                  <button
                    onClick={handleEnroll}
                    className="block w-full text-center py-3 rounded-xl text-sm font-bold"
                    style={{ backgroundColor: track.isMandatory ? "#EF4444" : "#3B82F6", color: "#fff" }}
                  >
                    <Zap size={16} className="inline mr-2" /> Start Training
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #334155" }}>
            <h2 className="text-sm font-bold text-white">Training Content</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{totalModules} modules · {track.totalHours}h total</p>
          </div>
          <div className="divide-y" style={{ borderColor: "#334155" }}>
            {track.modules.map((m, i) => {
              const done = isDone(m.id, m.completed)
              return (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3.5" style={{ backgroundColor: i % 2 === 0 ? "#1A2535" : "#1E293B" }}>
                  <button onClick={() => toggleModule(m.id, !done)} className="flex-shrink-0">
                    {done ? <CheckCircle2 size={18} style={{ color: "#10B981" }} /> : <Circle size={18} style={{ color: "#475569" }} />}
                  </button>
                  <div className="flex-shrink-0 w-5 flex items-center justify-center">
                    {moduleTypeIcon(m.type)}
                  </div>
                  <span
                    className="flex-1 text-sm"
                    style={{ color: done ? "#64748B" : "#CBD5E1", textDecoration: done ? "line-through" : "none" }}
                  >
                    {m.title}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>{m.duration}</span>
                  <button
                    onClick={() => toggleModule(m.id, !done)}
                    className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0 font-semibold"
                    style={{ backgroundColor: done ? "#10B98115" : "#3B82F620", color: done ? "#10B981" : "#60A5FA" }}
                  >
                    {done ? "Mark Incomplete" : "Mark Complete"}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Knowledge Checks */}
        {track.knowledgeChecks.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardCheck size={16} style={{ color: "#3B82F6" }} /> Knowledge Checks
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                {track.knowledgeChecks.length} check{track.knowledgeChecks.length > 1 ? "s" : ""} · MCQ &amp; short-answer questions
              </p>
            </div>

            {track.knowledgeChecks.map((check) => {
              const result = getResult(check.id)
              const isActive = activeCheckId === check.id
              const score = isActive && checkSubmitted ? Math.round((check.questions.filter(isCheckQuestionCorrect).length / check.questions.length) * 100) : result?.score
              const passed = isActive && checkSubmitted ? score! >= check.passingScore : result?.passed
              const allAnswered = check.questions.every(isCheckAnswered)

              return (
                <div key={check.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                  <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-white">{check.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                        {check.questions.length} questions · Pass: {check.passingScore}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {result && !isActive && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: result.passed ? "#10B98120" : "#EF444420", color: result.passed ? "#10B981" : "#EF4444" }}
                        >
                          {result.passed ? "Passed" : "Failed"} · {result.score}%
                        </span>
                      )}
                      {!isActive && (
                        <button
                          onClick={() => startCheck(check.id)}
                          className="text-xs font-semibold px-3.5 py-2 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: result ? "#334155" : "#3B82F6", color: result ? "#CBD5E1" : "#fff" }}
                        >
                          {result ? "Retake Check" : "Start Check"}
                        </button>
                      )}
                      {isActive && (
                        <button onClick={closeCheck} className="p-1.5 rounded-lg" style={{ backgroundColor: "#334155", color: "#94A3B8" }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <div className="px-5 pb-5 space-y-4" style={{ borderTop: "1px solid #334155" }}>
                      {checkSubmitted && (
                        <div
                          className="rounded-xl p-4 text-center mt-4"
                          style={{ backgroundColor: passed ? "#10B98115" : "#EF444415", border: `1px solid ${passed ? "#10B98130" : "#EF444430"}` }}
                        >
                          <p className="text-2xl font-black" style={{ color: passed ? "#10B981" : "#EF4444" }}>{score}%</p>
                          <p className="text-xs mt-1" style={{ color: passed ? "#10B981" : "#EF4444" }}>
                            {passed ? "Passed!" : `Not passed — needs ${check.passingScore}%`}
                          </p>
                        </div>
                      )}

                      {check.questions.map((q, i) => {
                        const correct = checkSubmitted ? isCheckQuestionCorrect(q) : null
                        return (
                          <div key={q.id} className="pt-4" style={{ borderTop: i === 0 ? "none" : "1px solid #1E293B" }}>
                            <p className="text-sm font-medium text-white mb-3">
                              Q{i + 1}. {q.question}
                            </p>

                            {q.type === "mcq" ? (
                              <div className="space-y-2">
                                {q.options.map((opt, idx) => {
                                  const selected = checkAnswers[q.id] === idx
                                  const isCorrectOpt = checkSubmitted && idx === q.correctIndex
                                  const isWrongPick = checkSubmitted && selected && idx !== q.correctIndex
                                  return (
                                    <button
                                      key={idx}
                                      disabled={checkSubmitted}
                                      onClick={() => selectMCQAnswer(q.id, idx)}
                                      className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all"
                                      style={{
                                        backgroundColor: isCorrectOpt ? "#10B98115" : isWrongPick ? "#EF444415" : selected ? "#3B82F620" : "#0F172A",
                                        border: `1px solid ${isCorrectOpt ? "#10B98130" : isWrongPick ? "#EF444430" : selected ? "#3B82F6" : "#334155"}`,
                                        color: isCorrectOpt ? "#10B981" : isWrongPick ? "#EF4444" : selected ? "#60A5FA" : "#CBD5E1",
                                      }}
                                    >
                                      {isCorrectOpt && "✓ "}{isWrongPick && "✗ "}{opt}
                                    </button>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  disabled={checkSubmitted}
                                  value={typeof checkAnswers[q.id] === "string" ? (checkAnswers[q.id] as string) : ""}
                                  onChange={(e) => setTextAnswer(q.id, e.target.value)}
                                  placeholder="Type your answer…"
                                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                                  style={{
                                    backgroundColor: "#0F172A",
                                    border: `1px solid ${checkSubmitted ? (correct ? "#10B98130" : "#EF444430") : "#334155"}`,
                                    color: "#F8FAFC",
                                  }}
                                />
                                {checkSubmitted && !correct && (
                                  <p className="text-xs" style={{ color: "#10B981" }}>
                                    Accepted: {q.acceptedAnswers.join(" / ")}
                                  </p>
                                )}
                              </div>
                            )}
                            {checkSubmitted && q.explanation && (
                              <p className="text-xs mt-2 leading-relaxed" style={{ color: "#64748B" }}>
                                <strong style={{ color: "#94A3B8" }}>Explanation: </strong>{q.explanation}
                              </p>
                            )}
                          </div>
                        )
                      })}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        {checkSubmitted ? (
                          <button
                            onClick={() => startCheck(check.id)}
                            className="text-xs font-semibold px-4 py-2 rounded-lg"
                            style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                          >
                            Retake Check
                          </button>
                        ) : (
                          <button
                            onClick={() => submitCheck(check)}
                            disabled={!allAnswered}
                            className="text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
                            style={{ backgroundColor: "#10B981", color: "#fff" }}
                          >
                            Submit Check
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Assignments */}
        {track.assignments.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardList size={16} style={{ color: "#F59E0B" }} /> Assignments
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                {track.assignments.length} assignment{track.assignments.length > 1 ? "s" : ""} for this training
              </p>
            </div>

            {track.assignments.map((a) => (
              <div key={a.id} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-white">{a.title}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize" style={{ backgroundColor: "#33415560", color: "#94A3B8" }}>
                    {a.submissionFormat}
                  </span>
                </div>
                <p className="text-sm mb-3" style={{ color: "#94A3B8" }}>{a.description}</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: "#64748B" }}>
                  <span className="flex items-center gap-1.5"><CalendarClock size={12} /> Due {a.dueDate}</span>
                  <span>Max score: {a.maxScore}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Study Groups */}
        {trainingGroups.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} style={{ color: "#3B82F6" }} /> Study Groups
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                Collaborate with peers also taking this training
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingGroups.map((g) => {
                const isMember = g.memberIds.includes(STUDENT_PROFILE.id)
                return (
                  <StudyGroupCard
                    key={g.id}
                    group={g}
                    isMember={isMember}
                    onToggleJoin={() => toggleJoinGroup(g.id, isMember)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Discussions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare size={16} style={{ color: "#3B82F6" }} /> Discussions
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                {trainingDiscussions.length} thread{trainingDiscussions.length === 1 ? "" : "s"} for this training
              </p>
            </div>
            <Link
              href={`/student/discussions?scope=training:${track.id}&new=1`}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: "#3B82F6", color: "#fff" }}
            >
              <MessageSquare size={13} /> New Thread
            </Link>
          </div>

          {trainingDiscussions.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
              <p className="text-sm" style={{ color: "#475569" }}>No discussions yet for this training.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trainingDiscussions.map((d) => (
                <Link
                  key={d.id}
                  href={`/student/discussions?scope=training:${track.id}`}
                  className="block rounded-2xl p-4"
                  style={{ backgroundColor: "#1E293B", border: `1px solid ${d.isPinned ? "#3B82F640" : "#334155"}` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                    >
                      {d.authorAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{d.title}</span>
                        {d.isPinned && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>Pinned</span>}
                        {d.isSolved && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>Solved</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                        {d.author} · {d.createdAt} · {d.replies} replies · {d.views} views
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {!trackDone && (
          <div className="flex items-center justify-between">
            <span />
            <Link href="/student/trainings" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#3B82F6" }}>
              Explore other trainings <ChevronRight size={15} />
            </Link>
          </div>
        )}

        {/* Students also bought + Recommended */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecommendedSection title="Students Also Bought" items={alsoBought} />
          <RecommendedSection title="Recommended For You" items={recommended} />
        </div>
      </div>
    </DashboardLayout>
  )
}
