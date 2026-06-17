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
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        <h2 className="text-sm font-bold text-white mb-4">Phase Completion</h2>
        <div className="space-y-2">
          {PHASES.map((phase, idx) => {
            const isActive = phase.key === currentPhase
            const deadline = phaseDeadlines[phase.key]
            return (
              <div
                key={phase.key}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  backgroundColor: isActive ? "#3B82F610" : "#0F172A",
                  border: `1px solid ${isActive ? "#3B82F640" : "transparent"}`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: phase.done ? "#10B98120" : isActive ? "#3B82F6" : "#334155",
                    border: phase.done ? "1.5px solid #10B981" : isActive ? "none" : "1.5px solid #475569",
                  }}
                >
                  {phase.done ? (
                    <CheckCircle2 size={13} style={{ color: "#10B981" }} />
                  ) : isActive ? (
                    <Clock size={13} color="#fff" />
                  ) : (
                    <span className="text-xs font-bold" style={{ color: "#475569" }}>{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: phase.done ? "#10B981" : isActive ? "#F8FAFC" : "#64748B" }}>
                    {phase.label}
                  </p>
                  {deadline && (
                    <p className="text-xs" style={{ color: "#475569", fontSize: 10 }}>
                      {isActive ? "Active · " : ""}Due {new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
                {phase.done && <span className="text-xs" style={{ color: "#10B981" }}>✓ Done</span>}
                {isActive && <span className="text-xs font-bold" style={{ color: "#3B82F6" }}>In Progress</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Attendance log */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Attendance Log</h2>
          <div className="text-right">
            <p className="text-lg font-black" style={{ color: "#10B981" }}>{presentCount}/{attendance.length}</p>
            <p className="text-xs" style={{ color: "#64748B" }}>sessions attended</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
          {/* Header */}
          <div className="grid grid-cols-4 gap-0 px-4 py-2" style={{ backgroundColor: "#0F172A", borderBottom: "1px solid #334155" }}>
            {["Session", "Date & Time", "Method", "Status"].map((h) => (
              <p key={h} className="text-xs font-semibold" style={{ color: "#64748B" }}>{h}</p>
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
                style={{ borderBottom: i < attendance.length - 1 ? "1px solid #334155" : "none" }}
              >
                <div>
                  <p className="text-xs font-semibold text-white">{record.sessionName}</p>
                  <p className="text-xs" style={{ color: "#475569" }}>{Math.floor(record.durationMinutes / 60)}h {record.durationMinutes % 60}m</p>
                </div>
                <div>
                  <p className="text-xs text-white">{record.date}</p>
                  <p className="text-xs" style={{ color: "#475569" }}>{record.checkIn} – {record.checkOut}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
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

        <p className="text-xs mt-3" style={{ color: "#64748B" }}>
          Total time logged: <span className="font-semibold text-white">{Math.floor(totalAttendanceMinutes / 60)}h {totalAttendanceMinutes % 60}m</span>
        </p>
      </div>

      {/* Grade breakdown */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Grade Breakdown</h2>
          {weightedFinal !== null && (
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: weightedFinal >= 85 ? "#10B981" : weightedFinal >= 70 ? "#F59E0B" : "#EF4444" }}>
                {weightedFinal}
              </p>
              <p className="text-xs" style={{ color: "#64748B" }}>/ {grades.totalPossible}</p>
            </div>
          )}
        </div>

        {/* Grade sources */}
        <div className="space-y-3">
          {/* Peer scores */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "#0F172A" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserCheck size={13} style={{ color: "#3B82F6" }} />
                <p className="text-xs font-bold text-white">Peer Reviews</p>
                <span className="text-xs px-1.5 py-0 rounded-full" style={{ backgroundColor: "#3B82F615", color: "#60A5FA" }}>
                  {Math.round(grades.peerWeight * 100)}% weight
                </span>
              </div>
              {peerAvg !== null && (
                <span className="text-sm font-black text-white">{Math.round(peerAvg)}/{grades.totalPossible}</span>
              )}
            </div>
            <div className="space-y-2">
              {grades.receivedReviews.map((r) => {
                const total = Object.values(r.scores).reduce((s, v) => s + v, 0)
                const pct = Math.round((total / grades.totalPossible) * 100)
                return (
                  <div key={r.reviewerLabel} className="flex items-center gap-3">
                    <span className="text-xs w-14 flex-shrink-0" style={{ color: "#64748B" }}>{r.reviewerLabel}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "#334155" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#3B82F6" }} />
                    </div>
                    <span className="text-xs font-semibold text-white w-8 text-right">{total}</span>
                  </div>
                )
              })}
              {grades.receivedReviews.length < assignment.peerReviewCount && (
                <div className="flex items-center gap-3">
                  <span className="text-xs w-14 flex-shrink-0" style={{ color: "#64748B" }}>Peer {grades.receivedReviews.length + 1}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "#334155" }}>
                    <div className="h-full rounded-full" style={{ width: "0%", backgroundColor: "#334155" }} />
                  </div>
                  <span className="text-xs" style={{ color: "#475569" }}>Pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Self assessment */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "#0F172A" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={13} style={{ color: "#8B5CF6" }} />
                <p className="text-xs font-bold text-white">Self-Assessment</p>
                <span className="text-xs px-1.5 py-0 rounded-full" style={{ backgroundColor: "#8B5CF615", color: "#A78BFA" }}>
                  {Math.round(grades.selfWeight * 100)}% weight
                </span>
              </div>
              {grades.selfScore !== null && (
                <span className="text-sm font-black text-white">{grades.selfScore}/{grades.totalPossible}</span>
              )}
            </div>
            {grades.selfScore !== null && (
              <div className="mt-2 h-2 rounded-full" style={{ backgroundColor: "#334155" }}>
                <div className="h-full rounded-full" style={{ width: `${(grades.selfScore / grades.totalPossible) * 100}%`, backgroundColor: "#8B5CF6" }} />
              </div>
            )}
          </div>

          {/* Instructor */}
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: "#0F172A", border: grades.instructorScore !== null ? "1px solid #F59E0B30" : "1px solid #334155" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award size={13} style={{ color: "#F59E0B" }} />
                <p className="text-xs font-bold text-white">Instructor Grade</p>
                <span className="text-xs px-1.5 py-0 rounded-full" style={{ backgroundColor: "#F59E0B15", color: "#F59E0B" }}>
                  {Math.round(grades.instructorWeight * 100)}% weight
                </span>
                {grades.instructorScore !== null && (
                  <span className="text-xs px-1.5 py-0 rounded-full" style={{ backgroundColor: "#10B98115", color: "#10B981" }}>Override Applied</span>
                )}
              </div>
              {grades.instructorScore !== null ? (
                <span className="text-sm font-black text-white">{grades.instructorScore}/{grades.totalPossible}</span>
              ) : (
                <span className="text-xs" style={{ color: "#475569" }}>Pending</span>
              )}
            </div>
            {grades.instructorScore !== null && (
              <>
                <div className="h-2 rounded-full mb-3" style={{ backgroundColor: "#334155" }}>
                  <div className="h-full rounded-full" style={{ width: `${(grades.instructorScore / grades.totalPossible) * 100}%`, backgroundColor: "#F59E0B" }} />
                </div>
                <div className="flex gap-2 p-3 rounded-lg" style={{ backgroundColor: "#1E293B" }}>
                  <MessageSquare size={12} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 1 }} />
                  <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>{grades.instructorComment}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Weighted formula */}
        {weightedFinal !== null && (
          <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "#0F172A", border: "1px solid #3B82F640" }}>
            <p className="text-xs font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp size={12} style={{ color: "#3B82F6" }} /> Weighted Calculation
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
              ({Math.round(peerAvg ?? 0)} × {Math.round(grades.peerWeight * 100)}%) +{" "}
              ({grades.selfScore ?? "—"} × {Math.round(grades.selfWeight * 100)}%) +{" "}
              ({grades.instructorScore ?? "—"} × {Math.round(grades.instructorWeight * 100)}%)
              {" = "}
              <span className="font-black" style={{ color: weightedFinal >= 85 ? "#10B981" : "#F59E0B" }}>
                {weightedFinal} / {grades.totalPossible}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Instructor note */}
      {grades.instructorScore === null && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: "#1E293B", border: "1px solid #F59E0B30" }}>
          <AlertTriangle size={14} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-xs font-semibold text-white">Instructor grade pending</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
              Your instructor will review the peer scores and may apply an override before the final grade is published on{" "}
              {new Date(phaseDeadlines.closed ?? "").toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
