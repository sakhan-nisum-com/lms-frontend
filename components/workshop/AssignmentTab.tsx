"use client"

import { useState } from "react"
import {
  FileText, Link2, Upload, Video, CheckCircle2, Circle, AlertCircle,
  ChevronDown, ChevronUp, BookOpen, Sparkles, Clock, Send,
} from "lucide-react"
import type { WorkshopInteriorData, RubricCriterion } from "@/lib/data/workshopInterior"

function RubricTable({
  rubric,
  scores,
  onScore,
  readOnly,
}: {
  rubric: RubricCriterion[]
  scores: Record<string, number | null>
  onScore?: (criterionId: string, points: number) => void
  readOnly?: boolean
}) {
  return (
    <div className="space-y-3">
      {rubric.map((criterion) => (
        <div key={criterion.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
          <div className="px-4 py-3 flex items-start justify-between" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{criterion.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{criterion.description}</p>
            </div>
            <span className="text-xs font-bold ml-3 flex-shrink-0" style={{ color: "#60A5FA" }}>
              {scores[criterion.id] ?? "—"}/{criterion.maxPoints}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0" style={{ borderTop: "1px solid var(--border-default)" }}>
            {criterion.levels.map((level) => {
              const selected = scores[criterion.id] === level.points
              return (
                <button
                  key={level.label}
                  onClick={() => !readOnly && onScore?.(criterion.id, level.points)}
                  disabled={readOnly}
                  className="p-3 text-left transition-colors"
                  style={{
                    backgroundColor: selected ? "#3B82F615" : "transparent",
                    borderRight: "1px solid var(--border-default)",
                    cursor: readOnly ? "default" : "pointer",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {selected ? (
                      <CheckCircle2 size={11} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    ) : (
                      <Circle size={11} style={{ color: "var(--border-default)", flexShrink: 0 }} />
                    )}
                    <span className="text-xs font-bold" style={{ color: selected ? "#60A5FA" : "var(--text-secondary)" }}>
                      {level.label}
                    </span>
                    <span className="text-xs ml-auto font-semibold" style={{ color: selected ? "#60A5FA" : "var(--text-muted)" }}>
                      {level.points}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)", fontSize: 10 }}>
                    {level.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

type SubmitType = "text" | "file" | "link" | "video" | "audio"

const SUBMIT_ICONS: Record<SubmitType, React.ElementType> = {
  text: FileText,
  file: Upload,
  link: Link2,
  video: Video,
  audio: Video,
}

interface Props {
  interior: WorkshopInteriorData
}

export function AssignmentTab({ interior }: Props) {
  const { assignment, mySubmission } = interior

  const [submitType, setSubmitType] = useState<SubmitType>("text")
  const [textContent, setTextContent] = useState(
    mySubmission.status !== "not-started" && mySubmission.type === "text" ? mySubmission.content : ""
  )
  const [linkContent, setLinkContent] = useState(
    mySubmission.type === "link" ? mySubmission.content : ""
  )
  const [submitted, setSubmitted] = useState(mySubmission.status === "submitted")
  const [showRubric, setShowRubric] = useState(false)
  const [showBenchmark, setShowBenchmark] = useState(false)
  const [selfScores, setSelfScores] = useState<Record<string, number | null>>(mySubmission.selfAssessmentScores)
  const [selfFeedback, setSelfFeedback] = useState(mySubmission.selfAssessmentFeedback)
  const [selfSaved, setSelfSaved] = useState(mySubmission.status === "submitted")
  const [benchmarkScores, setBenchmarkScores] = useState<Record<string, number | null>>({})

  const selfTotal = Object.values(selfScores).reduce<number>((s, v) => s + (v ?? 0), 0)
  const benchmarkTotal = Object.values(benchmarkScores).reduce<number>((s, v) => s + (v ?? 0), 0)
  const expectedTotal = Object.values(assignment.benchmarkExample.expectedGrades).reduce((s, v) => s + v, 0)

  const handleSubmit = () => {
    if (submitType === "text" && !textContent.trim()) return
    if (submitType === "link" && !linkContent.trim()) return
    setSubmitted(true)
  }

  const saveSelfAssessment = () => {
    const allScored = assignment.rubric.every((c) => selfScores[c.id] !== null && selfScores[c.id] !== undefined)
    if (!allScored) return
    setSelfSaved(true)
  }

  return (
    <div className="space-y-5">
      {/* Brief */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{assignment.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
              <span className="flex items-center gap-1"><Clock size={11} /> Due {new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
              <span className="flex items-center gap-1"><BookOpen size={11} /> {assignment.maxScore} pts</span>
            </div>
          </div>
          {submitted && (
            <span className="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0" style={{ backgroundColor: "#10B98120", color: "#10B981", border: "1px solid #10B98140" }}>
              <CheckCircle2 size={10} /> Submitted
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{assignment.brief}</p>

        {/* Submission type chips */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>Accepts:</span>
          {assignment.submissionTypes.map((t) => {
            const Icon = SUBMIT_ICONS[t]
            return (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 capitalize" style={{ backgroundColor: "#3B82F610", color: "#60A5FA", border: "1px solid #3B82F625" }}>
                <Icon size={10} /> {t}
              </span>
            )
          })}
        </div>

        {/* Flags */}
        <div className="flex gap-3 mt-3 flex-wrap text-xs">
          {assignment.anonymousReview && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: "#8B5CF615", color: "#A78BFA" }}>
              🎭 Anonymous review
            </span>
          )}
          {assignment.selfAssessmentRequired && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F59E0B15", color: "#F59E0B" }}>
              🪞 Self-assessment required
            </span>
          )}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: "#10B98115", color: "#10B981" }}>
            👥 {assignment.peerReviewCount} peer reviews assigned
          </span>
        </div>

        {/* Rubric toggle */}
        <button
          onClick={() => setShowRubric((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: "#60A5FA" }}
        >
          <BookOpen size={12} /> {showRubric ? "Hide" : "View"} Grading Rubric
          {showRubric ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showRubric && (
          <div className="mt-3">
            <RubricTable rubric={assignment.rubric} scores={{}} readOnly />
          </div>
        )}
      </div>

      {/* Submission Area */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          {submitted ? "Your Submission" : "Submit Your Work"}
        </h2>

        {/* Type switcher */}
        {!submitted && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {assignment.submissionTypes.map((t) => {
              const Icon = SUBMIT_ICONS[t]
              return (
                <button
                  key={t}
                  onClick={() => setSubmitType(t as SubmitType)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize flex-shrink-0"
                  style={{
                    backgroundColor: submitType === t ? "var(--accent)" : "var(--bg-surface-muted)",
                    color: submitType === t ? "#fff" : "var(--text-tertiary)",
                    border: `1px solid ${submitType === t ? "var(--accent)" : "var(--border-default)"}`,
                  }}
                >
                  <Icon size={11} /> {t === "file" ? "File Upload" : t}
                </button>
              )
            })}
          </div>
        )}

        {/* Content area */}
        {submitted ? (
          <div className="p-4 rounded-xl text-xs leading-relaxed" style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)" }}>
            {mySubmission.type === "text" && mySubmission.content}
            {mySubmission.type === "link" && (
              <a href={mySubmission.content} target="_blank" rel="noreferrer" className="flex items-center gap-2" style={{ color: "#60A5FA" }}>
                <Link2 size={12} /> {mySubmission.content}
              </a>
            )}
            {mySubmission.submittedAt && (
              <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                Submitted {new Date(mySubmission.submittedAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <>
            {(submitType === "text") && (
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={7}
                placeholder="Describe your project, share your approach, or write your reflection..."
                className="w-full p-3 rounded-xl text-xs leading-relaxed outline-none resize-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            )}
            {(submitType === "link") && (
              <input
                value={linkContent}
                onChange={(e) => setLinkContent(e.target.value)}
                placeholder="https://github.com/your-username/your-repo"
                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            )}
            {(submitType === "file" || submitType === "video" || submitType === "audio") && (
              <div
                className="flex flex-col items-center justify-center gap-3 rounded-xl p-8 text-center"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "2px dashed var(--border-default)" }}
              >
                <Upload size={28} style={{ color: "var(--text-muted)" }} />
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Drag and drop or click to upload</p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {submitType === "file" ? "PDF, DOCX, ZIP, or any file up to 50 MB" : submitType === "video" ? "MP4, MOV up to 1 GB" : "MP3, WAV up to 200 MB"}
                </p>
                <button className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                  Browse Files
                </button>
              </div>
            )}
            <button
              onClick={handleSubmit}
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Send size={13} /> Submit Assignment
            </button>
          </>
        )}
      </div>

      {/* Self Assessment (visible after submission) */}
      {(submitted || mySubmission.status === "submitted") && (
        <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid #8B5CF650" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🪞</span>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Self-Assessment</h2>
            {selfSaved && (
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>
                Saved
              </span>
            )}
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>Evaluate your own submission against the rubric before peer reviews begin.</p>

          <RubricTable
            rubric={assignment.rubric}
            scores={selfScores}
            onScore={(id, pts) => setSelfScores((p) => ({ ...p, [id]: pts }))}
            readOnly={selfSaved}
          />

          <div className="mt-4">
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Overall Reflection</p>
            <textarea
              value={selfFeedback}
              onChange={(e) => setSelfFeedback(e.target.value)}
              disabled={selfSaved}
              rows={3}
              placeholder="What did you do well? What would you improve?"
              className="w-full p-3 rounded-xl text-xs leading-relaxed outline-none resize-none"
              style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: selfSaved ? "var(--text-tertiary)" : "var(--text-primary)" }}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{selfTotal} / {assignment.maxScore}</span>
            {!selfSaved && (
              <button
                onClick={saveSelfAssessment}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                style={{ backgroundColor: "#8B5CF6" }}
              >
                Save Self-Assessment
              </button>
            )}
          </div>
        </div>
      )}

      {/* Benchmark Practice */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <button
          onClick={() => setShowBenchmark((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={15} style={{ color: "var(--warning)" }} />
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Practice Grading — Benchmark Exercise</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Grade a sample submission before reviewing peers</p>
            </div>
          </div>
          {showBenchmark ? <ChevronUp size={14} style={{ color: "var(--text-tertiary)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} />}
        </button>

        {showBenchmark && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
              <p className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>{assignment.benchmarkExample.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{assignment.benchmarkExample.content}</p>
            </div>

            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Grade this submission:</p>
            <RubricTable
              rubric={assignment.rubric}
              scores={benchmarkScores}
              onScore={(id, pts) => setBenchmarkScores((p) => ({ ...p, [id]: pts }))}
            />

            {Object.keys(benchmarkScores).length === assignment.rubric.length && (
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid #F59E0B40" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Your score</span>
                  <span className="text-base font-black" style={{ color: benchmarkTotal === expectedTotal ? "var(--success)" : Math.abs(benchmarkTotal - expectedTotal) <= 10 ? "var(--warning)" : "var(--danger)" }}>
                    {benchmarkTotal}/{assignment.maxScore}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Instructor's expected score</span>
                  <span className="text-sm font-bold" style={{ color: "var(--success)" }}>{expectedTotal}/{assignment.maxScore}</span>
                </div>
                {Math.abs(benchmarkTotal - expectedTotal) <= 10 && (
                  <div className="flex items-start gap-2 pt-2" style={{ borderTop: "1px solid var(--border-default)" }}>
                    <AlertCircle size={12} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{assignment.benchmarkExample.instructorFeedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
