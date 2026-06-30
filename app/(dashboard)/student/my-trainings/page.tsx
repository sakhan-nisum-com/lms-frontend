"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TrainingCard } from "@/components/TrainingCard"
import { TRAINING_TRACKS } from "@/lib/data/trainings"
import type { TrainingTrack } from "@/lib/data/trainings"
import { useAllTrainingProgress } from "@/lib/hooks/useTrainingProgress"
import { useTrainingEnrollments } from "@/lib/hooks/useTrainingEnrollments"
import { getTrainingProgress } from "@/lib/trainingProgress"
import { Compass, BookOpen, CheckCircle, BarChart3, Shield } from "lucide-react"

type Tab = "all" | "in-progress" | "completed" | "not-started"

export default function MyTrainingsPage() {
  const allProgress = useAllTrainingProgress()
  const { isEnrolled } = useTrainingEnrollments()
  const [tab, setTab] = useState<Tab>("all")
  const [category, setCategory] = useState<TrainingTrack["category"] | "all">("all")

  // Overlay real enrollment + module completion onto the static catalog data.
  const enrolled = TRAINING_TRACKS
    .filter((t) => t.enrolled || isEnrolled(t.id))
    .map((t) => ({ ...t, progress: getTrainingProgress(t, allProgress).progressPct }))

  const categories = Array.from(new Set(enrolled.map((t) => t.category)))

  const byCategory = category === "all" ? enrolled : enrolled.filter((t) => t.category === category)

  const filtered = byCategory.filter((t) => {
    if (tab === "in-progress") return t.progress > 0 && t.progress < 100
    if (tab === "completed") return t.progress === 100
    if (tab === "not-started") return t.progress === 0
    return true
  })

  const counts = {
    all: byCategory.length,
    "in-progress": byCategory.filter((t) => t.progress > 0 && t.progress < 100).length,
    completed: byCategory.filter((t) => t.progress === 100).length,
    "not-started": byCategory.filter((t) => t.progress === 0).length,
  }

  const mandatoryDone = enrolled.filter((t) => t.isMandatory && t.progress === 100).length
  const mandatoryTotal = enrolled.filter((t) => t.isMandatory).length

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>My Trainings</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {enrolled.length} enrolled · {counts.completed} completed · {counts["in-progress"]} in progress
            </p>
          </div>
          <Link
            href="/student/trainings"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            <Compass size={15} /> Browse Catalog
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Enrolled Programs", value: enrolled.length, icon: BookOpen, color: "#3B82F6" },
            { label: "Completed", value: counts.completed, icon: CheckCircle, color: "#10B981" },
            { label: "In Progress", value: counts["in-progress"], icon: BarChart3, color: "#F59E0B" },
            { label: "Mandatory Done", value: `${mandatoryDone}/${mandatoryTotal}`, icon: Shield, color: "#8B5CF6" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl p-4 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{value}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setCategory("all")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
              style={{
                backgroundColor: category === "all" ? "var(--accent)" : "var(--bg-surface)",
                color: category === "all" ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${category === "all" ? "var(--accent)" : "var(--border-default)"}`,
              }}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                style={{
                  backgroundColor: category === c ? "var(--accent)" : "var(--bg-surface)",
                  color: category === c ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${category === c ? "var(--accent)" : "var(--border-default)"}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Status tabs */}
        <div className="flex items-center gap-1 rounded-xl p-1 w-fit shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {(["all", "in-progress", "completed", "not-started"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: tab === t ? "var(--accent)" : "transparent",
                color: tab === t ? "#fff" : "var(--text-secondary)",
              }}
            >
              {t === "all" ? "All" : t === "in-progress" ? "In Progress" : t === "completed" ? "Completed" : "Not Started"}
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

        {/* Training cards */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
            <BookOpen size={36} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No training programs in this category</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">
            {filtered.map((track) => (
              <TrainingCard key={track.id} track={track} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
