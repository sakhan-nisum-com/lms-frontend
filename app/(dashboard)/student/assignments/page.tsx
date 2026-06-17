"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ASSIGNMENTS, STUDENT_PROFILE } from "@/lib/data/courses"
import type { Assignment } from "@/lib/data/courses"
import {
  ClipboardList, AlertCircle, CheckCircle2, Clock, ChevronRight,
  Upload, Download, Star, Filter, X,
} from "lucide-react"

type Tab = "all" | "pending" | "submitted" | "graded"

const typeLabels: Record<Assignment["type"], string> = {
  project: "Project",
  essay: "Essay",
  practical: "Practical",
  report: "Report",
  presentation: "Presentation",
}

const typeColors: Record<Assignment["type"], string> = {
  project: "#3B82F6",
  essay: "#8B5CF6",
  practical: "#10B981",
  report: "#F59E0B",
  presentation: "#EC4899",
}

const statusConfig: Record<Assignment["status"], { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "#F59E0B", icon: Clock },
  submitted: { label: "Submitted", color: "#3B82F6", icon: CheckCircle2 },
  graded: { label: "Graded", color: "#10B981", icon: Star },
  late: { label: "Late", color: "#EF4444", icon: AlertCircle },
  overdue: { label: "Overdue", color: "#EF4444", icon: AlertCircle },
}

function DaysLeft({ dueDate, status }: { dueDate: string; status: Assignment["status"] }) {
  const due = new Date(dueDate)
  const today = new Date("2025-06-12")
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (status === "graded" || status === "submitted") return null

  const color = diff < 0 ? "#EF4444" : diff <= 3 ? "#EF4444" : diff <= 7 ? "#F59E0B" : "#94A3B8"
  const label = diff < 0 ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : `${diff}d left`

  return (
    <span className="flex items-center gap-1 text-xs font-medium" style={{ color }}>
      <AlertCircle size={11} /> {label}
    </span>
  )
}

