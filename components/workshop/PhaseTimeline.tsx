"use client"

import { CheckCircle2, Circle, Clock3 } from "lucide-react"
import type { WorkshopInteriorData, WorkshopPhase } from "@/lib/data/workshopInterior"

const PHASE_ORDER: WorkshopPhase[] = ["setup", "submission", "peer-review", "grading", "closed"]

const PHASE_LABELS: Record<WorkshopPhase, { short: string; long: string }> = {
  setup: { short: "Setup", long: "Instructor Setup" },
  submission: { short: "Submit", long: "Submission" },
  "peer-review": { short: "Review", long: "Peer Review" },
  grading: { short: "Grading", long: "Grading" },
  closed: { short: "Closed", long: "Closed" },
}

function phaseStatus(phase: WorkshopPhase, current: WorkshopPhase): "done" | "active" | "upcoming" {
  const ci = PHASE_ORDER.indexOf(current)
  const pi = PHASE_ORDER.indexOf(phase)
  if (pi < ci) return "done"
  if (pi === ci) return "active"
  return "upcoming"
}

interface Props {
  interior: WorkshopInteriorData
}

export function PhaseTimeline({ interior }: Props) {
  const { currentPhase, phaseDeadlines } = interior

  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Workflow Phase</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}>
          {PHASE_LABELS[currentPhase].long}
        </span>
      </div>

      {/* Timeline */}
      <div className="flex items-center mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {PHASE_ORDER.map((phase, idx) => {
          const status = phaseStatus(phase, currentPhase)
          const deadline = phaseDeadlines[phase]

          return (
            <div key={phase} className="flex items-center flex-shrink-0">
              {/* Step */}
              <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor:
                      status === "done" ? "var(--success-bg)" :
                      status === "active" ? "var(--accent)" :
                      "var(--bg-surface-muted)",
                    border:
                      status === "done" ? "2px solid var(--success)" :
                      status === "active" ? "2px solid var(--accent)" :
                      "2px solid var(--border-default)",
                  }}
                >
                  {status === "done" ? (
                    <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                  ) : status === "active" ? (
                    <Clock3 size={14} color="#fff" />
                  ) : (
                    <Circle size={14} style={{ color: "var(--text-muted)" }} />
                  )}
                </div>

                {/* Label */}
                <p
                  className="text-xs font-semibold mt-1.5 text-center"
                  style={{
                    color: status === "done" ? "var(--success)" : status === "active" ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  {PHASE_LABELS[phase].short}
                </p>

                {/* Deadline */}
                {deadline && (
                  <p className="text-xs mt-0.5 text-center" style={{ color: status === "active" ? "var(--warning)" : "var(--border-default)", fontSize: 10 }}>
                    {new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>

              {/* Connector */}
              {idx < PHASE_ORDER.length - 1 && (
                <div
                  className="h-px flex-1 mx-1"
                  style={{
                    width: 36,
                    backgroundColor:
                      phaseStatus(PHASE_ORDER[idx + 1], currentPhase) !== "upcoming" || phase === currentPhase
                        ? "var(--success)"
                        : "var(--border-default)",
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
