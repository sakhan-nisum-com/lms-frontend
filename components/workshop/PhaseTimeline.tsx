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
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-white">Workflow Phase</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F615", color: "#60A5FA" }}>
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
                      status === "done" ? "#10B98120" :
                      status === "active" ? "#3B82F6" :
                      "#0F172A",
                    border:
                      status === "done" ? "2px solid #10B981" :
                      status === "active" ? "2px solid #3B82F6" :
                      "2px solid #334155",
                  }}
                >
                  {status === "done" ? (
                    <CheckCircle2 size={14} style={{ color: "#10B981" }} />
                  ) : status === "active" ? (
                    <Clock3 size={14} color="#fff" />
                  ) : (
                    <Circle size={14} style={{ color: "#475569" }} />
                  )}
                </div>

                {/* Label */}
                <p
                  className="text-xs font-semibold mt-1.5 text-center"
                  style={{
                    color: status === "done" ? "#10B981" : status === "active" ? "#F8FAFC" : "#475569",
                  }}
                >
                  {PHASE_LABELS[phase].short}
                </p>

                {/* Deadline */}
                {deadline && (
                  <p className="text-xs mt-0.5 text-center" style={{ color: status === "active" ? "#F59E0B" : "#334155", fontSize: 10 }}>
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
                        ? "#10B981"
                        : "#334155",
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