export default function AssignmentsPage() {
  const p = STUDENT_PROFILE
  const [tab, setTab] = useState<Tab>("all")
  const [selected, setSelected] = useState<Assignment | null>(null)

  const filtered = ASSIGNMENTS.filter((a) => {
    if (tab === "all") return true
    if (tab === "pending") return a.status === "pending" || a.status === "late"
    if (tab === "submitted") return a.status === "submitted"
    if (tab === "graded") return a.status === "graded"
    return true
  })

  const counts = {
    all: ASSIGNMENTS.length,
    pending: ASSIGNMENTS.filter((a) => a.status === "pending" || a.status === "late").length,
    submitted: ASSIGNMENTS.filter((a) => a.status === "submitted").length,
    graded: ASSIGNMENTS.filter((a) => a.status === "graded").length,
  }

  const gradedAssignments = ASSIGNMENTS.filter((a) => a.grade !== undefined)
  const avgGrade = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((s, a) => s + (a.grade! / a.maxGrade) * 100, 0) / gradedAssignments.length)
    : 0

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-6 max-w-6xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Assignments</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            {counts.pending} pending · {counts.graded} graded · avg grade {avgGrade}%
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Assigned", value: ASSIGNMENTS.length, color: "#3B82F6" },
            { label: "Pending", value: counts.pending, color: "#F59E0B" },
            { label: "Submitted", value: counts.submitted, color: "#8B5CF6" },
            { label: "Avg. Grade", value: `${avgGrade}%`, color: "#10B981" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <p className="text-xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor: "#1E293B", border: "1px solid #334155", display: "inline-flex" }}>
          {(["all", "pending", "submitted", "graded"] as Tab[]).map((t) => (
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
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: tab === t ? "rgba(255,255,255,0.2)" : "#33415540",
                  color: tab === t ? "#fff" : "#64748B",
                }}
              >
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment list */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
                <ClipboardList size={36} className="mx-auto mb-3" style={{ color: "#334155" }} />
                <p className="text-sm" style={{ color: "#475569" }}>No assignments in this category</p>
              </div>
            ) : filtered.map((a) => {
              const sc = statusConfig[a.status]
              const StatusIcon = sc.icon
              const isSelected = selected?.id === a.id
              return (
                <button
                  key={a.id}
                  className="w-full rounded-2xl p-4 text-left transition-all"
                  style={{
                    backgroundColor: "#1E293B",
                    border: `1px solid ${isSelected ? "#3B82F6" : "#334155"}`,
                  }}
                  onClick={() => setSelected(isSelected ? null : a)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: `${typeColors[a.type]}15` }}
                    >
                      <ClipboardList size={16} style={{ color: typeColors[a.type] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-white">{a.title}</span>
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${typeColors[a.type]}15`, color: typeColors[a.type] }}
                        >
                          {typeLabels[a.type]}
                        </span>
                      </div>
                      <p className="text-xs mb-2" style={{ color: "#64748B" }}>{a.courseName}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: sc.color }}
                        >
                          <StatusIcon size={12} /> {sc.label}
                        </span>
                        <DaysLeft dueDate={a.dueDate} status={a.status} />
                        {a.grade !== undefined && (
                          <span className="text-xs font-bold" style={{ color: a.grade >= 80 ? "#10B981" : a.grade >= 60 ? "#F59E0B" : "#EF4444" }}>
                            {a.grade}/{a.maxGrade} pts
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      style={{
                        color: "#64748B",
                        transform: isSelected ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </div>

                  {/* Expanded detail */}
                  {isSelected && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid #334155" }}>
                      <p className="text-sm mb-3" style={{ color: "#94A3B8" }}>{a.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs" style={{ color: "#64748B" }}>
                          Due: <strong className="text-white">{a.dueDate}</strong>
                        </span>
                        {a.submittedDate && (
                          <span className="text-xs" style={{ color: "#64748B" }}>
                            · Submitted: <strong className="text-white">{a.submittedDate}</strong>
                          </span>
                        )}
                      </div>
                      {a.attachments && a.attachments.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {a.attachments.map((att) => (
                            <button
                              key={att}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                              style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                            >
                              <Download size={12} /> {att}
                            </button>
                          ))}
                        </div>
                      )}
                      {a.feedback && (
                        <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
                          <p className="text-xs font-bold mb-1" style={{ color: "#64748B" }}>INSTRUCTOR FEEDBACK</p>
                          <p className="text-sm" style={{ color: "#94A3B8" }}>{a.feedback}</p>
                        </div>
                      )}
                      {(a.status === "pending" || a.status === "late") && (
                        <button
                          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                          style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                        >
                          <Upload size={14} /> Submit Assignment
                        </button>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Side panel: Grade summary */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <h3 className="text-sm font-bold text-white mb-4">Grade Summary</h3>
              <div className="space-y-3">
                {ASSIGNMENTS.filter((a) => a.grade !== undefined).map((a) => {
                  const pct = Math.round((a.grade! / a.maxGrade) * 100)
                  const color = pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444"
                  return (
                    <div key={a.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate mr-2" style={{ color: "#94A3B8" }}>{a.title}</span>
                        <span className="font-bold flex-shrink-0" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid #334155" }}>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#94A3B8" }}>Overall Average</span>
                  <span className="text-sm font-bold" style={{ color: avgGrade >= 80 ? "#10B981" : "#F59E0B" }}>{avgGrade}%</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <h3 className="text-sm font-bold text-white mb-3">Upcoming Deadlines</h3>
              <div className="space-y-3">
                {ASSIGNMENTS.filter((a) => a.status === "pending").slice(0, 4).map((a) => {
                  const due = new Date(a.dueDate)
                  const today = new Date("2025-06-12")
                  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const urgency = diff <= 3 ? "#EF4444" : diff <= 7 ? "#F59E0B" : "#64748B"
                  return (
                    <div key={a.id} className="flex items-center gap-3">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: urgency }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{a.title}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>{a.dueDate}</p>
                      </div>
                      <span className="text-xs font-semibold flex-shrink-0" style={{ color: urgency }}>
                        {diff === 0 ? "Today" : `${diff}d`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
