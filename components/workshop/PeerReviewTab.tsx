"use client"

import { useState } from "react"
import {
  Eye, CheckCircle2, Circle, Clock, UserX, ChevronLeft, Send, Star,
  FileText, Link2, AlertTriangle,
} from "lucide-react"
import type { WorkshopInteriorData, PeerAssignment, RubricCriterion } from "@/lib/data/workshopInterior"

function RubricScorer({
  rubric,
  scores,
  onScore,
  readOnly,
}: {
  rubric: RubricCriterion[]
  scores: Record<string, number | null>
  onScore: (id: string, pts: number) => void
  readOnly: boolean
}) {
  return (
    <div className="space-y-3">
      {rubric.map((criterion) => (
        <div key={criterion.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
            <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{criterion.title}</p>
            <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>
              {scores[criterion.id] ?? "—"}/{criterion.maxPoints}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ borderTop: "1px solid var(--border-default)" }}>
            {criterion.levels.map((level) => {
              const sel = scores[criterion.id] === level.points
              return (
                <button
                  key={level.label}
                  disabled={readOnly}
                  onClick={() => onScore(criterion.id, level.points)}
                  className="p-2.5 text-left transition-colors"
                  style={{
                    backgroundColor: sel ? "var(--accent-subtle)" : "transparent",
                    borderRight: "1px solid var(--border-default)",
                    cursor: readOnly ? "default" : "pointer",
                  }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold" style={{ color: sel ? "var(--accent)" : "var(--text-secondary)" }}>{level.label}</span>
                    <span className="text-xs font-bold" style={{ color: sel ? "var(--accent)" : "var(--text-muted)" }}>{level.points}</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)", fontSize: 10, lineHeight: 1.3 }}>{level.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

interface Props {
  interior: WorkshopInteriorData
}

export function PeerReviewTab({ interior }: Props) {
  const { peerAssignments, grades, assignment } = interior
  const [selectedPeer, setSelectedPeer] = useState<PeerAssignment | null>(null)
  const [scores, setScores] = useState<Record<string, Record<string, number | null>>>(() => {
    const init: Record<string, Record<string, number | null>> = {}
    peerAssignments.forEach((p) => { init[p.id] = { ...p.scores } })
    return init
  })
  const [feedback, setFeedback] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    peerAssignments.forEach((p) => { init[p.id] = p.feedback })
    return init
  })
  const [overall, setOverall] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    peerAssignments.forEach((p) => { init[p.id] = p.overallComment })
    return init
  })
  const [submitted, setSubmitted] = useState<Set<string>>(() => {
    const s = new Set<string>()
    peerAssignments.forEach((p) => { if (p.status === "submitted") s.add(p.id) })
    return s
  })
  const [flagged, setFlagged] = useState<Set<string>>(new Set())

  const peerTotal = (id: string) =>
    Object.values(scores[id] ?? {}).reduce<number>((s, v) => s + (v ?? 0), 0)

  const canSubmit = (id: string) => {
    const s = scores[id] ?? {}
    return assignment.rubric.every((c) => s[c.id] !== null && s[c.id] !== undefined) && (feedback[id] ?? "").trim().length > 0
  }

  const submitReview = (id: string) => {
    if (!canSubmit(id)) return
    setSubmitted((prev) => new Set([...prev, id]))
    setSelectedPeer(null)
  }

  const avgPeerScore = grades.receivedReviews.length
    ? Math.round(
        grades.receivedReviews.reduce((s, r) => s + Object.values(r.scores).reduce((a, b) => a + b, 0), 0) /
          grades.receivedReviews.length
      )
    : null

  if (selectedPeer) {
    const isSubmitted = submitted.has(selectedPeer.id)
    const total = peerTotal(selectedPeer.id)

    return (
      <div className="space-y-4">
        {/* Back */}
        <button
          onClick={() => setSelectedPeer(null)}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          <ChevronLeft size={15} /> Back to Peer Reviews
        </button>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left: Peer's submission */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center gap-2 mb-3">
                <UserX size={14} style={{ color: "#8B5CF6" }} />
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {selectedPeer.anonymousId}&apos;s Submission
                </p>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#8B5CF615", color: "#A78BFA" }}>
                  Anonymous
                </span>
              </div>
              {selectedPeer.submissionType === "link" ? (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                  <Link2 size={12} style={{ color: "var(--accent)" }} />
                  <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>{selectedPeer.contentPreview}</span>
                </div>
              ) : (
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{selectedPeer.contentPreview}</p>
                </div>
              )}
              {!isSubmitted && (
                <button
                  onClick={() => setFlagged((prev) => {
                    const next = new Set(prev)
                    next.has(selectedPeer.id) ? next.delete(selectedPeer.id) : next.add(selectedPeer.id)
                    return next
                  })}
                  className="mt-3 flex items-center gap-1.5 text-xs"
                  style={{ color: flagged.has(selectedPeer.id) ? "var(--danger)" : "var(--text-muted)" }}
                >
                  <AlertTriangle size={11} />
                  {flagged.has(selectedPeer.id) ? "Flagged for instructor" : "Flag inappropriate content"}
                </button>
              )}
            </div>
          </div>

          {/* Right: Rubric scoring */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Rubric Scoring</p>
                <span className="text-lg font-black" style={{ color: "var(--accent)" }}>
                  {total}/{assignment.maxScore}
                </span>
              </div>
              <RubricScorer
                rubric={assignment.rubric}
                scores={scores[selectedPeer.id] ?? {}}
                onScore={(id, pts) =>
                  setScores((p) => ({ ...p, [selectedPeer.id]: { ...p[selectedPeer.id], [id]: pts } }))
                }
                readOnly={isSubmitted}
              />

              <div className="mt-4">
                <p className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>Criterion-Specific Feedback</p>
                <textarea
                  value={feedback[selectedPeer.id] ?? ""}
                  onChange={(e) => setFeedback((p) => ({ ...p, [selectedPeer.id]: e.target.value }))}
                  disabled={isSubmitted}
                  rows={3}
                  placeholder="Explain the scores you gave for specific criteria..."
                  className="w-full p-3 rounded-xl text-xs leading-relaxed outline-none resize-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: isSubmitted ? "var(--text-tertiary)" : "var(--text-primary)" }}
                />
              </div>

              <div className="mt-3">
                <p className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>Overall Comment</p>
                <textarea
                  value={overall[selectedPeer.id] ?? ""}
                  onChange={(e) => setOverall((p) => ({ ...p, [selectedPeer.id]: e.target.value }))}
                  disabled={isSubmitted}
                  rows={2}
                  placeholder="Your overall impression of this submission..."
                  className="w-full p-3 rounded-xl text-xs leading-relaxed outline-none resize-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: isSubmitted ? "var(--text-tertiary)" : "var(--text-primary)" }}
                />
              </div>

              {isSubmitted ? (
                <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "var(--success)" }}>
                  <CheckCircle2 size={13} /> Review submitted
                </div>
              ) : (
                <button
                  onClick={() => submitReview(selectedPeer.id)}
                  disabled={!canSubmit(selectedPeer.id)}
                  className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: canSubmit(selectedPeer.id) ? "var(--accent)" : "var(--bg-surface-muted)",
                    color: canSubmit(selectedPeer.id) ? "#fff" : "var(--text-muted)",
                    border: canSubmit(selectedPeer.id) ? "none" : "1px solid var(--border-default)",
                    cursor: canSubmit(selectedPeer.id) ? "pointer" : "not-allowed",
                  }}
                >
                  <Send size={13} /> Submit Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* My reviews to complete */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>My Peer Reviews</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {submitted.size}/{peerAssignments.length} reviews submitted · identities hidden
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#8B5CF615", color: "#A78BFA" }}>
            🎭 Double-blind
          </span>
        </div>

        <div className="space-y-3">
          {peerAssignments.map((peer) => {
            const isSubmitted = submitted.has(peer.id)
            const total = peerTotal(peer.id)

            return (
              <button
                key={peer.id}
                onClick={() => setSelectedPeer(peer)}
                className="w-full rounded-xl p-4 text-left transition-colors"
                style={{
                  backgroundColor: "var(--bg-surface-muted)",
                  border: `1px solid ${isSubmitted ? "#10B98130" : "var(--border-default)"}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: isSubmitted ? "var(--success-bg)" : "var(--border-default)", border: `1px solid ${isSubmitted ? "#10B98140" : "var(--text-muted)"}` }}
                  >
                    {isSubmitted ? <CheckCircle2 size={16} style={{ color: "var(--success)" }} /> : peer.anonymousId.charAt(peer.anonymousId.length - 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{peer.anonymousId}</p>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isSubmitted ? "var(--success-bg)" : peer.status === "in-progress" ? "var(--warning-bg)" : "var(--border-default)",
                          color: isSubmitted ? "var(--success)" : peer.status === "in-progress" ? "var(--warning)" : "var(--text-tertiary)",
                        }}
                      >
                        {isSubmitted ? "✓ Submitted" : peer.status === "in-progress" ? "In Progress" : "Not Started"}
                      </span>
                      {peer.submissionType === "link" && (
                        <Link2 size={10} style={{ color: "var(--text-tertiary)" }} />
                      )}
                      {peer.submissionType === "text" && (
                        <FileText size={10} style={{ color: "var(--text-tertiary)" }} />
                      )}
                    </div>
                    <p className="text-xs mt-1 truncate" style={{ color: "var(--text-tertiary)" }}>
                      {peer.contentPreview.slice(0, 90)}…
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {isSubmitted && (
                      <p className="text-sm font-black" style={{ color: "var(--success)" }}>{total}/{assignment.maxScore}</p>
                    )}
                    <Eye size={13} style={{ color: "var(--text-muted)" }} className="mt-1 ml-auto" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reviews I received */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Reviews I Received</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {grades.receivedReviews.length} of {assignment.peerReviewCount} reviews in
            </p>
          </div>
          {avgPeerScore !== null && (
            <div className="text-right">
              <p className="text-xl font-black" style={{ color: "var(--accent)" }}>{avgPeerScore}</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>avg / {assignment.maxScore}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {grades.receivedReviews.map((review) => {
            const total = Object.values(review.scores).reduce((s, v) => s + v, 0)
            return (
              <div key={review.reviewerLabel} className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserX size={13} style={{ color: "#8B5CF6" }} />
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{review.reviewerLabel}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#8B5CF615", color: "#A78BFA" }}>Anonymous</span>
                  </div>
                  <span className="text-base font-black" style={{ color: "var(--accent)" }}>{total}/{assignment.maxScore}</span>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {assignment.rubric.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{c.title}</span>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: i < Math.ceil((review.scores[c.id] / c.maxPoints) * 4) ? "var(--accent)" : "var(--border-default)" }}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{review.scores[c.id]}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>{review.feedback}</p>
                {review.overallComment && (
                  <div className="flex gap-2 pt-2" style={{ borderTop: "1px solid var(--border-default)" }}>
                    <Star size={11} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
                    <p className="text-xs italic" style={{ color: "var(--text-tertiary)" }}>&ldquo;{review.overallComment}&rdquo;</p>
                  </div>
                )}
              </div>
            )
          })}

          {/* Pending slot */}
          {grades.receivedReviews.length < assignment.peerReviewCount && (
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px dashed var(--border-default)" }}
            >
              <Clock size={14} style={{ color: "var(--text-muted)" }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Peer {grades.receivedReviews.length + 1}</p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Awaiting review — due {new Date(interior.phaseDeadlines["peer-review"] ?? "").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
