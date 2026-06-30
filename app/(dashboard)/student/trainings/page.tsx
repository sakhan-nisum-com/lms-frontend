"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TrainingCard } from "@/components/TrainingCard"
import { TRAINING_TRACKS } from "@/lib/data/trainings"
import { useAllTrainingProgress } from "@/lib/hooks/useTrainingProgress"
import { useTrainingEnrollments } from "@/lib/hooks/useTrainingEnrollments"
import { getTrainingProgress } from "@/lib/trainingProgress"
import {
  BookOpen, CheckCircle, AlertTriangle, BarChart3, Search, Shield, Award,
} from "lucide-react"
import { useState } from "react"

const TYPE_TABS = [
  { key: "all", label: "All Trainings" },
  { key: "enterprise", label: "Enterprise" },
  { key: "academic", label: "Academic" },
  { key: "mandatory", label: "Mandatory" },
  { key: "inprogress", label: "In Progress" },
]

export default function TrainingsPage() {
  const allProgress = useAllTrainingProgress()
  const { isEnrolled } = useTrainingEnrollments()
  const [tab, setTab] = useState("all")
  const [search, setSearch] = useState("")

  // Overlay real enrollment + module completion onto the static catalog data.
  const tracks = TRAINING_TRACKS.map((t) => {
    const enrolled = t.enrolled || isEnrolled(t.id)
    const { progressPct } = getTrainingProgress(t, allProgress)
    return { ...t, enrolled, progress: progressPct }
  })

  const mandatory = tracks.filter((t) => t.isMandatory)
  const overdue = mandatory.filter((t) => t.progress < 100 && t.deadline && new Date(t.deadline) < new Date("2026-07-01"))
  const completed = tracks.filter((t) => t.progress === 100).length
  const inProgress = tracks.filter((t) => t.enrolled && t.progress > 0 && t.progress < 100).length

  const filtered = tracks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (tab === "enterprise") return t.type === "enterprise"
    if (tab === "academic") return t.type === "academic"
    if (tab === "mandatory") return t.isMandatory
    if (tab === "inprogress") return t.enrolled && t.progress > 0 && t.progress < 100
    return true
  })

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Training Catalog</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Enterprise compliance tracks and academic development programs</p>
          </div>
          <Link
            href="/student/my-trainings"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            <Award size={15} /> My Trainings
          </Link>
        </div>

        {/* Mandatory alert */}
        {overdue.length > 0 && (
          <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: "#EF444410", border: "1px solid #EF444430" }}>
            <AlertTriangle size={18} style={{ color: "var(--danger)", flexShrink: 0 }} />
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--danger)" }}>Mandatory Training Incomplete</p>
              <p className="text-xs mt-0.5" style={{ color: "#FCA5A5" }}>
                {overdue.map((t) => t.title).join(", ")} — deadline approaching. Complete to maintain compliance status.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Programs", value: tracks.length, icon: BookOpen, color: "#3B82F6" },
            { label: "Completed", value: completed, icon: CheckCircle, color: "#10B981" },
            { label: "In Progress", value: inProgress, icon: BarChart3, color: "#F59E0B" },
            { label: "Mandatory Done", value: `${mandatory.filter((t) => t.progress === 100).length}/${mandatory.length}`, icon: Shield, color: "#8B5CF6" },
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

        {/* Tabs + search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
            {TYPE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors"
                style={{ backgroundColor: tab === t.key ? "var(--accent)" : "var(--bg-surface)", color: tab === t.key ? "#fff" : "var(--text-tertiary)", borderRight: "1px solid var(--border-default)" }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trainings..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Training track cards */}
        <div className="grid lg:grid-cols-2 gap-5">
          {filtered.map((track) => (
            <TrainingCard key={track.id} track={track} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text-tertiary)" }}>
            <p className="text-4xl mb-3">🎓</p>
            <p className="text-sm font-semibold">No training programs found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
