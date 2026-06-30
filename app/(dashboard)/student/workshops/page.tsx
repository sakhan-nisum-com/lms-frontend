"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { WorkshopCard, KIND_META } from "@/components/WorkshopCard"
import { WorkshopPaymentModal } from "@/components/WorkshopPaymentModal"
import { WORKSHOPS } from "@/lib/data/workshops"
import type { Workshop, WorkshopKind } from "@/lib/data/workshops"
import { useWorkshopRegistrations } from "@/lib/hooks/useWorkshopRegistrations"
import { Search, CalendarCheck } from "lucide-react"
import { useState } from "react"

const KINDS = Object.keys(KIND_META) as WorkshopKind[]

export default function WorkshopsPage() {
  const { registeredIds, isRegistered, toggleRegistration } = useWorkshopRegistrations()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "registered">("all")
  const [kind, setKind] = useState<WorkshopKind | "all">("all")
  const [pendingWorkshop, setPendingWorkshop] = useState<Workshop | null>(null)

  const filtered = WORKSHOPS.filter((w) => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) || w.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter = filter === "all" || (filter === "registered" && registeredIds.has(w.id))
    const matchesKind = kind === "all" || w.kind === kind
    return matchesSearch && matchesFilter && matchesKind
  })

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Workshops</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Intensive hands-on sessions with expert instructors</p>
          </div>
          <Link
            href="/student/my-workshops"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            <CalendarCheck size={15} /> My Workshops
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Upcoming", value: WORKSHOPS.length, color: "#3B82F6" },
            { label: "Registered", value: registeredIds.size, color: "#10B981" },
            { label: "Completed", value: 2, color: "#F59E0B" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Kind filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setKind("all")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
            style={{
              backgroundColor: kind === "all" ? "var(--accent)" : "var(--bg-surface)",
              color: kind === "all" ? "#fff" : "var(--text-secondary)",
              border: `1px solid ${kind === "all" ? "var(--accent)" : "var(--border-default)"}`,
            }}
          >
            All Kinds
          </button>
          {KINDS.map((k) => {
            const Icon = KIND_META[k].icon
            return (
              <button
                key={k}
                onClick={() => setKind(k)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                style={{
                  backgroundColor: kind === k ? KIND_META[k].color : "var(--bg-surface)",
                  color: kind === k ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${kind === k ? KIND_META[k].color : "var(--border-default)"}`,
                }}
              >
                <Icon size={12} /> {KIND_META[k].label}
              </button>
            )
          })}
        </div>

        {/* Filters + search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
            {(["all", "registered"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 text-xs font-semibold capitalize transition-colors"
                style={{ backgroundColor: filter === f ? "var(--accent)" : "var(--bg-surface)", color: filter === f ? "#fff" : "var(--text-tertiary)", borderRight: "1px solid var(--border-default)" }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workshops..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Workshop cards */}
        <div className="grid lg:grid-cols-2 gap-5">
          {filtered.map((ws) => (
            <WorkshopCard
              key={ws.id}
              workshop={ws}
              isRegistered={isRegistered(ws.id)}
              onToggleRegister={() => toggleRegistration(ws.id)}
              onBuyOrRegister={() => setPendingWorkshop(ws)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text-tertiary)" }}>
            <p className="text-4xl mb-3">🔧</p>
            <p className="text-sm font-semibold">No workshops found</p>
          </div>
        )}
      </div>

      {pendingWorkshop && (
        <WorkshopPaymentModal
          workshop={pendingWorkshop}
          onClose={() => setPendingWorkshop(null)}
          onSuccess={() => {
            toggleRegistration(pendingWorkshop.id)
            setPendingWorkshop(null)
          }}
        />
      )}
    </DashboardLayout>
  )
}
