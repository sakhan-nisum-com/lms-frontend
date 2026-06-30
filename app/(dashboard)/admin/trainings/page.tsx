"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TRAINING_TRACKS } from "@/lib/data/trainings"
import { useTrainingModeration } from "@/lib/hooks/useTrainingModeration"
import { Search, GraduationCap, Users, ShieldCheck, Layers, Pencil } from "lucide-react"

export default function AdminTrainingsPage() {
  const { getContent, toggleMandatory, setDeadline } = useTrainingModeration()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "enterprise" | "academic">("all")

  const resolved = useMemo(() => TRAINING_TRACKS.map((t) => getContent(t)), [getContent])

  const filtered = resolved.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const mandatoryCount = resolved.filter((t) => t.isMandatory).length
  const totalEnrolled = resolved.reduce((sum, t) => sum + t.enrolledUsers, 0)
  const avgProgress = Math.round(resolved.reduce((sum, t) => sum + t.progress, 0) / resolved.length)

  const stats = [
    { label: "Training Tracks", value: resolved.length, icon: Layers, color: "#3B82F6" },
    { label: "Mandatory Tracks", value: mandatoryCount, icon: ShieldCheck, color: "#EF4444" },
    { label: "Total Enrolled", value: totalEnrolled.toLocaleString(), icon: Users, color: "#10B981" },
    { label: "Avg. Completion", value: `${avgProgress}%`, icon: GraduationCap, color: "#F59E0B" },
  ]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Trainings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Edit training details, manage mandatory compliance deadlines, and review content.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ backgroundColor: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search training tracks..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "enterprise", "academic"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="px-3 py-2 rounded-lg text-xs font-semibold capitalize"
                style={{
                  backgroundColor: typeFilter === t ? "var(--accent)" : "var(--bg-surface)",
                  color: typeFilter === t ? "#fff" : "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl text-xl flex-shrink-0" style={{ backgroundColor: `${t.badgeColor}15` }}>
                    {t.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/admin/trainings/${t.id}`} className="text-sm font-bold hover:underline" style={{ color: "var(--text-primary)" }}>
                        {t.title}
                      </Link>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold capitalize" style={{ backgroundColor: "#33415560", color: "var(--text-secondary)" }}>
                        {t.type}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${t.badgeColor}20`, color: t.badgeColor }}>
                        {t.category}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                      {t.courses} courses · {t.totalHours}h · {t.enrolledUsers.toLocaleString()} enrolled
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => toggleMandatory(t.id, t.isMandatory)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: t.isMandatory ? "#EF444420" : "#33415560",
                      color: t.isMandatory ? "#F87171" : "var(--text-secondary)",
                    }}
                  >
                    {t.isMandatory ? "Mandatory" : "Optional"}
                  </button>
                  {t.isMandatory && (
                    <input
                      type="date"
                      value={t.deadline ?? ""}
                      onChange={(e) => setDeadline(t.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                    />
                  )}
                  <Link
                    href={`/admin/trainings/${t.id}`}
                    title="Edit training details"
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: "#33415560", color: "var(--text-secondary)" }}
                  >
                    <Pencil size={13} />
                  </Link>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-tertiary)" }}>Average completion across enrolled users</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{t.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                  <div className="h-full rounded-full" style={{ width: `${t.progress}%`, backgroundColor: t.badgeColor }} />
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-2xl p-10 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No training tracks match these filters.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
