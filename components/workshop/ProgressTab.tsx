"use client"

import {
  CheckCircle2, Clock, XCircle, QrCode, PenLine, Wifi,
  TrendingUp, Award, UserCheck, MessageSquare, AlertTriangle,
} from "lucide-react"
import type { WorkshopInteriorData } from "@/lib/data/workshopInterior"

const METHOD_ICONS = {
  "qr-code": QrCode,
  "digital-signature": PenLine,
  "auto-detected": Wifi,
}

const STATUS_COLORS = {
  present: "#10B981",
  late: "#F59E0B",
  absent: "#EF4444",
}

interface Props {
  interior: WorkshopInteriorData
}

export function ProgressTab({ interior }: Props) {
  const { attendance, grades, assignment, currentPhase, phaseDeadlines } = interior

  const peerAvg =
    grades.receivedReviews.length > 0
      ? grades.receivedReviews.reduce(
          (s, r) => s + Object.values(r.scores).reduce((a, b) => a + b, 0),
          0
        ) / grades.receivedReviews.length
      : null

  const weightedFinal =
    peerAvg !== null && grades.instructorScore !== null
      ? Math.round(
          peerAvg * grades.peerWeight +
            (grades.selfScore ?? 0) * grades.selfWeight +
            grades.instructorScore * grades.instructorWeight
        )
      : null

  const totalAttendanceMinutes = attendance.reduce((s, r) => s + r.durationMinutes, 0)
  const presentCount = attendance.filter((r) => r.status !== "absent").length

  const PHASES = [
    { key: "setup" as const, label: "Instructor Setup", done: true },
    { key: "submission" as const, label: "Submit Assignment", done: true },
    { key: "peer-review" as const, label: "Peer Reviews (3/3)", done: false },
    { key: "grading" as const, label: "Grading Phase", done: false },
    { key: "closed" as const, label: "Grades Published", done: false },
  ]

  return (
    <div className="space-y-5">
      {/* Phase checklist */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Phase Completion</h2>
        <div className="space-y-2">
          {PHASES.map((phase, idx) => {
            const isActive = phase.key === currentPhase
            const deadline = phaseDeadlines[phase.key]
            return (
              <div
                key={phase.key}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  backgroundColor: isActive ? "var(--accent-subtle)" : "var(--bg-surface-muted)",
                  border: `1px solid ${isActive ? "#3B82F640" : "transparent"}`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: phase.done ? "var(--success-bg)" : isActive ? "var(--accent)" : "var(--border-default)",
                    border: phase.done ? "1.5px solid var(--success)" : isActive ? "none" : "1.5px solid var(--text-muted)",
                  }}
                >
                  {phase.done ? (
                    <CheckCircle2 size={13} style={{ color: "var(--success)" }} />
                  ) : isActive ? (
                    <Clock size={13} color="#fff" />
                  ) : (
                    <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: phase.done ? "var(--success)" : isActive ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                    {phase.label}
                  </p>
                  {deadline && (
                    <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>
                      {isActive ? "Active · " : ""}Due {new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
                {phase.done && <span className="text-xs" style={{ color: "var(--success)" }}>✓ Done</span>}
                {isActive && <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>In Progress</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Attendance log */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Attendance Log</h2>
          <div className="text-right">
            <p className="text-lg font-black" style={{ color: "var(--success)" }}>{presentCount}/{attendance.length}</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>sessions attended</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
          {/* Header */}
          <div className="grid grid-cols-4 gap-0 px-4 py-2" style={{ backgroundColor: "var(--bg-surface-muted)", borderBottom: "1px solid var(--border-default)" }}>
            {["Session", "Date & Time", "Method", "Status"].map((h) => (
              <p key={h} className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          {attendance.map((record, i) => {
            const MethodIcon = METHOD_ICONS[record.method]
            const statusColor = STATUS_COLORS[record.status]
            return (
              <div
                key={i}
                className="grid grid-cols-4 gap-0 px-4 py-3 items-center"
                style={{ borderBottom: i < attendance.length - 1 ? "1px solid var(--border-default)" : "none" }}
              >
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{record.sessionName}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{Math.floor(record.durationMinutes / 60)}h {record.durationMinutes % 60}m</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-primary)" }}>{record.date}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{record.checkIn} – {record.checkOut}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  <MethodIcon size={11} />
                  <span className="capitalize hidden sm:block" style={{ fontSize: 10 }}>
                    {record.method.replace(/-/g, " ")}
                  </span>
                </div>
                <div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                  >
                    {record.status === "present" ? "✓ Present" : record.status === "late" ? "⏱ Late" : "✗ Absent"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-xs mt-3" style={{ color: "var(--text-tertiary)" }}>
          Total time logged: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{Math.floor(totalAttendanceMinutes / 60)}h {totalAttendanceMinutes % 60}m</span>
        </p>
      </div>

      {/* Grade breakdown */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Grade Breakdown</h2>
          {weightedFinal !== null && (
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: weightedFinal >= 85 ? "var(--success)" : weightedFinal >= 70 ? "var(--warning)" : "var(--danger)" }}>
                {weightedFinal}
              </p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>/ {grades.totalPossible}</p>
            </div>
          )}
        </div>

        {/* Grade sources */}
        <div className="space-y-3">
          {/* Peer scores */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserCheck size={13} style={{ color: "var(--accent)" }} />
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Peer Reviews</p>
                <span className="text-xs px-1.5 py-0 rounded-full" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}>
                  {Math.round(grades.peerWeight * 100)}% weight
                </span>
              </div>
              {peerAvg !== null && (
                <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{Math.round(peerAvg)}/{grades.totalPossible}</span>
              )}
            </div>
            <div className="space-y-2">
              {grades.receivedReviews.map((r) => {
                const total = Object.values(r.scores).reduce((s, v) => s + v, 0)
                const pct = Math.round((total / grades.totalPossible) * 100)
                return (
                  <div key={r.reviewerLabel} className="flex items-center gap-3">
                    <span className="text-xs w-14 flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>{r.reviewerLabel}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--accent)" }} />
                    </div>
                    <span className="text-xs font-semibold w-8 text-right" style={{ color: "var(--text-primary)" }}>{total}</span>
                  </div>
                )
              })}
              {grades.receivedReviews.length < assignment.peerReviewCount && (
                <div className="flex items-center gap-3">
                  <span className="text-xs w-14 flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>Peer {grades.receivedReviews.length + 1}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                    <div className="h-full rounded-full" style={{ width: "0%", backgroundColor: "var(--border-default)" }} />
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Self assessment */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={13} style={{ color: "#8B5CF6" }} />
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Self-Assessment</p>
                <span className="text-xs px-1.5 py-0 rounded-full" style={{ backgroundColor: "#8B5CF615", color: "#A78BFA" }}>
                  {Math.round(grades.selfWeight * 100)}% weight
                </span>
              </div>
              {grades.selfScore !== null && (
                <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{grades.selfScore}/{grades.totalPossible}</span>
              )}
            </div>
            {grades.selfScore !== null && (
              <div className="mt-2 h-2 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                <div className="h-full rounded-full" style={{ width: `${(grades.selfScore / grades.totalPossible) * 100}%`, backgroundColor: "#8B5CF6" }} />
              </div>
            )}
          </div>

          {/* Instructor */}
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: "var(--bg-surface-muted)", border: grades.instructorScore !== null ? "1px solid #F59E0B30" : "1px solid var(--border-default)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award size={13} style={{ color: "var(--warning)" }} />
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Instructor Grade</p>
                <span className="text-xs px-1.5 py-0 rounded-full" style={{ backgroundColor: "var(--warning-bg)", color: "var(--warning)" }}>
                  {Math.round(grades.instructorWeight * 100)}% weight
                </span>
                {grades.instructorScore !== null && (
                  <span className="text-xs px-1.5 py-0 rounded-full" style={{ backgroundColor: "var(--success-bg)", color: "var(--success)" }}>Override Applied</span>
                )}
              </div>
              {grades.instructorScore !== null ? (
                <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{grades.instructorScore}/{grades.totalPossible}</span>
              ) : (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Pending</span>
              )}
            </div>
            {grades.instructorScore !== null && (
              <>
                <div className="h-2 rounded-full mb-3" style={{ backgroundColor: "var(--border-default)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(grades.instructorScore / grades.totalPossible) * 100}%`, backgroundColor: "var(--warning)" }} />
                </div>
                <div className="flex gap-2 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
                  <MessageSquare size={12} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{grades.instructorComment}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Weighted formula */}
        {weightedFinal !== null && (
          <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid #3B82F640" }}>
            <p className="text-xs font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <TrendingUp size={12} style={{ color: "var(--accent)" }} /> Weighted Calculation
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              ({Math.round(peerAvg ?? 0)} × {Math.round(grades.peerWeight * 100)}%) +{" "}
              ({grades.selfScore ?? "—"} × {Math.round(grades.selfWeight * 100)}%) +{" "}
              ({grades.instructorScore ?? "—"} × {Math.round(grades.instructorWeight * 100)}%)
              {" = "}
              <span className="font-black" style={{ color: weightedFinal >= 85 ? "var(--success)" : "var(--warning)" }}>
                {weightedFinal} / {grades.totalPossible}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Instructor note */}
      {grades.instructorScore === null && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid #F59E0B30" }}>
          <AlertTriangle size={14} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Instructor grade pending</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Your instructor will review the peer scores and may apply an override before the final grade is published on{" "}
              {new Date(phaseDeadlines.closed ?? "").toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
