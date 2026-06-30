"use client"

import { useState } from "react"
import type { Assignment } from "@/lib/data/courses"
import {
  ClipboardList, AlertCircle, CheckCircle2, Clock, ChevronRight,
  Upload, Download, Star,
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

  const color = diff < 0 ? "var(--danger)" : diff <= 3 ? "var(--danger)" : diff <= 7 ? "var(--warning)" : "var(--text-secondary)"
  const label = diff < 0 ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : `${diff}d left`

  return (
    <span className="flex items-center gap-1 text-xs font-medium" style={{ color }}>
      <AlertCircle size={11} /> {label}
    </span>
  )
}

export function CourseAssignments({ assignments }: { assignments: Assignment[] }) {
  const [tab, setTab] = useState<Tab>("all")
  const [selected, setSelected] = useState<Assignment | null>(null)

  if (assignments.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
        <ClipboardList size={36} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No assignments for this course yet.</p>
      </div>
    )
  }

  const filtered = assignments.filter((a) => {
    if (tab === "all") return true
    if (tab === "pending") return a.status === "pending" || a.status === "late"
    if (tab === "submitted") return a.status === "submitted"
    if (tab === "graded") return a.status === "graded"
    return true
  })

  const counts = {
    all: assignments.length,
    pending: assignments.filter((a) => a.status === "pending" || a.status === "late").length,
    submitted: assignments.filter((a) => a.status === "submitted").length,
    graded: assignments.filter((a) => a.status === "graded").length,
  }

  const gradedAssignments = assignments.filter((a) => a.grade !== undefined)
  const avgGrade = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((s, a) => s + (a.grade! / a.maxGrade) * 100, 0) / gradedAssignments.length)
    : 0

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Assigned", value: assignments.length, color: "#3B82F6" },
          { label: "Pending", value: counts.pending, color: "#F59E0B" },
          { label: "Submitted", value: counts.submitted, color: "#8B5CF6" },
          { label: "Avg. Grade", value: `${avgGrade}%`, color: "#10B981" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", display: "inline-flex" }}>
        {(["all", "pending", "submitted", "graded"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
            style={{
              backgroundColor: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "#fff" : "var(--text-secondary)",
            }}
          >
            {t}
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: tab === t ? "rgba(255,255,255,0.2)" : "#33415540",
                color: tab === t ? "#fff" : "var(--text-tertiary)",
              }}
            >
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Assignment list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-10 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
            <ClipboardList size={36} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No assignments in this category</p>
          </div>
        ) : filtered.map((a) => {
          const sc = statusConfig[a.status]
          const StatusIcon = sc.icon
          const isSelected = selected?.id === a.id
          return (
            <button
              key={a.id}
              className="w-full rounded-2xl p-4 text-left transition-all shadow-sm"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-default)"}`,
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
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{a.title}</span>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${typeColors[a.type]}15`, color: typeColors[a.type] }}
                    >
                      {typeLabels[a.type]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="flex items-center gap-1 text-xs font-semibold"
                      style={{ color: sc.color }}
                    >
                      <StatusIcon size={12} /> {sc.label}
                    </span>
                    <DaysLeft dueDate={a.dueDate} status={a.status} />
                    {a.grade !== undefined && (
                      <span className="text-xs font-bold" style={{ color: a.grade >= 80 ? "var(--success)" : a.grade >= 60 ? "var(--warning)" : "var(--danger)" }}>
                        {a.grade}/{a.maxGrade} pts
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={15}
                  style={{
                    color: "var(--text-tertiary)",
                    transform: isSelected ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </div>

              {/* Expanded detail */}
              {isSelected && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-default)" }}>
                  <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{a.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      Due: <strong style={{ color: "var(--text-primary)" }}>{a.dueDate}</strong>
                    </span>
                    {a.submittedDate && (
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        · Submitted: <strong style={{ color: "var(--text-primary)" }}>{a.submittedDate}</strong>
                      </span>
                    )}
                  </div>
                  {a.attachments && a.attachments.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {a.attachments.map((att) => (
                        <button
                          key={att}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                        >
                          <Download size={12} /> {att}
                        </button>
                      ))}
                    </div>
                  )}
                  {a.feedback && (
                    <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
                      <p className="text-xs font-bold mb-1" style={{ color: "var(--text-tertiary)" }}>INSTRUCTOR FEEDBACK</p>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{a.feedback}</p>
                    </div>
                  )}
                  {(a.status === "pending" || a.status === "late") && (
                    <button
                      className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: "var(--accent)", color: "#fff" }}
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
    </div>
  )
}
